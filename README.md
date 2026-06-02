# Joyonway Frame Analyzer

A browser-based RS485 capture analyzer for Joyonway spa controllers, with multi-format upload, an opt-in contribution flow to help build the multi-model Home Assistant integration, and a bilingual EN / FR interface.

**Live tool**: https://knapthebuilder.github.io/joyonway-frame-analyzer/

## Features

- 100% client-side. No backend, no tracking, no external CDN.
- **Multi-format upload (V4.1)**: drop a `.bin` (raw bytes from `nc | dd`), `.txt`, `.log`, `.cap`, or `.hex` file. Auto-detects binary vs text. For text files, supports xxd output, raw hex, hex with spaces / commas / `0x` prefix. Comment lines starting with `#` are ignored.
- **EN / FR language switch (V4.2)**: floating top-right cyan pill, `FR | EN`. Default FR. Selection persists via localStorage.
- Frame extraction with `1A...1D` delimiter and `1B XX` pseudo-escape handling (P23B32).
- B4 broadcast decode: water temperature, setpoint, filtration, heater, bubbler, pump LEFT.
- Frame distribution statistics and CMD type counters.
- **Contribute card (V4.1)**: opt-in checkbox (checked by default) to anonymously share a capture with the ha-joyonway-multi project.

## Quick start

1. Open https://knapthebuilder.github.io/joyonway-frame-analyzer/
2. Pick your language via the FR / EN pill in the top-right corner.
3. Capture RS485 traffic from your spa:
   ```
   timeout 60 nc <W610_IP> 8899 | dd of=capture.bin
   ```
   or xxd text format:
   ```
   timeout 60 nc <W610_IP> 8899 | xxd > capture.txt
   ```
4. Drop the capture on the upload zone. Format is auto-detected.
5. Optional: leave the Contribute checkbox checked and fill in the declared model and context.

## Multi-Joyonway HA integration (in progress)

Mid-term goal: `ha-joyonway-multi`, a unified HA integration that auto-detects the controller model. Captures collected via the Contribute card feed the protocol mapping work.

Currently supported in the analyzer (decode only):
- **P23B32** (KDy validation, Christophe Knap reference)
- **P20B29** (Yannickt26, same protocol as P23B32 per KDy)

Partial mapping, contributions needed:
- **P25B85** (Alex, in collaboration)
- **P69B133** (Gaet78 reference, mfo38 testing)
- **P25B37**, **P68B123** (no public mapping yet)

## License

MIT. See `LICENSE`.

## Acknowledgements

Built collaboratively with the Home Assistant community. Thanks to KDy, Gaet78, Neuro, Alex, Yannickt26, mfo38, old-man.
