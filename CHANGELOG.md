# Changelog

All notable changes to the Joyonway Frame Analyzer.

## V3.8 (2026-05-21)

### Added
- EN / FR language switch with localStorage persistence. Floating top-right pill (cyan, EN | FR), default EN. MutationObserver with 80ms debounce automatically translates dynamic content injected by the V3.5 / V3.6 / V3.7 addons.
- Separate dictionaries for texts, status prefixes, input placeholders, and select options. WeakMap cache for originals by node identity (no double-translation, no flicker on re-render).

### File
- `joyonway_v38_i18n.js` (16 KB)

---

## V3.7 (2026-05-20)

### Added
- Community contribution card (section 7 of the analyzer). Yellow border, 6 fields: model dropdown (P23B32 / P25B85 / P69B133 / P25B37 / P20B29 / P68B123 / other), keypad model, bridge type (USR-W610 / Elfin-EW11 / ESP32+MAX485 / USB-RS485 / other), GitHub handle, free-form context (≥10 chars), consent checkbox (MIT + no PII).
- Three actions:
  - **Submit to maintainer (via GitHub)**: opens pre-filled GitHub issue at `KnapTheBuilder/joyonway-frame-analyzer/issues/new` with labels `new-controller` or `capture-analysis`.
  - **Download contribution.md**: produces a Markdown file with all form data plus the currently loaded capture (raw hex + parsed frames JSON).
  - **Copy issue body to clipboard**: same content as the issue but plain-text.
- Help div with link to `community.home-assistant.io/t/joyonway-spa-control/582344`.
- Backend (separate, in HA): webhook automation listening on `joyonway_gh_*` token, fires push notifications to `notify.christophe` on every new issue with `new-controller` or `capture-analysis` label.

### File
- `joyonway_v37_addon.js` (18 KB)

---

## V3.6 (2026-05-19)

### Added
- CRC-8 validation for P69B133 frames (polynomial 0x07, init 0x71, computed over bytes 1 to length-3, validated at byte length-2). Green / red badge in the selected frame card. Validates against Gaet78 reference frames.
- REAL replayable command set for P69B133: setpoint (A1 with signature 80 80 02 04), pump 1/2 on/off (A1), light on/off (AE), filtration schedule slot 1/2 (A4). Each entry includes the exact hex frame ready for `nc` replay.

### File
- `joyonway_v36_addon.js` (10 KB)

---

## V3.5.1 (2026-05-21)

### Fixed
- P23B32_B4 detector raw-length window widened from `<= 70` to `<= 90` bytes. Yannick's spa (P23B32, advertised as P20B29) sends 75-byte raw broadcasts which were misclassified as P25B85. Note: discrimination P23B32 vs P25B85 by raw length alone remains imperfect; needs labeled hardware captures to refine via byte-content signatures. P25B85 detector pushed to `> 90`.

### File
- `joyonway_v35_addon.js` (39 KB)

---

## V3.5 (2026-05-19)

### Added
- Multi-model interpretation engine with enriched per-byte mappings.
- P69B133: complete mapping for B4 broadcast (water temp byte 9, pump flags byte 12, heating mode byte 14, setpoint byte 16, mode + light byte 17, heat pump output byte 21) + B5 filtration schedules + A1 setpoint cmd + A1 pump cmd + AE light cmd + A4 filtration schedule cmd, based on Gaet78 protocol.md decode.
- P25B85: heating stages enum refined (3 stages decode: 0x40 cooling, 0x50 circulation-only, 0x54 heater active, 0xC1 UV/ozone).
- P23B32: detection of A1 sub-commands (light on/off, pump LEFT on/off, pump RIGHT on/off, filtration on/off, bubbler, setpoint signature 80 80 02 04), based on Christophe's validated spa_cmd.sh frames.
- P25B37, P20B29, P68B123: explicit "no public mapping" message with link to GitHub issues for community contribution.

---

## V3.4 (2026-05-18)

### Added
- Multi-model semantic interpretation engine (P23B32, P25B85, P69B133). Auto-detects model from frame structure and decodes bytes by name.

---

## V3.3 (2026-05-18)

### Added
- Paste frames feature (textarea card 2bis). Allows pasting hex frames isolated from forum messages without needing a full xxd capture file. Two modes: "Parse as capture" (scans delimiters) and "Parse as raw frames" (each non-empty line = one standalone frame).
- P23B32 and P69B133 test sample buttons.
- Forum samples button (multi-model demo).

---

## V3.2 (2026-05-15)

### Initial public release
- Multi-model RS485 capture parser, delimited frames mode.
- Auto-detect format: P23B32 (delimiter 0x1A...0x1D with pseudo-escape 1B XX), P69B133 (delimiter 0x7E), Scan all delimiters mode, Custom mode.
- Frame list with CMD badges, byte position statistics per Src + CMD pair, diff vs reference frame, hex byte visualization with delimiter / CMD / diff coloring.

---

## Acknowledgements

- KDy (HA forum): oscilloscope RS485 analysis on P23B32, confirmed 38400 baud 8N1, decoded pseudo-escape mechanism.
- Gaet78: original HACS integration for P69B133, protocol decode and CRC-8 reference.
- Neuro: ESP32 + MAX485 work on P23B32 V2 controller.
- Alex: P25B85 hardware and frame captures.
- Yannickt26: P23B32 (advertised P20B29) frame captures and forum feedback.
