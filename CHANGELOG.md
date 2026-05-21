# Changelog

## v2.0.0 - 2026-05-21

Major correction release based on community findings.

### Fixed

- **Unescape function**: replaced simplistic "remove 0x1B, keep next byte" rule with the correct KDy table:
  - `1B 11 -> 1A`
  - `1B 13 -> 1C`
  - `1B 14 -> 1D`
  - `1B 15 -> 1E`
  - `1B 0B -> 1B`
- Without this fix, byte positions shifted after the first 0x1B in any frame, causing incorrect decoding of temperature, setpoint, and equipment flags.

### Added

- `profiles/joyonway_1a1d_family.json` - Unified profile for P23B32 V2, P20B29 and P25B85 (same protocol confirmed)
- `profiles/p69b133_balboa_like.json` - Reference profile for P69B133 (separate protocol)
- `profiles/_template.json` - Template for new model contributions
- `unescape.js` - Standalone JavaScript module with correct KDy table
- B4 broadcast decoder (from KDy parser code, post #90):
  - water temp byte 9 (Fahrenheit)
  - setpoint byte 16 (Fahrenheit)
  - heating state byte 14 (0x50/0x54/0x40/0xC1)
  - pump flags byte 12 (filtering/massage bits)
  - light flag byte 17 (bit 0x01)
- Setpoint command frame template (from Yannickt26 post #110):
  - Byte 15 of A1 command = setpoint in Fahrenheit
  - Formula: `byte_15 = round((celsius * 9 / 5) + 32)`

### Changed

- README now bilingual (English/Français), with full credits section
- Profile schema enhanced with validation tracking per contributor and per model

### Credits

This release integrates the work of:
- **@KDy** (unescape table + B4 parser + PB555 manual research)
- **@Yannickt26** (P20B29 captures + setpoint frames)
- **@gaet78** (P69B133 protocol reference)
- **@Neuro** (P23B32 V2 prototype)
- **@old-man** (P25B85 confirmation)

### Source

All findings come from the Home Assistant community thread:
https://community.home-assistant.io/t/joyonway-spa-control/582344
