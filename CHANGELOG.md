# Changelog

## v2.0.0 - 2026-05-21

Architecture refactor: multi-model JSON profiles, community contribution workflow.

### Added

- `profiles/` directory with JSON-based model descriptions
- Two initial profiles: `p23b32_v2.json` (validated), `p69b133.json` (reference)
- `_template.json` for community contributions
- Issue templates: bug, capture share, new model profile
- GitHub Actions workflow for auto-deploy to GitHub Pages on push to main
- GitHub Actions workflow for JSON profile validation on PR
- Bilingual README (English / Francais)
- Bilingual CONTRIBUTING (English / Francais)
- `docs/PROFILES.md` complete guide for adding new models

### Changed

- README restructured for clarity and dual-language support
- Project structure now supports community model contributions without code changes

### Deprecated

- Previous hard-coded FORMATS object in JavaScript (to be replaced by dynamic JSON loading in next minor version)

### Credits for this release

- @KnapTheBuilder - Architecture, profiles, docs
- @gaet78 - P69B133 reference data
- @KDy - P23B32 V2 oscilloscope validation
- @Neuro - ESP32+MAX485 prototype data
- @Yannickt26 - Community captures
