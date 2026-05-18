# Joyonway P23B32 RS485 Protocol — Documentation

This document describes the RS485 frame format used by the Joyonway P23B32 spa controller, as decoded by the community. Other Joyonway/Mesda/Balboa variants likely follow the same general structure with model-specific differences.

## Physical layer

- RS485 half-duplex, 38400 baud, 8N1
- Confirmed via oscilloscope measurement by KDy (community contribution)
- Some W610 bridges may have a "Baudrate Adaptive (RFC2117)" option that should be **DISABLED** for stable operation

## Frame structure

```
[1A] [dst] [src] [len] [payload...] [CRC 4 bytes] [1D]
```

| Byte position | Meaning |
|---|---|
| 0 | Start delimiter, always 0x1A |
| 1 | Destination address (0xFF = broadcast) |
| 2 | Source address (typically 0x01 for the main controller) |
| 3 | Length byte |
| 4..N | Payload (command + data) |
| N+1..N+4 | CRC or signature (4 bytes) |
| Last | End delimiter, always 0x1D |

## Pseudo-escape mechanism

Inside the payload, any byte equal to one of the framing bytes must be escaped:

| Original byte | Escaped sequence |
|---|---|
| 0x1A | 0x1B 0x11 |
| 0x1B | 0x1B 0x0B |
| 0x1C | 0x1B 0x13 |
| 0x1D | 0x1B 0x14 |
| 0x1E | 0x1B 0x15 |

A raw capture must be unescaped before extracting payload semantics. The frame analyzer does this automatically when `useUnescape` is enabled in the format definition.

Credit to KDy for discovering this mechanism (HA community forum post #90).

## Known command types

| CMD | Direction | Purpose |
|---|---|---|
| B4 | Controller broadcast (dst=FF, src=01) | Periodic state broadcast (water temp, setpoint, equipment states) |
| A5 | Controller to module | Module poll request |
| 2E | Module to controller | Module poll response (typically temperature sensors) |
| AA | Module to controller | Module status response |
| A1 | Keypad to controller | Setpoint or equipment command |

## Broadcast frame (B4) byte mapping

Decoded by KDy and verified against captures:

| Byte index in payload | Meaning |
|---|---|
| 9 | Water temperature in degrees Fahrenheit |
| 12 (bit 0x04) | Left pump ON/OFF |
| 12 (bit 0x10) | Right pump ON/OFF |
| 14 (bit 0x01) | Filtration ON/OFF |
| 14 (bit 0x08) | Blower (bubbler) ON/OFF |
| 14 (bit 0x10) | Heater state |
| 14 (= 0xC1) | UV / ozonator running |
| 16 | Setpoint in degrees Fahrenheit |
| 17 (bit 0x01) | Light ON/OFF |
| 53 | Year offset (year = 2000 + this byte) |
| 54 | Month |
| 55 | Day |
| 56 | Hour |
| 57 | Minute |
| 58 | Second |

Convert Fahrenheit to Celsius: `C = (F - 32) * 5 / 9`

## Command frames (A1)

Sent by the keypad (src=0x30) to the controller (dst=0x01).

```
1A 01 30 10 3C A1 00 A1 [...payload...] [CRC] 1D
```

Examples confirmed by replay (each frame sent 10 times at 0.5s interval):

| Action | Hex frame |
|---|---|
| Light ON | `1A 01 30 10 3C A1 00 A1 00 00 40 40 02 04 00 00 81 ED BA A0 1B 14 1D` |
| Light OFF | `1A 01 30 10 3C A1 00 A1 00 00 40 40 02 04 00 00 80 5A 20 CD C1 1D` |
| Left pump ON | `1A 01 30 10 3C A1 00 A1 06 04 00 00 02 04 00 00 00 8B 3E E4 13 1D` |
| Right pump ON | `1A 01 30 10 3C A1 00 A1 18 10 00 00 02 04 00 00 00 40 D1 2D E0 1D` |
| Blower ON | `1A 01 30 10 3C A1 00 A1 00 00 04 04 02 04 00 00 00 0F 7F 1B 11 76 1D` |
| Filtration | `1A 01 30 10 3C A4 00 A1 62 05 00 16 00 17 00 06 00 FC 79 54 C6 1D` |
| All OFF | `1A 01 30 08 3C AA 00 02 13 8C E4 26 8B 1D` |

## Open questions

- **Setpoint command frame byte positions**: byte 16 of payload is suspected to contain setpoint value in Fahrenheit. To be confirmed with controlled captures.
- **CRC algorithm**: 4 trailing bytes before 0x1D. No known algorithm yet, but the controller does not verify them on incoming frames (replay attacks work).
- **Ozonator state byte**: KDy observed byte 14 = 0xC1 corresponds to UV/ozonator active.

## References

- KDy decoder (Python) — Home Assistant community forum, post #90
- c0mpleX broadcast samples — forum post #83
- Gaet78 P69B133 integration — different model, similar protocol family
