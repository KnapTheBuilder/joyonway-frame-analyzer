# Profiles - Multi-model decoding catalog

This directory contains JSON profiles for each supported Joyonway spa model.

The frame analyzer app loads all `*.json` files in this directory at startup, so adding a new model is as simple as adding a new file (no JavaScript changes needed).

## Available profiles

| File | Model | Status | Contributors |
|------|-------|--------|--------------|
| `p23b32_v2.json` | Joyonway P23B32 V2 (2019) | Validated | @KnapTheBuilder, @KDy, @Neuro |
| `p69b133.json` | Joyonway P69B133 (Balboa-like) | Reference | @gaet78 |
| `_template.json` | Template for new models | - | - |

## Adding a new model

### Method 1 - Pull Request (recommended)

1. Fork this repository
2. Copy `_template.json` to `your_model_id.json` (e.g. `p25b85.json`)
3. Fill in all fields based on your captures
4. Submit a Pull Request
5. After merge, GitHub Actions deploys the updated app automatically

### Method 2 - GitHub Issue

If you cannot make a PR, open an issue with the `new_model` template and attach:

- Your capture file (`.bin`)
- A draft JSON profile (use `_template.json` as base)
- Description of how you obtained the capture

A maintainer will create the profile for you.

## Profile schema

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique model identifier (lowercase, underscores) |
| `name` | string | Display name |
| `status` | string | `validated`, `reference`, `draft`, `experimental` |
| `physical.baudrate` | integer | RS485 baudrate in baud |
| `frame_format.delimiter_start` | hex string | Start delimiter (e.g. `"0x1A"`) |
| `frame_format.delimiter_end` | hex string | End delimiter |
| `frame_format.type_byte_offset` | integer | Index of the type byte in frames |

### Optional but useful

| Field | Description |
|-------|-------------|
| `known_types` | Dictionary of identified frame types |
| `broadcast_fields` | Decoded fields from status broadcasts |
| `command_frames` | Validated command frames in hex |
| `transmission` | How to send commands |
| `addresses` | Bus addresses if multi-device protocol |
| `notes` | Free text notes |

## Validation

Profiles are validated automatically by GitHub Actions on every PR:

- JSON syntax check
- Required fields present
- Hex strings well-formatted

## Status levels

- `validated` : Tested on real hardware by at least one contributor
- `reference` : Documented from external source (other repo, paper, etc.)
- `draft` : Work in progress, may have errors
- `experimental` : Untested, use with caution

## License

All profiles in this directory are MIT-licensed.
By contributing a profile, you agree to publish it under MIT.
