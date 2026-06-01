# Joyonway Frame Analyzer

A browser-based RS485 capture analyzer for Joyonway spa controllers, with multi-format upload and an opt-in contribution flow to help build the multi-model Home Assistant integration.

**Live tool**: https://knapthebuilder.github.io/joyonway-frame-analyzer/

## Features

- 100% client-side. No backend, no tracking, no external CDN. Open the URL and use it.
- **Multi-format upload (V4.1)**: drop a `.bin` (raw bytes from `nc | dd`), `.txt`, `.log`, `.cap`, or `.hex` file. Auto-detects binary vs text. For text files, supports xxd output, raw hex, hex with spaces / commas / `0x` prefix. Comment lines starting with `#` are ignored.
- Frame extraction with `1A...1D` delimiter and `1B XX` pseudo-escape handling (P23B32).
- B4 broadcast decode: water temperature, setpoint, filtration, heater, bubbler, pump LEFT.
- Frame distribution statistics and CMD type counters.
- **Contribute card (V4.1)**: opt-in checkbox (checked by default) to anonymously share a capture with the ha-joyonway-multi project. Helps expand model coverage to P25B85, P69B133, P25B37, P20B29, P68B123, and others.

## Quick start

1. Open https://knapthebuilder.github.io/joyonway-frame-analyzer/
2. Capture RS485 traffic from your spa:
   ```
   timeout 60 nc <W610_IP> 8899 | dd of=capture.bin
   ```
   or in xxd text format:
   ```
   timeout 60 nc <W610_IP> 8899 | xxd > capture.txt
   ```
   Important: only one TCP client at a time on the W610. Disable any active Home Assistant Joyonway integration before capturing.
3. Drop the capture on the upload zone.
4. The analyzer auto-detects format and shows decoded frames, statistics, and consigne (setpoint) highlights.
5. Optional: leave the "Contribute" checkbox checked and fill in the declared model and context to share anonymously with the multi-model project.

## Multi-Joyonway HA integration (in progress)

The mid-term goal is `ha-joyonway-multi`, a unified Home Assistant integration that auto-detects the controller model and uses the right protocol driver. Captures collected via the Contribute card directly feed the protocol mapping work.

Currently supported models in the analyzer (decode only):
- **P23B32** (KDy validation, Christophe Knap reference)
- **P20B29** (Yannickt26, confirmed same protocol as P23B32 by KDy)

Models with partial mapping, contributions needed:
- **P25B85** (Alex, in collaboration)
- **P69B133** (Gaet78 reference, used by mfo38)
- **P25B37**, **P68B123** (no public mapping yet)

## Local install

If you prefer running offline (for example, inside Home Assistant at `/config/www/`):
1. Copy `docs/index.html` to your local web folder.
2. Open it directly with your browser, or serve via HA at `/local/index.html`.
3. No dependencies, no build step.

## Repository structure

```
joyonway-frame-analyzer/
  .gitignore
  .nojekyll
  LICENSE
  README.md                    (this file)
  CHANGELOG.md
  commit_message.txt
  index.html                   (root redirect to docs/)
  docs/
    .nojekyll
    index.html                 (frame analyzer V4.1, standalone)
```

## Companion projects

- `ha-joyonway-p23b32`: current HA integration for P23B32 read-only sensors. Will be superseded by `ha-joyonway-multi`.
- `ha-joyonway-multi`: planned unified multi-model integration, fed by captures collected via this analyzer.
- Gaet78's `ha-joyonway-p69b133`: production-grade integration for P69B133, recommended for those controllers.

## License

MIT. See `LICENSE`.

## Acknowledgements

Built collaboratively with the Home Assistant community. Special thanks to KDy, Gaet78, Neuro, Alex, Yannickt26, mfo38, old-man, and everyone sharing captures or hardware insight. See `CHANGELOG.md` for per-version credits.
