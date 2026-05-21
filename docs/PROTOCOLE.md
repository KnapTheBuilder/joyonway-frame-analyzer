# Specification du protocole RS485 Joyonway P23B32

Document de reference sur le decodage observe pour le controleur **Joyonway P23B32 V2 (2019)**.

## Parametres physiques de la liaison

| Parametre | Valeur |
|-----------|--------|
| Baudrate | 38400 baud |
| Bits de donnees | 8 |
| Parite | None |
| Stop bits | 1 |
| Niveau electrique | RS485 differentiel |

**Note** : la documentation officielle Joyonway P69B133 indique 9600 baud, mais une mesure oscilloscope par KDy sur le P23B32 V2 a confirme 26 us par bit, soit **38400 baud**.

## Format des trames

Toutes les trames suivent le meme schema :

```
0x1A [payload variable] 0x1D
```

- `0x1A` : delimiteur de debut
- `0x1D` : delimiteur de fin
- Le **byte 5** (index zero) indique le **type de trame**

## Types de trames identifies

| Hex | Role | Frequence observee |
|-----|------|---------------------|
| `0xA1` | Commande equipement (lumiere, pompes, bulleur, consigne) | Rare (envoi utilisateur) |
| `0xA4` | Filtration / planning de filtration | Tres rare |
| `0xAA` | Heartbeat / etat repos | Tres frequent (~10s) |
| `0xB4` | Broadcast etat global (temperature, consigne, etats) | Frequent (~30s) |
| `0xA5` | Polling capteurs | Tres frequent (interne controleur) |
| `0x2E` | Polling actionneurs | Tres frequent (interne controleur) |

## Broadcast 0xB4 (69 bytes)

Exemple capture le 2026-05-13 a 11h13 :

```
1aff013cd2b4ff08025c0414007f21005f80020b1b150d000e000f1b150020
c5000000170006000000144f0000000000000000000000001b11050d0b0d2e
03004b9aa1171d
```

### Decodage byte par byte

| Byte | Valeur | Decimal | Decodage |
|------|--------|---------|----------|
| 0 | `0x1A` | - | Delimiteur debut |
| 1 | `0xFF` | - | Broadcast (adresse destination = tous) |
| 2 | `0x01` | - | Adresse source (controleur) |
| 3 | `0x3C` | - | Longueur payload (60 bytes utiles) |
| 4 | `0xD2` | - | Signature ou marqueur |
| 5 | `0xB4` | - | **Type : broadcast etat global** |
| 6 | `0xFF` | - | ? |
| 7 | `0x08` | - | ? |
| 8 | `0x02` | - | ? |
| 9 | `0x5C` | 92 | Temperature eau (Fahrenheit) |
| 10 | `0x04` | - | ? |
| 11 | `0x14` | - | ? |
| 12 | `0x00` | - | ? |
| 13 | `0x7F` | - | ? |
| **14** | `0x21` | **33** | **Temperature eau (Celsius DIRECT)** |
| 15 | `0x00` | - | ? |
| **16** | `0x5F` | **95** | **Consigne thermostat (Fahrenheit = 35C)** |
| **17** | `0x80` | **128** | **Flags etats equipements (bitmask)** |
| 18-59 | varie | - | Etats detailles equipements, planning, debug |
| 60-63 | varie | - | Compteur cyclique |
| 64-67 | varie | - | Pseudo-CRC (non valide cote controleur) |
| 68 | `0x1D` | - | Delimiteur fin |

### Conversion temperature

**Fahrenheit vers Celsius :** `C = (F - 32) x 5 / 9`

Exemples :
- 92F = 33.3C (temperature byte 9)
- 95F = 35.0C (consigne byte 16)
- 104F = 40.0C (consigne max)
- 60F = 15.5C (consigne min)

## Commandes 0xA1 (commandes equipement)

Les commandes envoyees par l'app Joyonway au controleur ont le format :

```
1A 01 30 10 3C A1 00 A1 [flags 8-15] BB [...] 1D
```

ou `BB` est le byte 16 contenant la consigne (en Fahrenheit, plage 60-104).

### Trames de commande identifiees

Captures lors de tests en mai 2026 :

| Action | Trame hex |
|--------|-----------|
| Lumiere ON | `1a0130103ca100a100000040400204000081edbaa01b141d` |
| Lumiere OFF | `1a0130103ca100a1000000404002040000805a20cdc11d` |
| Pompe gauche ON | `1a0130103ca100a10604000002040000008b3ee4131d` |
| Pompe gauche OFF | `1a0130103ca100a106000000020400000008bd10331d` |
| Pompe droite ON | `1a0130103ca100a118100000020400000040d12de01d` |
| Pompe droite OFF | `1a0130103ca100a11800000002040000004cdfff631d` |
| Bulleur ON | `1a0130103ca100a10000040402040000000f7f1b11761d` |
| Bulleur OFF | `1a0130103ca100a10000040002040000 00fcc2864f1d` |
| Filtration | `1a0130103ca400a1620500160017000600fc7954c61d` |

## Heartbeat 0xAA

Capturee 90 fois en 5 minutes en etat repos. C'est un **heartbeat** (ping de presence), **pas une commande d'arret** comme initialement suppose.

Format :
```
1a0120083caa1000006b73e4b91d
```

## Polling 0x2E et 0xA5

Ces deux types sont des **trames internes** entre le controleur principal et ses capteurs/actionneurs. Ils sont presents en grand nombre dans toutes les captures et ne doivent **jamais etre rejoues**.

## Particularites du controleur

- **Pas de validation CRC** : le P23B32 accepte les trames meme avec un CRC errone. Cela permet de rejouer les broadcasts d'etat avec des flags equipement modifies, sans avoir a recalculer le CRC.
- **Robustesse aux collisions** : envoyer la meme trame 10 fois a 0.5s d'intervalle ameliore significativement la fiabilite d'execution (bus partage par plusieurs equipements).

## Trames a documenter (TODO)

- Decodage individuel des bits du byte 17 (flags equipements)
- Format exact de la commande "changer consigne thermostat" en conditions reelles
- Decodage des bytes 60-63 (compteur cyclique probable)
- Signification des bytes 18-59 du broadcast 0xB4 (planning detaille ?)

## Sources

- Captures realisees avec USR-W610 + `nc` sur Home Assistant Green (KnapTheBuilder)
- Mesures oscilloscope par KDy (validation 38400 baud)
- Analyse comparative communautaire sur forum HA Community
- Reverse engineering ESP32+MAX485 par Neuro (P23B32 V2)
- Travaux initiaux de Gaet78 sur P69B133
