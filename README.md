# Joyonway P23B32 - Frame Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)

Outil d'analyse des captures RS485 du controleur de spa **Joyonway P23B32** via pont USR-W610.

Decode les trames binaires capturees pour identifier :

- Les broadcasts d'etat (temperature eau, consigne thermostat, etats equipements)
- Les commandes envoyees par l'app Joyonway (lumiere, pompes, bulleur, filtration)
- Les trames rares (potentielles nouvelles commandes a identifier)

## Compatibilite

Teste sur **Joyonway P23B32 V2 (2019)**. Les autres modeles (P20B29, P25B37, P25B85, P69B133) ont un protocole different mais cet outil peut servir de base d'analyse.

## Pre-requis

- Python 3.8 ou superieur
- Aucune dependance externe (que des modules standards : `re`, `collections`, `pathlib`)

## Installation

```bash
git clone https://github.com/KnapTheBuilder/joyonway-frame-analyzer.git
cd joyonway-frame-analyzer
```

Ou telecharger le ZIP depuis l'onglet **Releases** et l'extraire.

## Utilisation

### Etape 1 - Capture d'un fichier RS485

Sur le serveur Home Assistant ou tout systeme qui a `nc` (netcat) :

```bash
nc 192.168.1.34 8899 > capture.bin
```

Laisser tourner 5 a 15 minutes pour capter suffisamment de broadcasts. Ctrl+C pour arreter.

### Etape 2 - Analyse complete

```bash
python analyzer.py capture.bin
```

Affiche un rapport detaille avec :

- Statistiques globales (nombre de trames, tailles, types)
- Top 10 des trames les plus frequentes (broadcasts repetitifs)
- Trames rares (1-5 occurrences, potentielles commandes)
- Decodage du premier et dernier broadcast 0xB4 (temperature, consigne)
- Suggestions pour les prochaines captures

### Scripts cibles

**Evolution temperature dans le temps :**

```bash
python extract_temp.py capture.bin
```

**Recherche de commandes (utile pour decoder de nouvelles trames) :**

```bash
python find_commands.py capture.bin
```

Workflow recommande pour identifier une nouvelle commande :
1. Lancer une capture nc en continu
2. Pendant la capture, declencher UNE action via l'app Joyonway (ex. changer la consigne)
3. Arreter la capture
4. Lancer `find_commands.py` - la trame de commande apparait dans les rares

## Protocole decode

### Structure d'une trame

| Element | Valeur |
|---------|--------|
| Delimiteur debut | `0x1A` |
| Type (byte 5) | Voir tableau ci-dessous |
| Payload | Variable |
| Delimiteur fin | `0x1D` |

### Types de trames identifies

| Type | Hex | Role |
|------|-----|------|
| Commande equipement | `0xA1` | Lumiere, pompes, bulleur |
| Filtration / planning | `0xA4` | Mise a jour planning |
| Heartbeat / arret | `0xAA` | Etat repos ou arret total |
| Broadcast etat global | `0xB4` | Temperature, consigne, etats live |
| Polling capteurs | `0xA5` | Interrogation capteurs |
| Polling actionneurs | `0x2E` | Interrogation actionneurs |

### Broadcast 0xB4 - decodage byte par byte

Validation faite sur capture reelle 2026-05-13 :

| Byte | Hex observe | Decimal | Decodage |
|------|-------------|---------|----------|
| 9 | `0x5c` | 92 | Temperature eau en Fahrenheit (92F = 33.3C) |
| 14 | `0x21` | 33 | **Temperature eau en Celsius DIRECT** |
| 16 | `0x5f` | 95 | Consigne thermostat en Fahrenheit (95F = 35C) |
| 17 | `0x80` | 128 | Flags etats equipements (bitmask) |
| 60-67 | varie | - | Compteur cyclique et CRC (non valide cote spa) |

## Decouvertes communautaires

Plusieurs trames de notre integration HA sont en realite des **miroirs des broadcasts d'etat** du controleur. Le P23B32 ne valide pas le CRC, ce qui permet de rejouer ces trames avec les flags equipement modifies.

Exemple : la trame `CMD_ALL_OFF` actuellement utilisee est identique au broadcast `0xAA` capture 90 fois en 5 minutes en etat repos. C'est donc un **heartbeat de repos**, pas une vraie commande d'arret.

## Limitations connues

- Decodage des bits individuels du byte 17 (etats equipements) pas encore valide
- Trame de commande consigne thermostat pas encore capturee dans son format exact
- Aucune validation CRC (le controleur ne la fait pas non plus)

## Documentation complementaire

- [Guide de contribution](CONTRIBUTING.md)
- [docs/PROTOCOLE.md](docs/PROTOCOLE.md) - Specification protocole detaillee
- [docs/EXEMPLES.md](docs/EXEMPLES.md) - Exemples de captures commentees

## Liens utiles

- **Integration Home Assistant officielle** : https://github.com/KnapTheBuilder/ha-joyonway-p23b32
- **Thread Home Assistant Community** : https://community.home-assistant.io/t/joyonway-spa-control/582344
- **Documentation pont USR-W610** : https://www.pusr.com/products/wifi-rs485-converter-w610.html

## Remerciements

Ce projet n'aurait pas existe sans la communaute Home Assistant :

- **Gaet78** pour l'integration HACS originelle Joyonway et le decodage P69B133
- **KDy** pour l'analyse comparative des trames broadcast et la mesure oscilloscope confirmant le baudrate 38400 (26 us/bit)
- **Neuro** pour le travail ESP32+MAX485 sur le P23B32 V2

## Licence

[MIT](LICENSE)

## Auteur

[KnapTheBuilder](https://github.com/KnapTheBuilder) - 2026
