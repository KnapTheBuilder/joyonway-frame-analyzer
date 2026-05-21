# Joyonway Frame Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://knapthebuilder.github.io/joyonway-frame-analyzer/)
[![Profiles](https://img.shields.io/badge/profiles-2-blue)](profiles/)

**RS485 frame analyzer for Joyonway spa controllers - 100% local, multi-model, community-driven**

**Analyseur de trames RS485 pour controleurs de spa Joyonway - 100% local, multi-modeles, communautaire**

[Live app](https://knapthebuilder.github.io/joyonway-frame-analyzer/) | [Discussion forum](https://community.home-assistant.io/t/joyonway-spa-control/582344)

---

# English

## What is this?

A browser-based tool that decodes RS485 binary captures from Joyonway spa controllers. Drag a `.bin` file, instantly see what frames mean: water temperature, setpoint, equipment states, commands sent by the official app.

Works 100% in your browser. **No data sent anywhere**. No backend, no server, no tracking.

## Why?

Joyonway controllers communicate via RS485 with proprietary protocols that differ across models:
- **P23B32 V2** uses delimiter `0x1A...0x1D` at 38400 baud
- **P69B133** uses delimiter `0x7E...0x7E` at 115200 baud (Balboa-like)
- Other models likely use other variants

This tool gives you the keys to:
1. Identify which protocol your controller uses
2. Decode captured frames (temperature, setpoint, equipment states)
3. Find new commands by capturing user actions
4. Contribute your findings back to enable Home Assistant integration

## Quick start

### 1. Capture frames from your spa

On your Home Assistant server (or any system with `nc`):

```bash
nc YOUR_W610_IP 8899 > capture.bin
```

Let it run 5-15 minutes, then Ctrl+C.

### 2. Open the analyzer

Go to: **[knapthebuilder.github.io/joyonway-frame-analyzer/](https://knapthebuilder.github.io/joyonway-frame-analyzer/)**

### 3. Drop your capture

Drag-drop the `.bin` file. Instant analysis.

### 4. Contribute (optional)

If your model is not yet supported, click **Contribute this capture** to share it with the community.

## Supported models

| Model | Protocol | Status |
|-------|----------|--------|
| Joyonway P23B32 V2 (2019) | `0x1A`/`0x1D` @ 38400 baud | Validated |
| Joyonway P69B133 (Balboa-like) | `0x7E`/`0x7E` @ 115200 baud | Reference |
| Custom | User-defined | Available |

[Browse all profiles](profiles/) | [Add a new model](profiles/README.md#adding-a-new-model)

## Features

- Browser-based, zero install, zero dependencies
- Multi-model support via JSON profiles (community-extensible)
- Auto-detection of protocol family
- Pseudo-escape decoding (`1B XX`)
- Custom mode (define your own delimiter and offsets)
- Scan-all-delimiters mode (brute force discovery)
- Frame-by-frame diff
- Statistics by (Source, Command)
- Reference frame marking
- Hex dump and xxd format support
- Mobile-friendly responsive UI
- Optional GitHub Issue contribution from the app

## Related projects

- **Home Assistant integration** (P23B32 V2): [github.com/KnapTheBuilder/ha-joyonway-p23b32](https://github.com/KnapTheBuilder/ha-joyonway-p23b32)
- **Home Assistant integration** (Balboa-like): [github.com/gaet78/homeassistant-joyonway-hacs-](https://github.com/gaet78/homeassistant-joyonway-hacs-)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

Quick paths:
- Share a capture: [open an issue](https://github.com/KnapTheBuilder/joyonway-frame-analyzer/issues/new?template=capture_share.md)
- Add a new model: see [profiles/README.md](profiles/README.md)
- Report a bug: [open an issue](https://github.com/KnapTheBuilder/joyonway-frame-analyzer/issues/new?template=bug_report.md)

## Credits

This project exists thanks to the Home Assistant Joyonway community:

- **[@gaet78](https://github.com/gaet78)** - Original HACS integration, P69B133 reverse engineering
- **@KDy** - Oscilloscope baudrate validation, pseudo-escape decoding
- **@Neuro** - ESP32+MAX485 prototype on P23B32 V2
- **@Yannickt26** - Capture contributions
- **All community members** of the [JoyOnWay Spa Control](https://community.home-assistant.io/t/joyonway-spa-control/582344) thread

## License

[MIT](LICENSE)

---

# Francais

## Qu'est-ce que c'est ?

Un outil dans le navigateur qui decode les captures binaires RS485 des controleurs de spa Joyonway. Tu glisses un fichier `.bin`, tu vois instantanement ce que disent les trames : temperature de l'eau, consigne, etats des equipements, commandes envoyees par l'app officielle.

100% dans ton navigateur. **Aucune donnee envoyee**. Pas de backend, pas de serveur, pas de tracking.

## Pourquoi ?

Les controleurs Joyonway communiquent en RS485 avec des protocoles proprietaires qui different selon les modeles :
- **P23B32 V2** utilise les delimiteurs `0x1A...0x1D` a 38400 bauds
- **P69B133** utilise les delimiteurs `0x7E...0x7E` a 115200 bauds (type Balboa)
- D'autres modeles utilisent probablement d'autres variantes

Cet outil te donne les cles pour :
1. Identifier quel protocole utilise ton controleur
2. Decoder les trames capturees (temperature, consigne, etats)
3. Trouver de nouvelles commandes en capturant les actions utilisateur
4. Contribuer tes decouvertes pour ameliorer l'integration Home Assistant

## Demarrage rapide

### 1. Capturer les trames de ton spa

Sur ton serveur Home Assistant (ou tout systeme avec `nc`) :

```bash
nc IP_DE_TON_W610 8899 > capture.bin
```

Laisse tourner 5 a 15 minutes, puis Ctrl+C.

### 2. Ouvrir l'analyseur

Va sur : **[knapthebuilder.github.io/joyonway-frame-analyzer/](https://knapthebuilder.github.io/joyonway-frame-analyzer/)**

### 3. Deposer ta capture

Glisse-depose le fichier `.bin`. Analyse instantanee.

### 4. Contribuer (optionnel)

Si ton modele n'est pas encore supporte, clique sur **Contribuer cette capture** pour la partager avec la communaute.

## Modeles supportes

| Modele | Protocole | Statut |
|--------|-----------|--------|
| Joyonway P23B32 V2 (2019) | `0x1A`/`0x1D` a 38400 bauds | Valide |
| Joyonway P69B133 (type Balboa) | `0x7E`/`0x7E` a 115200 bauds | Reference |
| Custom | Personnalise par l'utilisateur | Disponible |

[Voir tous les profils](profiles/) | [Ajouter un nouveau modele](profiles/README.md#adding-a-new-model)

## Fonctionnalites

- Dans le navigateur, zero installation, zero dependance
- Multi-modeles via profils JSON (extensible par la communaute)
- Auto-detection du protocole
- Decodage pseudo-escape (`1B XX`)
- Mode Custom (definir tes propres delimiteurs et offsets)
- Mode Scan-all-delimiters (decouverte par force brute)
- Diff trame par trame
- Statistiques par (Source, Commande)
- Marquage de trame de reference
- Support hex dump et format xxd
- Interface responsive mobile
- Contribution optionnelle via GitHub Issue depuis l'app

## Projets lies

- **Integration Home Assistant** (P23B32 V2) : [github.com/KnapTheBuilder/ha-joyonway-p23b32](https://github.com/KnapTheBuilder/ha-joyonway-p23b32)
- **Integration Home Assistant** (type Balboa) : [github.com/gaet78/homeassistant-joyonway-hacs-](https://github.com/gaet78/homeassistant-joyonway-hacs-)

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md).

Raccourcis :
- Partager une capture : [ouvrir une issue](https://github.com/KnapTheBuilder/joyonway-frame-analyzer/issues/new?template=capture_share.md)
- Ajouter un nouveau modele : voir [profiles/README.md](profiles/README.md)
- Signaler un bug : [ouvrir une issue](https://github.com/KnapTheBuilder/joyonway-frame-analyzer/issues/new?template=bug_report.md)

## Remerciements

Ce projet existe grace a la communaute Joyonway de Home Assistant :

- **[@gaet78](https://github.com/gaet78)** - Integration HACS originelle, reverse engineering P69B133
- **@KDy** - Validation baudrate oscilloscope, decodage pseudo-escape
- **@Neuro** - Prototype ESP32+MAX485 sur P23B32 V2
- **@Yannickt26** - Contributions de captures
- **Tous les membres de la communaute** du thread [JoyOnWay Spa Control](https://community.home-assistant.io/t/joyonway-spa-control/582344)

## Licence

[MIT](LICENSE)
