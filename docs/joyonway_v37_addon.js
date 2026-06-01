/* 2026-05-20 V3.7 addon | P23B32 A1 corrections from KDy forum analysis
 * Christophe / KnapTheBuilder
 *
 * NEW IN V3.7 vs V3.6 :
 *   - FIX bulleur detection: uses bytes 10-11 (not byte 8) as confirmed by KDy
 *   - NEW: wake-up frame detection (all bytes 8-11 = 0x00, found 2x in Yannick capture)
 *   - NEW: stub for heater/ozone manual cmds (will be activated once captured)
 *   - Confirms P20B29 (Yannick) compatibility with P23B32 protocol (same signatures)
 *
 * Forum source: KDy thread 2026-05-20 analysing Yannickt26 capture
 *   1a 01 30 10 3c a1 00 a1 06 04 00 00 02 04 ...  LEFT PUMP ON
 *   1a 01 30 10 3c a1 00 a1 06 00 00 00 02 04 ...  LEFT PUMP OFF
 *   1a 01 30 10 3c a1 00 a1 18 10 00 00 02 04 ...  RIGHT PUMP ON
 *   1a 01 30 10 3c a1 00 a1 18 00 00 00 02 04 ...  RIGHT PUMP OFF
 *   1a 01 30 10 3c a1 00 a1 00 00 04 04 02 04 ...  BLOWER ON (bytes 10-11)
 *   1a 01 30 10 3c a1 00 a1 00 00 04 00 02 04 ...  BLOWER OFF
 *   1a 01 30 10 3c a1 00 a1 00 00 00 00 02 04 ...  WAKE-UP / IDLE PING
 */
