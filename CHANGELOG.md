# Changelog

All notable changes to the Joyonway Frame Analyzer.

## V4.2 (2026-06-01)

### Added
- EN / FR language switch: floating top-right pill (cyan), `FR | EN` buttons. Default is FR (the analyzer was built in French first). Persistence via localStorage key `joyonway_lang`. Bilingual dictionary covers all static UI strings (cards, footer, stats labels, decode labels) plus dynamic Contribute status messages (sending, success, canceled, etc.) and input placeholders.
- MutationObserver with 80 ms debounce automatically translates dynamically injected content (rendered tables, alert boxes, evolution messages) when the user has switched to EN.
- WeakMap cache keeps the original text per DOM node to allow back-and-forth FR <-> EN switching without flicker or double-translation.

### Changed
- Version pill, footer, and page title bumped to V4.2.

### File
- `docs/index.html` (38 KB, single standalone file)

---

## V4.1 (2026-06-01)

### Added
- Multi-format upload: automatic detection of binary vs text content. Accepts `.bin` (raw bytes from `nc | dd`), `.txt` / `.log` / `.cap` / `.hex` (xxd output, raw hex, hex with spaces, hex with commas, hex with `0x` prefix), and comment lines starting with `#` are ignored.
- Contribute card: opt-in checkbox (checked by default) to send the analyzed capture anonymously to the ha-joyonway-multi project endpoint. 3-second debounce allows decoupling. Optional fields for declared controller model, panel model, and capture context (free text, 500 chars max).
- Payload: anonymous JSON with raw hex bytes, declared model/panel, timestamp, analyzer version, user agent (truncated). No IP, no PII, MIT license.
- Payload truncation at 100 KB hex (50 KB raw data) to avoid oversized POST. Truncation flag included in payload.
- Endpoint configurable via `CONTRIBUTE_WEBHOOK_URL` constant at top of inline JS. Empty = disabled (UI visible but inactive).
- Failure-safe: if endpoint is down or CORS fails, capture is still analyzed locally and a clear error message is shown to the user.

### Changed
- Dropzone text updated to reflect multi-format support.

### Removed
- `joyonway_v35_addon.js`, `joyonway_v36_addon.js`, `joyonway_v37_addon.js`, `joyonway_v38_i18n.js`: these addons were designed to patch the V3.2 base. The V4.0 standalone implements equivalent functionality natively, so the addons became dead code.

---

## V4.0 (2026-05-30)

### Initial standalone release
- Single-file analyzer, no addon dependency, no external CDN.
- Auto-extraction of P23B32 frames using `1A...1D` delimiter with `1B XX` pseudo-escape handling.
- B4 broadcast decoder: water temperature, setpoint, filtration, heater, bubbler, pump LEFT.
- Statistics: frame count by CMD type, distribution chart.
- Frame list with consigne (setpoint command) highlighting.

---

## Acknowledgements
- KDy (HA forum): RS485 protocol decode for P23B32, oscilloscope analysis.
- Gaet78: reference HACS integration for P69B133, CRC-8 algorithm.
- Neuro: ESP32 + MAX485 testing on P23B32 V2.
- Alex: P25B85 hardware and frame captures.
- Yannickt26: P23B32 (P20B29 sticker) captures and forum feedback.
- mfo38, old-man: ongoing P69B133 and P25B85 testing.
