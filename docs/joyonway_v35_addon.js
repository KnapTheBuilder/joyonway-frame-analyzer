/* 2026-05-19 V3.5.1 addon | Multi-model interpretation engine - enriched
 * Christophe / KnapTheBuilder
 *
 * NEW IN V3.5 vs V3.4:
 *   - P69B133: complete mapping for B4 broadcast + B5 filtration schedules +
 *     A1 setpoint cmd + A1 pump cmd + AE light cmd + A4 filtration schedule cmd
 *     (based on Gaet78 protocol.md decode)
 *   - P25B85: heating stages enum refined (3 stages decode)
 *   - P23B32: detection of A1 sub-commands (light/pump/filtration/bubbler)
 *     based on Christophe's spa_cmd.sh validated frames
 *   - P25B37, P20B29, P68B123: explicit "no public mapping" with link to
 *     GitHub issues for community contribution
 */
(function () {

  // =========================================================================
  // SECTION 1: BIT NAMES
  // =========================================================================
  const BITS = {
    p23b32_b14: { 0: 'FILTRATION', 3: 'BUBBLER', 4: 'HEATER', 5: 'always-1 (P23B32 marker)' },
    p23b32_b12: { 4: 'PUMP LEFT' },
    p23b32_b17: { 7: 'RUNNING' },
    p69b133_b12: { 2: 'PUMP 1 (jets)', 4: 'PUMP 2 (jets)' },
    p69b133_b17: { 0: 'LIGHT' },
    p25b85_b13: { 1: 'FILTRATION', 2: 'MASSAGE PUMP' },
    p25b85_b14: { 0: 'LIGHT' },
    p25b85_b18: { 0: 'LIGHT mirror', 7: 'EQUIPMENT active' },
    p25b85_b29: { 5: 'UV / OZONE' },
  };

  // =========================================================================
  // SECTION 2: DETECTORS
  // =========================================================================
  function hasSig(f, sig, offset) {
    offset = offset || 0;
    if (!f.bytes || f.bytes.length < sig.length + offset) return false;
    for (let i = 0; i < sig.length; i++) {
      if (f.bytes[offset + i] !== sig[i]) return false;
    }
    return true;
  }

  function isP23B32B4(f) {
    return hasSig(f, [0x1A, 0xFF, 0x01, 0x3C, 0xD2, 0xB4, 0xFF, 0x08])
      && f.bytes.length >= 60 && f.bytes.length <= 90;
  }
  function isP25B85B4(f) {
    return hasSig(f, [0x1A, 0xFF, 0x01, 0x3C, 0xD2, 0xB4, 0xFF, 0x08])
      && f.bytes.length > 90;
  }
  function isP23B32A1(f) {
    return f.bytes.length >= 20 && f.bytes.length <= 22
      && f.bytes[0] === 0x1A && f.bytes[5] === 0xA1
      && f.bytes[7] === 0xA1;
  }
  function isP69B133B4(f) {
    return f.bytes.length >= 24
      && f.bytes[0] === 0x7E
      && f.bytes[f.bytes.length - 1] === 0x7E
      && f.bytes[2] === 0xF9 && f.bytes[3] === 0xBF && f.bytes[4] === 0xB4;
  }
  function isP69B133B5(f) {
    return f.bytes.length >= 24
      && f.bytes[0] === 0x7E
      && f.bytes[f.bytes.length - 1] === 0x7E
      && f.bytes[2] === 0xF9 && f.bytes[3] === 0xBF && f.bytes[4] === 0xB5;
  }
  function isP69B133Cmd(f, cmdByte) {
    return f.bytes.length >= 14
      && f.bytes[0] === 0x7E
      && f.bytes[f.bytes.length - 1] === 0x7E
      && f.bytes[2] === 0x20 && f.bytes[3] === 0xBF && f.bytes[4] === cmdByte;
  }

  // P23B32 sub-command identification based on Christophe's spa_cmd.sh validated frames
  function p23b32A1SubType(f) {
    if (!isP23B32A1(f)) return null;
    const b8 = f.bytes[8];
    const b16 = f.bytes[16];
    // Light: byte 8 = 0x00, byte 16 = 0x80 (off) or 0x81 (on)
    if (b8 === 0x00 && (b16 === 0x80 || b16 === 0x81)) {
      return b16 === 0x81 ? 'light_on' : 'light_off';
    }
    // Pump left: byte 8 = 0x06
    if (b8 === 0x06) {
      return f.bytes[9] === 0x04 ? 'pump_left_on' : 'pump_left_off';
    }
    // Pump right: byte 8 = 0x18
    if (b8 === 0x18) {
      return f.bytes[9] === 0x10 ? 'pump_right_on' : 'pump_right_off';
    }
    // Filtration: byte 8 = 0x62 (on) or 0x50 (off)
    if (b8 === 0x62) return 'filtration_on';
    if (b8 === 0x50) return 'filtration_off';
    // Setpoint: byte 10-13 = 80 80 02 04 (signature)
    if (f.bytes[10] === 0x80 && f.bytes[11] === 0x80 && f.bytes[12] === 0x02 && f.bytes[13] === 0x04) {
      return 'setpoint';
    }
    return 'unknown_a1';
  }

  // =========================================================================
  // SECTION 3: MODELS
  // =========================================================================
  const MODELS = {
    P23B32_B4: {
      name: 'P23B32 / Mesda - B4 broadcast',
      detect: isP23B32B4,
      fields: {
        0:  { name: 'Start delim', type: 'fixed', expected: 0x1A },
        1:  { name: 'Dst addr', type: 'addr' },
        2:  { name: 'Src addr', type: 'addr' },
        5:  { name: 'CMD', type: 'cmd' },
        9:  { name: 'Water temp', type: 'tempF' },
        12: { name: 'Pump flags', type: 'bitmask', bits: BITS.p23b32_b12 },
        13: { name: 'Separator', type: 'fixed', expected: 0xF5 },
        14: { name: 'Equipment flags', type: 'bitmask', bits: BITS.p23b32_b14 },
        16: { name: 'Setpoint', type: 'tempF' },
        17: { name: 'Status flags', type: 'bitmask', bits: BITS.p23b32_b17 },
        30: { name: 'Pump mirror', type: 'bitmask', bits: BITS.p23b32_b12 },
        31: { name: 'Equipment mirror', type: 'bitmask', bits: BITS.p23b32_b14 },
      },
    },
    P23B32_A1: {
      name: 'P23B32 - A1 command (panel -> controller)',
      detect: isP23B32A1,
      subTypes: {
        light_on:        'Light ON command',
        light_off:       'Light OFF command',
        pump_left_on:    'Pump LEFT ON command',
        pump_left_off:   'Pump LEFT OFF command',
        pump_right_on:   'Pump RIGHT ON command',
        pump_right_off:  'Pump RIGHT OFF command',
        filtration_on:   'Filtration ON command',
        filtration_off:  'Filtration OFF command',
        setpoint:        'Setpoint change command',
        unknown_a1:      'Unknown A1 sub-command',
      },
      detectSubType: p23b32A1SubType,
      fields: {
        0:  { name: 'Start delim', type: 'fixed', expected: 0x1A },
        1:  { name: 'Dst addr', type: 'addr' },
        2:  { name: 'Src addr (panel)', type: 'addr' },
        5:  { name: 'CMD (A1)', type: 'cmd' },
        8:  { name: 'Action mask byte', type: 'hex', help: '0x00=light, 0x06=pump_left, 0x18=pump_right, 0x62=filtration_on, 0x50=filtration_off, signature setpoint follows' },
        9:  { name: 'Action state byte', type: 'hex' },
        15: { name: 'Setpoint target (if setpoint cmd)', type: 'tempF' },
        16: { name: 'Light state (if light cmd)', type: 'hex', help: '0x80=off, 0x81=on' },
      },
      crcRange: [17, 20], // 3 bytes CRC then 1D delim
    },
    P25B85: {
      name: 'P25B85 / Alex (longer B4 broadcast)',
      detect: isP25B85B4,
      fields: {
        0:  { name: 'Start delim', type: 'fixed', expected: 0x1A },
        5:  { name: 'CMD', type: 'cmd' },
        9:  { name: 'Water temp', type: 'tempF' },
        13: { name: 'Filt/Massage flags', type: 'bitmask', bits: BITS.p25b85_b13 },
        14: { name: 'Light flag', type: 'bitmask', bits: BITS.p25b85_b14 },
        15: { name: 'Heating stage', type: 'enum', values: {
          0x40: 'heater cooling (post-heat)',
          0x50: 'circulation pump only (pre-heat phase)',
          0x54: 'heater ACTIVE',
          0xC1: 'UV / ozone active mode',
        }},
        16: { name: 'Setpoint', type: 'tempF' },
        18: { name: 'Status flags', type: 'bitmask', bits: BITS.p25b85_b18 },
        28: { name: 'Filt/Massage mirror', type: 'bitmask', bits: BITS.p25b85_b13 },
        29: { name: 'UV/Ozone', type: 'bitmask', bits: BITS.p25b85_b29 },
      },
    },
    P69B133_B4: {
      name: 'P69B133 / Gaet78 - B4 broadcast (status)',
      detect: isP69B133B4,
      fields: {
        0:  { name: 'Start delim', type: 'fixed', expected: 0x7E },
        1:  { name: 'Length', type: 'int' },
        2:  { name: 'Src marker', type: 'fixed', expected: 0xF9 },
        3:  { name: 'Header', type: 'fixed', expected: 0xBF },
        4:  { name: 'CMD', type: 'cmd' },
        9:  { name: 'Water temp', type: 'tempF' },
        12: { name: 'Pump flags', type: 'bitmask', bits: BITS.p69b133_b12 },
        14: { name: 'Heating mode', type: 'enum', values: {
          0x20: 'OFF',
          0x21: 'Heat pump (PAC) alone or recirculation',
          0x35: 'Heat pump + electric boiler',
        }},
        16: { name: 'Setpoint', type: 'tempF' },
        17: { name: 'Mode + Light', type: 'modeLight' },
        19: { name: 'Pump mirror (+1 offset)', type: 'hex' },
        20: { name: 'Programme flag', type: 'enum', values: {
          0x10: 'PROGRAMME mode active',
          0x30: 'NORMAL mode',
        }},
        21: { name: 'Heat pump output temp', type: 'tempF', note: 'Should be ~2C above water temp when PAC is running' },
        25: { name: 'CRC-8', type: 'crc' },
      },
    },
    P69B133_B5: {
      name: 'P69B133 / Gaet78 - B5 broadcast (filtration schedules)',
      detect: isP69B133B5,
      fields: {
        0:  { name: 'Start delim', type: 'fixed', expected: 0x7E },
        2:  { name: 'Src marker', type: 'fixed', expected: 0xF9 },
        3:  { name: 'Header', type: 'fixed', expected: 0xBF },
        4:  { name: 'CMD (B5=filtration)', type: 'cmd' },
        17: { name: 'Slot1 active + start hour', type: 'schedule_start1' },
        18: { name: 'Slot1 start min', type: 'minute' },
        19: { name: 'Slot1 end hour', type: 'hour' },
        20: { name: 'Slot1 end min', type: 'minute' },
        21: { name: 'Slot2 active + start hour', type: 'schedule_start2' },
        22: { name: 'Slot2 start min', type: 'minute' },
        23: { name: 'Slot2 end hour', type: 'hour' },
        24: { name: 'Slot2 end min', type: 'minute' },
        25: { name: 'CRC-8', type: 'crc' },
      },
    },
    P69B133_A1_SETPOINT: {
      name: 'P69B133 - A1 setpoint command',
      detect: (f) => isP69B133Cmd(f, 0xA1)
        && f.bytes.length >= 18
        && f.bytes[9] === 0x80 && f.bytes[10] === 0x80
        && f.bytes[11] === 0x02 && f.bytes[12] === 0x04,
      fields: {
        4:  { name: 'CMD (A1)', type: 'cmd' },
        9:  { name: 'Setpoint signature', type: 'fixed', expected: 0x80 },
        13: { name: 'Setpoint target', type: 'tempF' },
      },
    },
    P69B133_A1_PUMP: {
      name: 'P69B133 - A1 pump command',
      detect: (f) => isP69B133Cmd(f, 0xA1)
        && f.bytes.length >= 18
        && (f.bytes[10] === 0x00 && f.bytes[11] === 0x00),
      fields: {
        4:  { name: 'CMD (A1)', type: 'cmd' },
        8:  { name: 'Pump mask', type: 'enum', values: { 0x04: 'PUMP 1 (jets)', 0x10: 'PUMP 2 (jets)' } },
        9:  { name: 'Pump state', type: 'enum', values: { 0x00: 'OFF', 0x04: 'PUMP 1 ON', 0x10: 'PUMP 2 ON' } },
      },
    },
    P69B133_AE: {
      name: 'P69B133 - AE light command',
      detect: (f) => isP69B133Cmd(f, 0xAE),
      fields: {
        4:  { name: 'CMD (AE)', type: 'cmd' },
        6:  { name: 'Light state', type: 'enum', values: { 0x00: 'Light OFF', 0x11: 'Light ON' } },
      },
    },
    P69B133_A4: {
      name: 'P69B133 - A4 filtration schedule command',
      detect: (f) => isP69B133Cmd(f, 0xA4),
      fields: {
        4:  { name: 'CMD (A4)', type: 'cmd' },
        9:  { name: 'Schedule flag', type: 'enum', values: {
          0x22: 'Slot 1 - activate + modify',
          0x12: 'Slot 1 - deactivate',
          0x88: 'Slot 2 - activate + modify',
          0x48: 'Slot 2 - deactivate',
        }},
        10: { name: 'Slot1 start hour', type: 'hour' },
        11: { name: 'Slot1 start min', type: 'minute' },
        12: { name: 'Slot1 end hour', type: 'hour' },
        13: { name: 'Slot1 end min', type: 'minute' },
        14: { name: 'Slot2 start hour', type: 'hour' },
        15: { name: 'Slot2 start min', type: 'minute' },
        16: { name: 'Slot2 end hour', type: 'hour' },
        17: { name: 'Slot2 end min', type: 'minute' },
      },
    },
    P25B37: {
      name: 'P25B37 (short frame, no public mapping)',
      detect: (f) => f.bytes.length >= 4 && f.bytes.length <= 18
        && !isP23B32B4(f) && !isP25B85B4(f) && !isP23B32A1(f)
        && !isP69B133B4(f) && !isP69B133B5(f)
        && f.bytes[0] !== 0x7E && f.bytes[0] !== 0x1A
        && (f.bytes[0] & 0xF0) === 0x60,
      fields: {},
      note: 'No public mapping available. Forum samples show frames of 5/9/17 bytes starting with 0x64-0x67. Likely byte0=device_id, byte1=cmd_or_length, last byte=CRC. Contribute decode at github.com/KnapTheBuilder/joyonway-frame-analyzer/issues',
    },
    P20B29: {
      name: 'P20B29 (Yannick - no public mapping, 9600 baud)',
      detect: (f) => f.bytes.length >= 4 && f.bytes.length <= 30
        && !isP23B32B4(f) && !isP25B85B4(f) && !isP23B32A1(f)
        && !isP69B133B4(f) && !isP69B133B5(f)
        && f.bytes[0] !== 0x7E && f.bytes[0] !== 0x1A,
      fields: {},
      note: 'No public mapping. Yannick forum captures show patterns 64 4B 80 / 65 4B 90 / 66 4B 90 at 9600 baud. Format is different from P23B32/P69B133. Contribute decode at github.com/KnapTheBuilder/joyonway-frame-analyzer/issues',
    },
    P68B123: {
      name: 'P68B123 (no data available)',
      detect: () => false, // Never matches without actual frame data
      fields: {},
      note: 'No public protocol info available for this model. If you have a P68B123, please share captures at github.com/KnapTheBuilder/joyonway-frame-analyzer/issues',
    },
    UNKNOWN: {
      name: 'Unknown protocol',
      detect: () => true,
      fields: {},
    },
  };

  function detectModel(frame) {
    for (const [key, m] of Object.entries(MODELS)) {
      if (m.detect(frame)) return { key, model: m };
    }
    return { key: 'UNKNOWN', model: MODELS.UNKNOWN };
  }

  // =========================================================================
  // SECTION 4: DECODE HELPERS
  // =========================================================================
  function decodeBitmask(val, bits) {
    const active = [];
    for (const [bitStr, label] of Object.entries(bits)) {
      const bit = parseInt(bitStr);
      if (val & (1 << bit)) active.push(label);
    }
    return active.length ? active.join(' + ') : 'all clear';
  }

  function decodeField(val, fieldDef) {
    if (fieldDef.type === 'tempF') {
      const c = ((val - 32) * 5 / 9).toFixed(1);
      const note = fieldDef.note ? ' [' + fieldDef.note + ']' : '';
      return `${val} F = ${c} C${note}`;
    }
    if (fieldDef.type === 'bitmask') {
      return decodeBitmask(val, fieldDef.bits);
    }
    if (fieldDef.type === 'enum') {
      return fieldDef.values[val] || `unknown value 0x${val.toString(16)}`;
    }
    if (fieldDef.type === 'fixed') {
      return val === fieldDef.expected ? 'OK (as expected)' : `UNEXPECTED (expected 0x${fieldDef.expected.toString(16).toUpperCase()})`;
    }
    if (fieldDef.type === 'addr') {
      if (val === 0xFF) return 'broadcast (0xFF)';
      if (val === 0x01) return 'controller (0x01)';
      if (val === 0x30) return 'panel (0x30)';
      if (val === 0x20) return 'panel slot 0x20';
      return `addr 0x${val.toString(16)}`;
    }
    if (fieldDef.type === 'cmd') {
      const labels = {
        0xB4: 'broadcast status',
        0xB5: 'filtration broadcast',
        0xA1: 'setpoint OR pump cmd',
        0xA4: 'filtration schedule cmd',
        0xA5: 'module poll',
        0xAA: 'module heartbeat',
        0xAE: 'light cmd',
        0x2E: 'controller poll',
      };
      return labels[val] || `unknown CMD 0x${val.toString(16)}`;
    }
    if (fieldDef.type === 'crc') return 'CRC component (variable)';
    if (fieldDef.type === 'int') return `${val}`;
    if (fieldDef.type === 'hex') {
      const help = fieldDef.help ? ' [' + fieldDef.help + ']' : '';
      return `0x${val.toString(16).toUpperCase().padStart(2, '0')}${help}`;
    }
    if (fieldDef.type === 'modeLight') {
      const light = (val & 0x01) ? 'LIGHT ON' : 'light off';
      const mode = (val & 0xFE) === 0x90 ? 'mode NORMAL'
                : (val & 0xFE) === 0x10 ? 'mode PROGRAMME'
                : `unknown mode (high bits 0x${(val & 0xFE).toString(16)})`;
      return `${mode} | ${light}`;
    }
    if (fieldDef.type === 'schedule_start1') {
      const active = (val & 0xC0) === 0xC0;
      const hour = val & 0x3F;
      return `slot1 ${active ? 'ACTIVE' : 'inactive'}, start ${hour.toString().padStart(2, '0')}h`;
    }
    if (fieldDef.type === 'schedule_start2') {
      const active = (val & 0x40) !== 0;
      const hour = val & 0x3F;
      return `slot2 ${active ? 'ACTIVE' : 'inactive'}, start ${hour.toString().padStart(2, '0')}h`;
    }
    if (fieldDef.type === 'hour') return `${val}h`;
    if (fieldDef.type === 'minute') return `${val}min`;
    return '';
  }

  function decodeFrameForDisplay(frame) {
    const det = detectModel(frame);
    const out = {
      modelKey: det.key,
      modelName: det.model.name,
      modelNote: det.model.note || '',
      fields: [],
      subType: null,
      subTypeLabel: null,
    };
    if (det.model.detectSubType) {
      const st = det.model.detectSubType(frame);
      out.subType = st;
      out.subTypeLabel = det.model.subTypes ? det.model.subTypes[st] : st;
    }
    for (const [posStr, fieldDef] of Object.entries(det.model.fields)) {
      const pos = parseInt(posStr);
      if (pos >= frame.bytes.length) continue;
      const val = frame.bytes[pos];
      out.fields.push({
        pos, name: fieldDef.name, value: val,
        decoded: decodeField(val, fieldDef), type: fieldDef.type,
      });
    }
    return out;
  }

  // =========================================================================
  // SECTION 5: DIFF ANNOTATIONS
  // =========================================================================
  function annotateDiff(refFrame, selFrame) {
    const det = detectModel(refFrame);
    const fields = det.model.fields;
    const minLen = Math.min(refFrame.bytes.length, selFrame.bytes.length);
    const out = [];

    for (let j = 0; j < minLen; j++) {
      if (refFrame.bytes[j] === selFrame.bytes[j]) continue;
      const refVal = refFrame.bytes[j];
      const selVal = selFrame.bytes[j];
      const fieldDef = fields[j];
      let note = '';

      if (fieldDef) {
        if (fieldDef.type === 'tempF') {
          const refC = ((refVal - 32) * 5 / 9).toFixed(1);
          const selC = ((selVal - 32) * 5 / 9).toFixed(1);
          const delta = (parseFloat(selC) - parseFloat(refC)).toFixed(1);
          note = `${fieldDef.name}: ${refC}C -> ${selC}C  (delta ${delta > 0 ? '+' : ''}${delta}C)`;
        } else if (fieldDef.type === 'bitmask') {
          const refBits = [], selBits = [];
          for (const [bitStr, label] of Object.entries(fieldDef.bits)) {
            const bit = parseInt(bitStr);
            if (refVal & (1 << bit)) refBits.push(label);
            if (selVal & (1 << bit)) selBits.push(label);
          }
          const added = selBits.filter(b => !refBits.includes(b));
          const removed = refBits.filter(b => !selBits.includes(b));
          const parts = [];
          if (added.length) parts.push('+ ' + added.join(', + '));
          if (removed.length) parts.push('- ' + removed.join(', - '));
          note = `${fieldDef.name}: ${parts.join(' / ') || 'bits changed (no named bits)'}`;
        } else if (fieldDef.type === 'enum') {
          const refDec = fieldDef.values[refVal] || `unknown 0x${refVal.toString(16)}`;
          const selDec = fieldDef.values[selVal] || `unknown 0x${selVal.toString(16)}`;
          note = `${fieldDef.name}: ${refDec} -> ${selDec}`;
        } else if (fieldDef.type === 'modeLight') {
          const dec = (v) => `${(v & 0xFE) === 0x90 ? 'NORMAL' : (v & 0xFE) === 0x10 ? 'PROGRAMME' : 'unknown'}|${(v & 0x01) ? 'LIGHT_ON' : 'light_off'}`;
          note = `${fieldDef.name}: ${dec(refVal)} -> ${dec(selVal)}`;
        } else if (fieldDef.type === 'schedule_start1') {
          const dec = (v) => `${(v & 0xC0) === 0xC0 ? 'active' : 'inactive'}@${(v & 0x3F).toString().padStart(2,'0')}h`;
          note = `${fieldDef.name}: ${dec(refVal)} -> ${dec(selVal)}`;
        } else if (fieldDef.type === 'schedule_start2') {
          const dec = (v) => `${(v & 0x40) ? 'active' : 'inactive'}@${(v & 0x3F).toString().padStart(2,'0')}h`;
          note = `${fieldDef.name}: ${dec(refVal)} -> ${dec(selVal)}`;
        } else if (fieldDef.type === 'crc') {
          note = '(CRC byte - variation expected with any data change)';
        } else if (fieldDef.type === 'fixed') {
          note = `${fieldDef.name} changed (unexpected, fixed field)`;
        } else if (fieldDef.type === 'addr' || fieldDef.type === 'cmd') {
          note = `${fieldDef.name}: 0x${refVal.toString(16)} -> 0x${selVal.toString(16)}`;
        } else if (fieldDef.type === 'hour' || fieldDef.type === 'minute') {
          note = `${fieldDef.name}: ${refVal} -> ${selVal}`;
        } else {
          note = `${fieldDef.name} changed`;
        }
      }

      out.push({ pos: j, refVal, selVal, note });
    }

    return { modelName: det.model.name, modelKey: det.key, annotations: out };
  }

  // =========================================================================
  // SECTION 6: UI - PASTE CARD
  // =========================================================================
  function buildPasteCard(captureCard) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'pasteCard';
    card.innerHTML =
      '<div class="card-title" style="color:#a064ff;border-bottom-color:rgba(160,100,255,0.25)">2bis. Paste frames (V3.5)</div>' +
      '<div style="color:#8090b0;font-size:12px;margin-bottom:8px;font-family:Courier New,monospace">' +
      'Paste hex bytes directly. <b style="color:#00ff88">Capture mode</b> = scan delimiters. ' +
      '<b style="color:#a064ff">Raw mode</b> = each non-empty line is a standalone frame.</div>' +
      '<textarea id="pasteArea" placeholder="Paste hex frames here (one per line in Raw mode)" ' +
      'style="width:100%;min-height:120px;background:rgba(0,0,0,0.4);border:1px solid #a064ff;color:#e0e8ff;padding:8px;border-radius:4px;font-family:Courier New,monospace;font-size:12px;resize:vertical;box-sizing:border-box"></textarea>' +
      '<div class="controls" style="margin-top:10px">' +
      '<button class="btn btn-special" id="parsePastedCapture">Parse as capture</button>' +
      '<button class="btn btn-special" id="parsePastedRaw">Parse as raw frames</button>' +
      '<button class="btn" id="clearPaste">Clear</button>' +
      '<button class="btn" id="loadP23B32Test">P23B32 test set</button>' +
      '<button class="btn" id="loadP69B133Test">P69B133 test set</button>' +
      '<button class="btn" id="loadForumSamples">Forum samples</button>' +
      '</div>';
    captureCard.parentNode.insertBefore(card, captureCard.nextSibling);
  }

  function buildInterpretationCard() {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'interpretationCard';
    card.style.display = 'none';
    card.innerHTML =
      '<div class="card-title" style="color:#00ff88;border-bottom-color:rgba(0,255,136,0.25)">' +
      '7. Frame Interpretation <span style="font-size:10px;background:rgba(0,255,136,0.15);color:#00ff88;padding:2px 6px;border-radius:8px;margin-left:6px">V3.5 multi-model</span>' +
      '</div>' +
      '<div id="interpretationContent"></div>';
    document.querySelector('.container').appendChild(card);
  }

  function renderInterpretation() {
    if (typeof state === 'undefined') return;
    const card = document.getElementById('interpretationCard');
    const content = document.getElementById('interpretationContent');
    if (!card || !content) return;

    if (state.selectedIdx < 0 || !state.frames || !state.frames[state.selectedIdx]) {
      card.style.display = 'none';
      return;
    }
    card.style.display = 'block';

    const sel = state.frames[state.selectedIdx];
    const ref = (state.refIdx >= 0 && state.refIdx !== state.selectedIdx) ? state.frames[state.refIdx] : null;
    const selDecoded = decodeFrameForDisplay(sel);

    let html = '';
    html += '<div style="color:#00ff88;font-weight:bold;margin-bottom:10px;font-family:Courier New,monospace">';
    html += 'Detected model: ' + selDecoded.modelName;
    if (selDecoded.subTypeLabel) {
      html += '<br><span style="color:#ffd400">Sub-command: ' + selDecoded.subTypeLabel + '</span>';
    }
    html += '</div>';

    if (selDecoded.modelNote) {
      html += '<div style="color:#ffaa00;font-size:11px;margin-bottom:10px;font-family:Courier New,monospace;background:rgba(255,170,0,0.05);padding:8px;border-left:3px solid #ffaa00">';
      html += 'Note: ' + selDecoded.modelNote;
      html += '</div>';
    }

    if (selDecoded.fields.length === 0) {
      html += '<div style="color:#8090b0;font-style:italic;padding:12px;background:rgba(128,144,176,0.05);border-radius:4px">No public mapping available for this protocol. Use byte position statistics (card 6) to discover the structure manually, then contribute on GitHub.</div>';
    } else {
      html += '<table class="diff-table"><thead><tr>';
      html += '<th>Byte</th><th>Field</th><th>Hex</th><th>Decoded</th>';
      html += '</tr></thead><tbody>';
      for (const f of selDecoded.fields) {
        const hex = f.value.toString(16).padStart(2, '0').toUpperCase();
        const rowStyle = (f.type === 'crc' || f.type === 'fixed') ? ' style="opacity:0.6"' : '';
        html += '<tr' + rowStyle + '>';
        html += '<td>' + f.pos + '</td>';
        html += '<td>' + f.name + '</td>';
        html += '<td>0x' + hex + '</td>';
        html += '<td>' + f.decoded + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table>';
    }

    if (ref && ref.bytes && sel.bytes) {
      const refModel = detectModel(ref);
      const selModel = detectModel(sel);
      if (refModel.key === selModel.key && refModel.key !== 'UNKNOWN') {
        const diffAnn = annotateDiff(ref, sel);
        if (diffAnn.annotations.length > 0) {
          html += '<div style="margin-top:18px;color:#ff9500;font-weight:bold;font-family:Courier New,monospace">';
          html += 'Semantic diff vs REF frame #' + state.refIdx + ':';
          html += '</div>';
          html += '<table class="diff-table" style="margin-top:6px"><thead><tr>';
          html += '<th>Byte</th><th>Change</th><th>Interpretation</th>';
          html += '</tr></thead><tbody>';
          for (const a of diffAnn.annotations) {
            const refHex = a.refVal.toString(16).padStart(2, '0').toUpperCase();
            const selHex = a.selVal.toString(16).padStart(2, '0').toUpperCase();
            const noteStyle = a.note ? '' : ' style="color:#8090b0;font-style:italic"';
            html += '<tr>';
            html += '<td class="changed">' + a.pos + '</td>';
            html += '<td>0x' + refHex + ' -> 0x' + selHex + '</td>';
            html += '<td' + noteStyle + '>' + (a.note || '(no known mapping for this byte)') + '</td>';
            html += '</tr>';
          }
          html += '</tbody></table>';
          html += '<div style="margin-top:8px;color:#8090b0;font-size:11px;font-family:Courier New,monospace">';
          html += diffAnn.annotations.length + ' byte(s) changed';
          html += '</div>';
        } else {
          html += '<div style="margin-top:16px;color:#8090b0;font-style:italic">Frames are byte-identical with REF.</div>';
        }
      } else {
        html += '<div style="margin-top:16px;color:#ffaa00;font-size:12px;font-family:Courier New,monospace">';
        html += 'REF and SEL are different sub-types (' + refModel.model.name + ' vs ' + selModel.model.name + '), no semantic diff possible.';
        html += '</div>';
      }
    }

    content.innerHTML = html;
  }

  // =========================================================================
  // SECTION 7: PASTE LOGIC
  // =========================================================================
  function buildSyntheticFrames(text) {
    const frames = [];
    const lines = text.split(/\r?\n/);
    let offset = 0;
    let lineNum = 0;
    for (const rawLine of lines) {
      lineNum++;
      let line = rawLine.replace(/^[0-9a-f]+:/i, '');
      line = line.replace(/\s{2,}.*$/, '');
      line = line.replace(/0x/gi, '');
      line = line.replace(/[,;|]/g, ' ');
      const matches = line.match(/[0-9a-f]{2}/gi);
      if (!matches || matches.length < 2) continue;
      const bytes = matches.map(m => parseInt(m, 16));
      const fmt = state.activeFormat || FORMATS.p23b32;
      let content = bytes.slice();
      const first = bytes[0];
      const last = bytes[bytes.length - 1];
      const delimStart = fmt.delimiterStart !== undefined ? fmt.delimiterStart : fmt.delimiter;
      const delimEnd = fmt.delimiterEnd !== undefined ? fmt.delimiterEnd : fmt.delimiter;
      if (first === delimStart && last === delimEnd && bytes.length >= 4) {
        content = bytes.slice(1, bytes.length - 1);
        if (fmt.useUnescape && typeof pseudoUnescape === 'function') {
          content = pseudoUnescape(content);
        }
      }
      const dst = content.length > 0 ? content[0] : 0;
      const srcOff = fmt.srcOffset !== undefined ? fmt.srcOffset : 0;
      const cmdOff = fmt.cmdOffset !== undefined ? fmt.cmdOffset : 4;
      const src = content.length > srcOff ? content[srcOff] : 0;
      const cmd = content.length > cmdOff ? content[cmdOff] : 0;
      frames.push({
        offset, bytes, content, src, cmd, length: bytes.length, dst,
        isBroadcast: dst === 0xFF || src === 0xFF || src === 0xF9,
        sourceLine: lineNum,
      });
      offset += bytes.length;
    }
    return frames;
  }

  function activateRawFrames(synthFrames) {
    state.bytes = [];
    for (const f of synthFrames) state.bytes.push.apply(state.bytes, f.bytes);
    state.frames = synthFrames;
    state.selectedIdx = -1;
    state.refIdx = -1;
    document.getElementById('analysisGrid').style.display = 'grid';
    document.getElementById('byteStatsCard').style.display = 'block';
    document.getElementById('scanCard').style.display = 'none';
    document.getElementById('formatInfo').innerHTML =
      '<strong style="color:#a064ff">Raw frames mode (V3.5):</strong> ' +
      synthFrames.length + ' frames loaded. ' +
      'Click any frame to see auto-decoded interpretation. Mark a reference for semantic diff.';
    renderAll();
    setTimeout(renderInterpretation, 30);
  }

  // =========================================================================
  // SECTION 8: SAMPLES
  // =========================================================================
  const P23B32_TEST_SAMPLES = [
    '# === TEST SET P23B32 - 8 broadcasts + 7 A1 sub-commands ===',
    '# 1. ALL OFF (REFERENCE)',
    '1A FF 01 3C D2 B4 FF 08 02 5C 04 06 04 F5 20 00 64 00 02 4B 1B 15 0D 00 4E 00 0F 1B 15 00 00 44 00 00 17 00 06 00 00 00 14 4F 00 00 00 00 00 00 00 00 00 00 1B 11 05 0A 10 02 2D 00 0A A0 03 B4 B0 1D',
    '# 2. FILTRATION ON',
    '1A FF 01 3C D2 B4 FF 08 02 5C 04 06 04 F5 21 00 64 80 02 4B 1B 15 0D 00 4E 00 0F 1B 15 00 20 C4 00 00 17 00 06 00 00 00 14 4F 00 00 00 00 00 00 00 00 00 00 1B 11 05 0A 10 02 2D 00 0A A0 03 B4 B0 1D',
    '# 3. POMPE GAUCHE ON',
    '1A FF 01 3C D2 B4 FF 08 02 5C 04 06 14 F5 20 00 64 80 02 4B 1B 15 0D 00 4E 00 0F 1B 15 10 20 C4 00 00 17 00 06 00 00 00 14 4F 00 00 00 00 00 00 00 00 00 00 1B 11 05 0A 10 02 2D 00 0A A0 03 B4 B0 1D',
    '# 4. BULLEUR ON',
    '1A FF 01 3C D2 B4 FF 08 02 5C 04 06 04 F5 28 00 64 80 02 4B 1B 15 0D 00 4E 00 0F 1B 15 00 28 C4 00 00 17 00 06 00 00 00 14 4F 00 00 00 00 00 00 00 00 00 00 1B 11 05 0A 10 02 2D 00 0A A0 03 B4 B0 1D',
    '# 5. CHAUFFAGE + FILTRATION',
    '1A FF 01 3C D2 B4 FF 08 02 5C 04 06 04 F5 31 00 64 80 02 C8 14 16 1B 15 04 2D 06 1B 15 00 20 C6 1B 15 17 00 04 2D 06 1B 15 00 00 14 4F 00 00 00 00 00 00 00 00 00 00 1B 11 05 0A 10 02 2D 00 0A A0 03 B4 B0 1D',
    '# === A1 sub-commands (from your spa_cmd.sh validated frames) ===',
    '# 6. LUMIERE ON (byte 8=00, byte 16=81)',
    '1A 01 30 10 3C A1 00 A1 00 00 40 40 02 04 00 00 81 ED BA A0 1B 14 1D',
    '# 7. LUMIERE OFF (byte 16=80)',
    '1A 01 30 10 3C A1 00 A1 00 00 40 40 02 04 00 00 80 5A 20 CD C1 1D',
    '# 8. POMPE GAUCHE ON (byte 8=06, byte 9=04)',
    '1A 01 30 10 3C A1 00 A1 06 04 00 00 02 04 00 00 00 8B 3E E4 13 1D',
    '# 9. POMPE GAUCHE OFF (byte 9=00)',
    '1A 01 30 10 3C A1 00 A1 06 00 00 00 02 04 00 00 00 08 BD 10 33 1D',
    '# 10. POMPE DROITE ON (byte 8=18, byte 9=10)',
    '1A 01 30 10 3C A1 00 A1 18 10 00 00 02 04 00 00 00 40 D1 2D E0 1D',
    '# 11. POMPE DROITE OFF',
    '1A 01 30 10 3C A1 00 A1 18 00 00 00 02 04 00 00 00 4C DF FF 63 1D',
    '# 12. SETPOINT 38.9C (byte 10-13=80 80 02 04, byte 15=66)',
    '1A 01 30 10 3C A1 00 A1 00 00 80 80 02 04 00 66 00 9F 38 64 1D',
  ].join('\n');

  const P69B133_TEST_SAMPLES = [
    '# === TEST SET P69B133 (Gaet78 protocol) - all delimiter 0x7E ===',
    '# 1. B4 broadcast - REFERENCE - eau 33C, consigne 37C, mode normal, off, pas de PAC',
    '7E 1A F9 BF B4 00 00 00 00 5C 00 00 00 00 20 00 64 90 00 00 30 00 00 00 00 00 7E',
    '# 2. B4 - Pump 1 ON (byte 12 bit 2 = 0x04), running',
    '7E 1A F9 BF B4 00 00 00 00 5C 00 00 04 00 20 00 64 90 00 05 30 00 00 00 00 00 7E',
    '# 3. B4 - Heating active PAC only (byte 14=0x21), output temp byte 21 monte',
    '7E 1A F9 BF B4 00 00 00 00 5C 00 00 00 00 21 00 64 90 00 00 30 00 5E 00 00 00 7E',
    '# 4. B4 - Heating PAC + electric boiler (byte 14=0x35)',
    '7E 1A F9 BF B4 00 00 00 00 5C 00 00 00 00 35 00 64 90 00 00 30 00 5E 00 00 00 7E',
    '# 5. B4 - Mode PROGRAMME (byte 17 high = 0x10), light off',
    '7E 1A F9 BF B4 00 00 00 00 5C 00 00 00 00 20 00 64 10 00 00 10 00 00 00 00 00 7E',
    '# 6. B4 - Mode normal + LIGHT ON (byte 17 bit 0 = 1, so 0x91)',
    '7E 1A F9 BF B4 00 00 00 00 5C 00 00 00 00 20 00 64 91 00 00 30 00 00 00 00 00 7E',
    '# 7. B4 - Setpoint change 37C -> 39C (byte 16: 64 -> 68)',
    '7E 1A F9 BF B4 00 00 00 00 5C 00 00 00 00 20 00 68 90 00 00 30 00 00 00 00 00 7E',
    '# === B5 - filtration schedules ===',
    '# 8. B5 - Slot1 active 08h00-22h30, Slot2 inactive',
    '7E 1A F9 BF B5 00 00 00 00 00 00 00 00 00 00 00 00 C8 00 16 1E 00 00 00 00 00 7E',
    '# 9. B5 - Slot1 inactive, Slot2 active 14h00-15h00',
    '7E 1A F9 BF B5 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 4E 00 0F 00 00 7E',
    '# === Commands (panel -> controller) ===',
    '# 10. A1 setpoint cmd: target 38C (byte 13 = 64h = 100F)',
    '7E 12 20 BF A1 01 20 00 A1 80 80 02 04 64 00 00 00 00 7E',
    '# 11. A1 pump 1 ON (byte 8=04, byte 9=04)',
    '7E 12 20 BF A1 01 20 00 A1 04 04 00 00 00 00 00 00 00 7E',
    '# 12. A1 pump 1 OFF (byte 9=00)',
    '7E 12 20 BF A1 01 20 00 A1 04 00 00 00 00 00 00 00 00 7E',
    '# 13. AE Light ON (byte 6=11)',
    '7E 0E 20 BF AE 00 11 01 00 00 00 00 00 00 00 7E',
    '# 14. AE Light OFF (byte 6=00)',
    '7E 0E 20 BF AE 00 00 01 00 00 00 00 00 00 00 7E',
    '# 15. A4 filtration slot 1 activate 08:00-22:30',
    '7E 12 20 BF A4 01 20 00 A1 22 08 00 16 1E 00 00 00 00 7E',
  ].join('\n');

  const FORUM_SAMPLES = [
    '# === Forum HA samples - multi-model demo ===',
    '# P25B85 (Alex) - All off',
    '1A FF 01 3C D2 B4 FF 08 02 62 04 14 00 7F 20 00 63 00 02 4B 1B 15 0D 00 4E 00 0F 1B 15 00 00 44 00 00 17 00 06 00 00 00 14 4F 00 00 00 00 00 00 00 00 00 00 1B 11 05 0A 10 02 2D 00 0A A0 03 B4 B0 1D',
    '# P25B85 (Alex) - Filtration',
    '1A FF 01 3C D2 B4 FF 08 02 63 04 14 00 7F 21 00 63 80 02 4B 1B 15 0D 00 4E 00 0F 1B 15 00 20 C4 00 00 00 17 00 06 00 00 00 14 4F 00 00 00 00 00 00 00 00 00 00 1B 11 05 0A 0F 35 0E 00 00 18 B3 5D FF 1D',
    '# P25B85 (Alex) - Heater stage active (byte 15 = 0x54)',
    '1A FF 01 3C D2 B4 FF 08 02 63 04 14 00 7F 31 00 66 85 02 C8 14 16 1B 15 04 2D 06 1B 15 00 20 C6 1B 15 17 00 04 2D 06 1B 15 00 00 14 4F 00 00 00 00 00 00 00 00 00 00 1B 11 05 0A 0F 39 99 00 0D 5D 92 AF F5 1D',
    '# P25B37 - frame 17 bytes (no public mapping)',
    '67 8F 06 03 22 2F 01 02 24 26 02 02 82 67 51 42 FB',
    '# P25B37 - frames 5 bytes',
    '64 0D 02 22 F7',
    '65 0D 02 4E FF',
    '66 20 02 CB FE',
    '# P20B29 (Yannick) - 9600 baud sample',
    '64 4B 80 51 A2 65 4B 90 40 AA 66 4B 90 A0 AA 35 43 02 02 7F F9 28',
  ].join('\n');

  // =========================================================================
  // SECTION 9: INIT
  // =========================================================================
  function hookInterpretation() {
    document.addEventListener('click', function (e) {
      const row = e.target.closest('.frame-row');
      if (row) setTimeout(renderInterpretation, 30);
      const btn = e.target.closest('button');
      if (btn && (btn.id === 'markRefBtn' || btn.id === 'clearRefBtn' || btn.id === 'clearBtn')) {
        setTimeout(renderInterpretation, 30);
      }
    });
  }

  function init() {
    let captureCard = null;
    document.querySelectorAll('.card .card-title').forEach(t => {
      if (t.textContent.indexOf('2. Capture File') === 0) captureCard = t.parentElement;
    });
    if (!captureCard) {
      console.warn('V3.5 addon: capture card not found, abort');
      return;
    }

    const pill = document.querySelector('.version-pill');
    if (pill) pill.textContent = 'V3.5';

    buildPasteCard(captureCard);
    buildInterpretationCard();

    document.getElementById('parsePastedCapture').addEventListener('click', function () {
      const text = document.getElementById('pasteArea').value;
      if (!text.trim()) { alert('Paste hex bytes first'); return; }
      loadCapture(text);
      setTimeout(renderInterpretation, 50);
    });
    document.getElementById('parsePastedRaw').addEventListener('click', function () {
      const text = document.getElementById('pasteArea').value;
      if (!text.trim()) { alert('Paste hex bytes first'); return; }
      if (!state.activeFormat) {
        state.activeFormat = FORMATS.p23b32;
        state.formatKey = 'p23b32';
      }
      const synthFrames = buildSyntheticFrames(text);
      if (synthFrames.length === 0) {
        alert('No frames detected. Each non-empty line must contain at least 2 hex bytes.');
        return;
      }
      activateRawFrames(synthFrames);
    });
    document.getElementById('clearPaste').addEventListener('click', function () {
      document.getElementById('pasteArea').value = '';
    });
    document.getElementById('loadP23B32Test').addEventListener('click', function () {
      document.getElementById('pasteArea').value = P23B32_TEST_SAMPLES;
    });
    document.getElementById('loadP69B133Test').addEventListener('click', function () {
      document.getElementById('pasteArea').value = P69B133_TEST_SAMPLES;
    });
    document.getElementById('loadForumSamples').addEventListener('click', function () {
      document.getElementById('pasteArea').value = FORUM_SAMPLES;
    });

    hookInterpretation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