(function () {

  // Override the detectSubType function for P23B32_A1
  // Wait for V3.5/V3.6 to load first, then patch
  function patchA1Detection() {
    if (typeof MODELS === 'undefined') {
      console.warn('V3.7: MODELS not yet loaded, retrying in 200ms');
      setTimeout(patchA1Detection, 200);
      return;
    }
    if (!MODELS.P23B32_A1) {
      console.warn('V3.7: P23B32_A1 not found in MODELS');
      return;
    }

    // Save reference to original then replace
    MODELS.P23B32_A1.detectSubType = function (f) {
      if (f.bytes.length < 20 || f.bytes.length > 22) return null;
      if (f.bytes[0] !== 0x1A || f.bytes[5] !== 0xA1 || f.bytes[7] !== 0xA1) return null;

      const b8 = f.bytes[8];
      const b9 = f.bytes[9];
      const b10 = f.bytes[10];
      const b11 = f.bytes[11];
      const b16 = f.bytes[16];

      // Bulleur (blower) - uses bytes 10-11 (KDy correction)
      if (b8 === 0x00 && b9 === 0x00 && b10 === 0x04) {
        return b11 === 0x04 ? 'blower_on' : 'blower_off';
      }

      // Wake-up / idle ping - all bytes 8-11 at 0
      // Often seen before/after real commands as panel-to-controller sync
      if (b8 === 0x00 && b9 === 0x00 && b10 === 0x00 && b11 === 0x00 && b16 === 0x00) {
        return 'wake_up_ping';
      }

      // Light: byte 8=0x00, byte 16 = 0x80 (off) or 0x81 (on)
      // (CRC differs but pattern is the trigger)
      if (b8 === 0x00 && b9 === 0x00 && (b16 === 0x80 || b16 === 0x81)) {
        return b16 === 0x81 ? 'light_on' : 'light_off';
      }

      // Pump left: byte 8=0x06
      if (b8 === 0x06) {
        return b9 === 0x04 ? 'pump_left_on' : 'pump_left_off';
      }

      // Pump right: byte 8=0x18
      if (b8 === 0x18) {
        return b9 === 0x10 ? 'pump_right_on' : 'pump_right_off';
      }

      // Filtration: byte 8 = 0x62 (on) or 0x50 (off) - Christophe's mapping
      if (b8 === 0x62) return 'filtration_on';
      if (b8 === 0x50) return 'filtration_off';

      // Setpoint: byte 10-13 = 80 80 02 04 (signature)
      if (b10 === 0x80 && b11 === 0x80 && f.bytes[12] === 0x02 && f.bytes[13] === 0x04) {
        return 'setpoint';
      }

      // Future: heater manual / ozone manual (need real captures)
      // Slots ready when Christophe activates "Thermostat manuel" on PB555 panel

      return 'unknown_a1';
    };

    // Expand subTypes labels
    MODELS.P23B32_A1.subTypes = Object.assign({}, MODELS.P23B32_A1.subTypes || {}, {
      blower_on:      'Blower (bulleur) ON command',
      blower_off:     'Blower (bulleur) OFF command',
      wake_up_ping:   'Wake-up / idle ping (panel sync before real command)',
      heater_on:      'Heater manual ON (requires "Thermostat manuel" mode on panel)',
      heater_off:     'Heater manual OFF (requires "Thermostat manuel" mode on panel)',
      ozone_on:       'Ozone manual ON (requires "Ozone manuel" mode on panel)',
      ozone_off:      'Ozone manual OFF (requires "Ozone manuel" mode on panel)',
    });

    // Update fields hint
    if (MODELS.P23B32_A1.fields[8]) {
      MODELS.P23B32_A1.fields[8].help =
        'Sub-cmd byte 1. Values: 0x00=light/blower/wake/setpoint, 0x06=pump_left, 0x18=pump_right, 0x62=filt_on, 0x50=filt_off';
    }
    if (MODELS.P23B32_A1.fields[10]) {
      MODELS.P23B32_A1.fields[10].help =
        'For blower: 0x04. For setpoint: 0x80. For light/wake: 0x00.';
    } else {
      MODELS.P23B32_A1.fields[10] = {
        name: 'Sub-cmd byte 3 (blower mask)',
        type: 'hex',
        help: '0x04 = blower command, 0x80 = setpoint signature, 0x00 = light/wake/pump',
      };
    }
    if (!MODELS.P23B32_A1.fields[11]) {
      MODELS.P23B32_A1.fields[11] = {
        name: 'Sub-cmd byte 4 (blower state)',
        type: 'hex',
        help: '0x04 = blower ON, 0x00 = blower OFF or pump cmd, 0x80 = setpoint signature',
      };
    }

    // Update version pill
    const pill = document.querySelector('.version-pill');
    if (pill) pill.textContent = 'V3.7';

    // Add P23B32 multi-user test set button (combines Christophe + Yannick samples)
    addCommunityButton();

    console.log('V3.7 patch applied: A1 detection updated with KDy/Yannick findings');
  }

  // Community test set - Yannick's actual frames from his P20B29
  const YANNICK_P20B29_SAMPLES = [
    '# === Yannick P20B29 capture - actual A1 frames from forum 2026-05-20 ===',
    '# Identified by KDy : same protocol as Christophe P23B32 (38400 baud)',
    '#',
    '# 1. UNKNOWN/WAKE-UP frame (appears 2x in capture, all bytes 8-11 = 0x00)',
    '1A 01 30 10 3C A1 00 A1 00 00 00 00 02 04 00 00 00 1B 13 F7 26 23 1D',
    '# 2. LEFT PUMP ON (byte 8=06, byte 9=04)',
    '1A 01 30 10 3C A1 00 A1 06 04 00 00 02 04 00 00 00 8B 3E E4 13 1D',
    '# 3. LEFT PUMP OFF (byte 8=06, byte 9=00)',
    '1A 01 30 10 3C A1 00 A1 06 00 00 00 02 04 00 00 00 08 BD 10 33 1D',
    '# 4. RIGHT PUMP ON (byte 8=18, byte 9=10)',
    '1A 01 30 10 3C A1 00 A1 18 10 00 00 02 04 00 00 00 40 D1 2D E0 1D',
    '# 5. RIGHT PUMP OFF (byte 8=18, byte 9=00)',
    '1A 01 30 10 3C A1 00 A1 18 00 00 00 02 04 00 00 00 4C DF FF 63 1D',
    '# 6. BLOWER ON (KEY FIX: byte 10=04, byte 11=04) <-- corrected detection in V3.7',
    '1A 01 30 10 3C A1 00 A1 00 00 04 04 02 04 00 00 00 0F 7F 1B 11 76 1D',
    '# 7. BLOWER OFF (byte 10=04, byte 11=00)',
    '1A 01 30 10 3C A1 00 A1 00 00 04 00 02 04 00 00 00 FC C2 86 4F 1D',
    '#',
    '# === Yannick P20B29 broadcast B4 (38400 baud, same signature as P23B32) ===',
    '# 8. B4 broadcast idle - all off',
    '1A FF 01 3C D2 B4 FF 08 01 63 04 D4 00 6F 20 00 63 80 02 49 1B 15 11 00 0C 1B 15 17 1B 15 00 20 0C 1B 15 17 1B 15 0C 1B 15 17 1B 15 00 00 FE 4F 00 00 00 00 00 00 00 00 00 00 00 00 1B 11 05 14 14 1B 11 25 03 00 8D 4F 9B DA 1D',
    '# 9. B4 broadcast - LEFT PUMP active (byte 12 bit 4 = 0x10)',
    '1A FF 01 3C D2 B4 FF 08 01 63 04 D4 10 6F 20 00 63 80 02 49 1B 15 11 00 0C 1B 15 17 1B 15 10 20 0C 1B 15 17 1B 15 0C 1B 15 17 1B 15 00 00 FE 4F 00 00 00 00 00 00 00 00 00 00 00 00 1B 11 05 14 14 1B 11 27 03 00 CE D2 DB 8D 1D',
    '# 10. B4 broadcast - BLOWER active (byte 14 = 0x28 bit 3 set)',
    '1A FF 01 3C D2 B4 FF 08 01 63 04 D4 00 6F 28 00 63 80 02 49 1B 15 11 00 0C 1B 15 17 1B 15 00 28 0C 1B 15 17 1B 15 0C 1B 15 17 1B 15 00 00 FE 4F 00 00 00 00 00 00 00 00 00 00 00 00 1B 11 05 14 14 1B 11 2D 03 00 D1 34 90 46 1D',
  ].join('\n');

  function addCommunityButton() {
    const ctrl = document.querySelector('#pasteCard .controls');
    if (!ctrl || document.getElementById('loadYannickP20B29')) return;

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.id = 'loadYannickP20B29';
    btn.textContent = 'Yannick P20B29 (forum)';
    btn.style.borderColor = '#ffd400';
    btn.style.color = '#ffd400';
    btn.style.background = 'rgba(255, 212, 0, 0.08)';
    btn.title = 'Trames de Yannick (P20B29) capturees - meme protocole que P23B32 (confirme KDy 2026-05-20)';
    btn.addEventListener('click', function () {
      const ta = document.getElementById('pasteArea');
      if (ta) ta.value = YANNICK_P20B29_SAMPLES;
    });
    ctrl.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchA1Detection);
  } else {
    setTimeout(patchA1Detection, 300);
  }
})();
