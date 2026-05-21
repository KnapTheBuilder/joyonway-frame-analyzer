# Joyonway Frame Analyzer v2

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live App](https://img.shields.io/badge/demo-live-brightgreen)](https://knapthebuilder.github.io/joyonway-frame-analyzer/)

**Multi-model RS485 frame analyzer for Joyonway spa controllers - 100% local, community-driven**

**Analyseur multi-modeles de trames RS485 pour controleurs de spa Joyonway - 100% local, communautaire**

[Live app](https://knapthebuilder.github.io/joyonway-frame-analyzer/) | [Discussion thread](https://community.home-assistant.io/t/joyonway-spa-control/582344)

---

# English

## What changed in v2

This release integrates the community findings posted on the Home Assistant forum:

- **Correct pseudo-escape table** (from @KDy post #90)
- **Setpoint command frame** (from @Yannickt26 post #110)
- **Unified profile** for P23B32 V2, P20B29 and P25B85 (same protocol)
- **Separate profile** for P69B133 (different protocol family by @gaet78)

## What this tool does

A browser-based analyzer that decodes RS485 binary captures from Joyonway spa controllers. Drop a `.bin` file, see what frames mean: water temperature, setpoint, equipment states, commands.

100% in your browser. **No data sent anywhere**.

## Supported models

| Model | Protocol family | Status |
|-------|----------------|--------|
| Joyonway P23B32 V2 (2019) | 1A/1D @ 38400 baud | Validated |
| Joyonway P20B29-2032 V183 | 1A/1D @ 38400 baud | Validated |
| Joyonway P25B85 | 1A/1D @ 38400 baud | Validated |
| Joyonway P69B133 | 7E/7E @ 115200 baud | Reference (use @gaet78 integration) |

The three first models share the EXACT same protocol after applying the KDy unescape table. They all map to the same JSON profile.

## Quick start

### 1. Capture frames

```bash
nc YOUR_W610_IP 8899 > capture.bin
```

Let it run 5-15 minutes while changing spa state (setpoint, pump, light).

### 2. Open the analyzer

[knapthebuilder.github.io/joyonway-frame-analyzer/](https://knapthebuilder.github.io/joyonway-frame-analyzer/)

### 3. Drop your capture

Drag-drop the `.bin` file. Instant analysis with proper unescape.

## The unescape table (KDy post #90)

For 1A/1D family controllers, pseudo-escape sequences in raw RS485 data must be resolved BEFORE reading byte positions:

```
0x1B 0x11  ->  0x1A
0x1B 0x13  ->  0x1C
0x1B 0x14  ->  0x1D
0x1B 0x15  ->  0x1E
0x1B 0x0B  ->  0x1B
```

Without this transformation, byte positions shift after the first 0x1B in the frame and decoding is incorrect.

## B4 broadcast decoding (post-unescape, KDy parser)

| Byte | Field | Notes |
|------|-------|-------|
| 9 | Water temperature | Fahrenheit |
| 12 | Pump flags | bit 0x02 filtering, bit 0x04 massage |
| 14 | Heating state | 0x50 circulation, 0x54 heating, 0x40 cooldown, 0x20 off |
| 14 | Ozonator (P25B85) | 0xC1 = active |
| 16 | Setpoint | Fahrenheit |
| 17 | Light flags | bit 0x01 light |
| 53-58 | Date/time | YYYY MM DD HH MM SS |

## Setpoint command frame

To change setpoint, send an A1 command frame with byte 15 = setpoint in Fahrenheit:

```
1a 01 30 10 3c a1 00 a1 00 00 80 80 02 04 00 [degF] 00 96 20 [CRC4] 1d
```

Conversion: `byte_15 = round((celsius * 9 / 5) + 32)`

Examples (validated by @Yannickt26):
- 38C = 100F = 0x64
- 10C = 50F = 0x32

**Important**: CRC bytes (positions 17-20) change with the setpoint value. Capture each value from your panel for replay safety, OR adopt the formula above with the warning that CRC must be captured or computed.

## Prerequisites for manual control

Per the official PB555 panel manual (cited by @KDy):

- **Manual heater control**: requires activating "Thermostat manuel" in the PB555 panel menu
- **Manual ozone control**: requires activating manual mode in the PB555 panel menu

Without these activations, no software command can pilot the corresponding equipment.

## Credits

This work exists thanks to:

- **@KDy** - Complete unescape table (post #90), B4 parser, oscilloscope baudrate validation, PB555 manual research
- **@Yannickt26** - P20B29 captures (post #109), setpoint command frames (post #110)
- **@gaet78** - Original Joyonway HACS integration (for P69B133), reverse engineering pioneer
- **@Neuro** - ESP32+MAX485 prototype on P23B32 V2
- **@old-man** - P25B85 confirmation
- **All community members** of the [JoyOnWay Spa Control](https://community.home-assistant.io/t/joyonway-spa-control/582344) thread

## License

[MIT](LICENSE)

---

# Francais

## Nouveautes v2

Cette version integre les decouvertes communautaires partagees sur le forum Home Assistant :

- **Table d'unescape correcte** (@KDy post #90)
- **Trame commande consigne** (@Yannickt26 post #110)
- **Profil unifie** pour P23B32 V2, P20B29 et P25B85 (meme protocole)
- **Profil separe** pour P69B133 (famille differente par @gaet78)

## Modeles supportes

| Modele | Famille protocole | Statut |
|--------|-------------------|--------|
| Joyonway P23B32 V2 (2019) | 1A/1D @ 38400 bauds | Valide |
| Joyonway P20B29-2032 V183 | 1A/1D @ 38400 bauds | Valide |
| Joyonway P25B85 | 1A/1D @ 38400 bauds | Valide |
| Joyonway P69B133 | 7E/7E @ 115200 bauds | Reference (utiliser integration @gaet78) |

Les trois premiers modeles partagent EXACTEMENT le meme protocole apres application de la table d'unescape KDy. Ils utilisent tous le meme profil JSON.

## Demarrage rapide

### 1. Capturer

```bash
nc IP_DE_TON_W610 8899 > capture.bin
```

5-15 minutes en changeant l'etat du spa (consigne, pompe, lumiere).

### 2. Ouvrir l'analyseur

[knapthebuilder.github.io/joyonway-frame-analyzer/](https://knapthebuilder.github.io/joyonway-frame-analyzer/)

### 3. Deposer la capture

Glisse-depose le fichier `.bin`. Analyse instantanee avec unescape correct.

## Pre-requis controle manuel

D'apres le manuel officiel du panneau PB555 (cite par @KDy) :

- **Chauffage manuel** : activer "Thermostat manuel" dans le menu du panneau PB555
- **Ozone manuel** : activer le mode manuel dans le menu du panneau PB555

Sans ces activations, aucune commande logicielle ne peut piloter ces equipements.

## Remerciements

Ce travail existe grace a :

- **@KDy** - Table d'unescape complete (post #90), parser B4, validation baudrate oscilloscope, recherche manuel PB555
- **@Yannickt26** - Captures P20B29 (post #109), trames commande consigne (post #110)
- **@gaet78** - Integration HACS Joyonway originelle (pour P69B133), pionnier du reverse engineering
- **@Neuro** - Prototype ESP32+MAX485 sur P23B32 V2
- **@old-man** - Confirmation P25B85
- **Tous les membres** du thread [JoyOnWay Spa Control](https://community.home-assistant.io/t/joyonway-spa-control/582344)
