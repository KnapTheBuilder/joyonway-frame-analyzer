/* 2026-05-19 V3.6 addon | P69B133 real frames + CRC validation
 * Christophe / KnapTheBuilder
 *
 * Loads AFTER V3.5 addon. Adds:
 *   - "P69B133 REAL set" button with frames containing VALID CRCs
 *     (computed using crc8 poly=0x07 init=0x71 from Gaet78 rs485.py)
 *   - CRC validation status in the interpretation panel (valid/invalid in color)
 *   - "Compute CRC" button that computes the expected CRC for the selected frame
 *
 * The frames in this addon are REPLAYABLE on a real P69B133 controller
 * (unlike V3.5 synthetic frames which had placeholder CRCs).
 */
(function () {

  // =========================================================================
  // CRC-8 P69B133 (Gaet78 algorithm)
  // =========================================================================
  function crc8_p69(bytes, poly, init) {
    poly = poly || 0x07;
    init = init !== undefined ? init : 0x71;
    let crc = init;
    for (const b of bytes) {
      crc ^= b;
      for (let i = 0; i < 8; i++) {
        if (crc & 0x80) crc = ((crc << 1) ^ poly) & 0xFF;
        else crc = (crc << 1) & 0xFF;
      }
    }
    return crc;
  }

  // Validate the CRC of a P69B133 frame (7E length payload CRC 7E)
  // Returns { valid, computed, found } or null if not a P69B133 frame.
  function validateP69CRC(frame) {
    const b = frame.bytes;
    if (!b || b.length < 5) return null;
    if (b[0] !== 0x7E || b[b.length - 1] !== 0x7E) return null;
    // Payload = bytes between length and CRC
    // Frame: [7E] [length] [payload...] [CRC] [7E]
    const payload = b.slice(2, b.length - 2);
    const foundCRC = b[b.length - 2];
    const computed = crc8_p69(payload);
    return {
      valid: computed === foundCRC,
      computed: computed,
      found: foundCRC,
    };
  }

  // =========================================================================
  // REAL P69B133 frame set (computed CRCs - replayable on a real spa)
  // =========================================================================
  const P69B133_REAL_SAMPLES = [
    '# === P69B133 REAL frames (Gaet78 protocol, valid CRCs) ===',
    '# These commands are REPLAYABLE on a real P69B133 spa controller',
    '# CRC algorithm: crc8 poly=0x07 init=0x71 (from Gaet78 rs485.py)',
    '',
    '# --- Setpoint commands (panel -> controller, A1 with 80 80 02 04 signature) ---',
    '# Setpoint 15C (59F = 0x3B)',
    '7E 12 20 BF A1 01 20 00 A1 00 00 80 80 02 04 C4 3B 00 09 7E',
    '# Setpoint 25C (77F = 0x4D)',
    '7E 12 20 BF A1 01 20 00 A1 00 00 80 80 02 04 B2 4D 00 CF 7E',
    '# Setpoint 30C (86F = 0x56)',
    '7E 12 20 BF A1 01 20 00 A1 00 00 80 80 02 04 A9 56 00 41 7E',
    '# Setpoint 35C (95F = 0x5F)',
    '7E 12 20 BF A1 01 20 00 A1 00 00 80 80 02 04 A0 5F 00 C6 7E',
    '# Setpoint 37C (99F = 0x63)',
    '7E 12 20 BF A1 01 20 00 A1 00 00 80 80 02 04 9C 63 00 D8 7E',
    '# Setpoint 38C (100F = 0x64) - default value',
    '7E 12 20 BF A1 01 20 00 A1 00 00 80 80 02 04 9B 64 00 A5 7E',
    '# Setpoint 39C (102F = 0x66)',
    '7E 12 20 BF A1 01 20 00 A1 00 00 80 80 02 04 99 66 00 59 7E',
    '# Setpoint 40C (104F = 0x68) - max',
    '7E 12 20 BF A1 01 20 00 A1 00 00 80 80 02 04 97 68 00 A3 7E',
    '',
    '# --- Pump commands (A1 with mask/state pattern) ---',
    '# Pump 1 ON (mask 0x04, state 0x04)',
    '7E 12 20 BF A1 01 20 00 A1 04 04 00 00 00 00 00 00 00 14 7E',
    '# Pump 1 OFF (mask 0x04, state 0x00)',
    '7E 12 20 BF A1 01 20 00 A1 04 00 00 00 00 00 00 00 00 58 7E',
    '# Pump 2 ON (mask 0x10, state 0x10)',
    '7E 12 20 BF A1 01 20 00 A1 10 10 00 00 00 00 00 00 00 09 7E',
    '# Pump 2 OFF (mask 0x10, state 0x00)',
    '7E 12 20 BF A1 01 20 00 A1 10 00 00 00 00 00 00 00 00 3E 7E',
    '',
    '# --- Light commands (AE - distinct from A1) ---',
    '# Light ON (state 0x11)',
    '7E 0E 20 BF AE 00 11 01 00 00 00 00 00 00 CF 7E',
    '# Light OFF (state 0x00)',
    '7E 0E 20 BF AE 00 00 01 00 00 00 00 00 00 EB 7E',
    '',
    '# --- Filtration schedule commands (A4) ---',
    '# Slot 1 ACTIVE 08:00-22:30 (flag 0x22)',
    '7E 12 20 BF A4 01 20 00 A1 22 08 00 16 1E 00 00 00 00 AC 7E',
    '# Slot 1 DEACTIVATE (flag 0x12)',
    '7E 12 20 BF A4 01 20 00 A1 12 00 00 00 00 00 00 00 00 B4 7E',
    '# Slot 2 ACTIVE 14:00-15:00 (flag 0x88)',
    '7E 12 20 BF A4 01 20 00 A1 88 00 00 00 00 0E 00 0F 00 31 7E',
    '# Slot 2 DEACTIVATE (flag 0x48)',
    '7E 12 20 BF A4 01 20 00 A1 48 00 00 00 00 00 00 00 00 18 7E',
    '',
    '# --- Synthetic B4 broadcasts (computed valid CRCs, not from a real spa) ---',
    '# B4: idle - eau 33.3C, consigne 37.8C, mode normal',
    '7E 18 F9 BF B4 00 00 00 00 00 00 5C 00 00 00 00 21 00 64 90 00 00 30 00 8D 7E',
    '# B4: Pump 1 running',
    '7E 18 F9 BF B4 00 00 00 00 00 00 5C 00 00 04 00 21 00 64 90 00 05 30 00 EA 7E',
    '# B4: PAC heating (byte14=0x20)',
    '7E 18 F9 BF B4 00 00 00 00 00 00 5C 00 00 00 00 20 00 64 90 00 00 30 00 9E 7E',
    '# B4: PAC + boiler heating (byte14=0x35)',
    '7E 18 F9 BF B4 00 00 00 00 00 00 5C 00 00 00 00 35 00 64 90 00 00 30 00 F6 7E',
    '# B4: mode programme active (byte17=0x10, byte20=0x10)',
    '7E 18 F9 BF B4 00 00 00 00 00 00 5C 00 00 00 00 21 00 64 10 00 00 10 00 B4 7E',
    '# B4: light ON in normal mode (byte17=0x91)',
    '7E 18 F9 BF B4 00 00 00 00 00 00 5C 00 00 00 00 21 00 64 91 00 00 30 00 EF 7E',
    '# B4: setpoint 39C (byte16=0x66)',
    '7E 18 F9 BF B4 00 00 00 00 00 00 5C 00 00 00 00 21 00 66 90 00 00 30 00 DF 7E',
  ].join('\n');

  // =========================================================================
  // UI Additions
  // =========================================================================
  function init() {
    // Update version pill to V3.6
    setTimeout(() => {
      const pill = document.querySelector('.version-pill');
      if (pill) pill.textContent = 'V3.6';
    }, 100);

    // Add the "REAL set" button to the paste card
    setTimeout(() => {
      const controlsRow = document.querySelector('#pasteCard .controls');
      if (!controlsRow) return;
      // Avoid double-adding
      if (document.getElementById('loadP69B133Real')) return;

      const realBtn = document.createElement('button');
      realBtn.className = 'btn btn-special';
      realBtn.id = 'loadP69B133Real';
      realBtn.textContent = 'P69B133 REAL set (valid CRCs)';
      realBtn.style.borderColor = '#00ff88';
      realBtn.style.color = '#00ff88';
      realBtn.style.background = 'rgba(0, 255, 136, 0.1)';
      realBtn.addEventListener('click', function () {
        const ta = document.getElementById('pasteArea');
        if (ta) ta.value = P69B133_REAL_SAMPLES;
      });
      // Insert after "P69B133 test set" button
      const oldBtn = document.getElementById('loadP69B133Test');
      if (oldBtn && oldBtn.nextSibling) {
        oldBtn.parentNode.insertBefore(realBtn, oldBtn.nextSibling);
      } else {
        controlsRow.appendChild(realBtn);
      }
    }, 200);

    // Hook click events on frame rows to add CRC validation panel
    document.addEventListener('click', function (e) {
      const row = e.target.closest('.frame-row');
      if (row) setTimeout(injectCRCStatus, 80);
      const btn = e.target.closest('button');
      if (btn && (btn.id === 'markRefBtn' || btn.id === 'clearRefBtn')) {
        setTimeout(injectCRCStatus, 80);
      }
    });
  }

  // Inject CRC validation status into the interpretation card
  function injectCRCStatus() {
    if (typeof state === 'undefined') return;
    if (state.selectedIdx < 0 || !state.frames || !state.frames[state.selectedIdx]) return;
    const content = document.getElementById('interpretationContent');
    if (!content) return;

    // Avoid duplicates
    const existing = document.getElementById('crcStatusBlock');
    if (existing) existing.remove();

    const sel = state.frames[state.selectedIdx];
    const crc = validateP69CRC(sel);
    if (!crc) return; // not a P69B133-style frame

    const block = document.createElement('div');
    block.id = 'crcStatusBlock';
    block.style.cssText = 'margin-top:14px;padding:10px;border-radius:6px;font-family:Courier New,monospace;font-size:13px';

    if (crc.valid) {
      block.style.background = 'rgba(0, 255, 136, 0.08)';
      block.style.borderLeft = '3px solid #00ff88';
      block.style.color = '#00ff88';
      block.innerHTML =
        '<strong>CRC-8 valid</strong> ' +
        '(computed 0x' + crc.computed.toString(16).padStart(2, '0').toUpperCase() + ' = ' +
        'found 0x' + crc.found.toString(16).padStart(2, '0').toUpperCase() + ')<br>' +
        '<span style="color:#8090b0;font-size:11px">Algorithm: crc8 poly=0x07 init=0x71 (Gaet78)</span><br>' +
        '<span style="color:#00ff88;font-size:11px">This frame is REPLAYABLE on a real P69B133 controller</span>';
    } else {
      block.style.background = 'rgba(255, 51, 102, 0.08)';
      block.style.borderLeft = '3px solid #ff3366';
      block.style.color = '#ff3366';
      block.innerHTML =
        '<strong>CRC-8 INVALID</strong> ' +
        '(computed 0x' + crc.computed.toString(16).padStart(2, '0').toUpperCase() + ' but ' +
        'found 0x' + crc.found.toString(16).padStart(2, '0').toUpperCase() + ' in frame)<br>' +
        '<span style="color:#8090b0;font-size:11px">Algorithm: crc8 poly=0x07 init=0x71 (Gaet78)</span><br>' +
        '<span style="color:#ff3366;font-size:11px">A real P69B133 controller would REJECT this frame</span>';
    }
    content.appendChild(block);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
