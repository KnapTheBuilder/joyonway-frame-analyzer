# Joyonway Frame Analyzer

A browser-based RS485 capture analyzer for Joyonway spa controllers, with multi-model semantic decoding and an Anglo-French interface.

**Live tool**: https://knapthebuilder.github.io/joyonway-frame-analyzer/

**Supported controllers**:
- P23B32 / Mesda (delimiter 1A...1D, pseudo-escape 1B XX)
- P25B85 (longer broadcasts, heating stages)
- P69B133 / Gaet78 (delimiter 7E, CRC-8 validation)
- P25B37, P20B29, P68B123 (detected, no public mapping yet, contributions welcome)

**Features**:
- Drop or paste an RS485 capture (xxd output, raw hex, forum copy-paste, etc.)
- Auto-detect controller model and decode frames byte by byte with named fields
- Diff two frames side by side to identify which bytes carry the action
- Byte position statistics across all frames of the same Src + CMD pair
- CRC-8 validation badge for P69B133 frames
- One-click community contribution flow (V3.7): pre-filled GitHub issue, downloadable contribution.md
- EN / FR language switch with persistence (V3.8)

**How it works**:
- 100<code>%</code> client-side. No data leaves your browser unless you explicitly use the Contribute button.
- No backend, no tracking, no authentication.
- Single HTML file plus four JS addons, total under 130 KB. Hosted on GitHub Pages.

## Quick start

1. Open the live tool: <code>https://knapthebuilder.github.io/joyonway-frame-analyzer/</code>
2. Capture RS485 traffic from your spa. Recommended one-liner: <code>timeout 60 nc &lt;W610_IP&gt; 8899 | xxd &gt; capture.txt</code>. Disable any active Home Assistant Joyonway integration first (only one TCP client on the W610 at a time).
3. Drop <code>capture.txt</code> on the upload zone.
4. The analyzer auto-detects your model and shows frame interpretations.
5. Click any frame to see byte-by-byte decoding.
6. Mark a frame as reference, then click another frame to see the semantic diff.

## Contribute a new model or capture

If your controller is detected as "no public mapping" or "Unknown protocol":

1. Load a representative capture in the analyzer.
2. Scroll to section 7 "Contribute to community".
3. Fill model, keypad, bridge, GitHub handle, and a short context (what you were doing during the capture).
4. Tick the consent box (MIT, no PII).
5. Click "Submit to maintainer (via GitHub)" to open a pre-filled GitHub issue, or "Download contribution.md" to send the file via the HA community forum.

The maintainer is auto-notified via webhook on every new issue with the <code>new-controller</code> or <code>capture-analysis</code> label.

## Local install

If you prefer to run it locally (e.g. inside Home Assistant <code>/config/www/</code>):

1. Copy the 5 files from <code>docs/</code> to your local web folder.
2. Open <code>joyonway_frame_analyzer.html</code> (keep the original filename locally) directly with your browser, or serve via HA at <code>/local/joyonway_frame_analyzer.html</code>.
3. All 4 JS addons are loaded relatively, no CDN required.

## Repository structure

<code>
docs/                       GitHub Pages content
  index.html                Main analyzer (renamed from joyonway_frame_analyzer.html)
  joyonway_v35_addon.js     Multi-model interpretation engine (V3.5.1)
  joyonway_v36_addon.js     P69B133 CRC-8 validation
  joyonway_v37_addon.js     Community contribution card
  joyonway_v38_i18n.js      EN / FR language switch
CHANGELOG.md                Version history
README.md                   This file
</code>

## Tech

- Vanilla JavaScript, no build step, no dependencies.
- HTML5 + ES6, works on all modern browsers including Safari iOS.
- Single-file analyzer; addons are non-invasive (idempotent injection, defensive DOM lookups, original-content cache).

## Related projects

- <code>ha-joyonway-p23b32</code>: companion Home Assistant integration for P23B32 (in progress, pending setpoint frame capture).
- Gaet78's <code>ha-joyonway-p69b133</code>: production-grade integration for P69B133.

## License

MIT. See <code>LICENSE</code> file.

## Acknowledgements

Built collaboratively with the Home Assistant community. Special thanks to KDy, Gaet78, Neuro, Alex, and Yannickt26 for protocol decoding, captures, and feedback. See <code>CHANGELOG.md</code> for per-version credits.
