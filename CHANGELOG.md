# Changelog

All notable changes to the Joyonway Frame Analyzer.

## V4.2 (2026-06-01)

### Added
- EN / FR language switch: floating top-right pill (cyan). Default FR. Persistence via localStorage `joyonway_lang`.
- Full bilingual coverage of static and dynamic UI strings.
- MutationObserver with 80 ms debounce for translating dynamically injected content.
- WeakMap cache on text nodes for lossless FR <-> EN switching.

### Changed
- Version pill, footer, and page title bumped to V4.2.

---

## V4.1 (2026-06-01)

### Added
- Multi-format upload: automatic detection of binary vs text content. Accepts `.bin`, `.txt`, `.log`, `.cap`, `.hex`.
- Contribute card: opt-in checkbox (checked by default) sending anonymous JSON payload to ha-joyonway-multi endpoint.
- 3-second debounce, optional fields for declared controller model, panel model, capture context.
- Payload truncation at 100 KB hex (50 KB raw data).
- Endpoint configurable via `CONTRIBUTE_WEBHOOK_URL` constant. Empty = disabled.
- Failure-safe: capture is always analyzed locally regardless of send success.

### Changed
- Dropzone text updated to reflect multi-format support.

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
- KDy: RS485 protocol decode for P23B32, oscilloscope analysis.
- Gaet78: reference HACS integration for P69B133, CRC-8 algorithm.
- Neuro: ESP32 + MAX485 testing on P23B32 V2.
- Alex: P25B85 hardware and frame captures.
- Yannickt26: P23B32 (P20B29 sticker) captures and forum feedback.
- mfo38, old-man: ongoing P69B133 and P25B85 testing.
