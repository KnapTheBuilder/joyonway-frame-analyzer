# Cablage du pont USR-W610 au bus RS485 du spa

Guide pratique pour relier physiquement le pont WiFi/RS485 USR-W610 au controleur Joyonway P23B32.

## Materiel necessaire

| Element | Reference | Prix approximatif |
|---------|-----------|---------------------|
| Pont USR-W610 (WiFi + RS485) | https://www.pusr.com/products/wifi-rs485-converter-w610.html | 30-40 EUR |
| Alimentation 5V 2A (USB ou jack) | Standard | 5-10 EUR |
| Cable RJ12 6 broches | Type telephone | 5 EUR |
| Connecteur RJ12 femelle a borne a vis | Adaptateur ethernet/RJ vers borne | 5 EUR |
| (Optionnel) Boitier electrique IP65 | Si exterieur | 10-15 EUR |

**Total estime : 50-70 EUR**

## Brochage du port RS485 sur le P23B32

Le controleur Joyonway P23B32 dispose d'un port nomme `COM1` ou `CN8` (selon les versions) sur la carte. Il s'agit d'un connecteur **RJ12 6 broches**.

### Pinout RJ12 du P23B32

En regardant le connecteur **de face**, languette en haut :

| Broche | Couleur cable RJ12 standard | Signal |
|--------|------------------------------|--------|
| 1 (gauche) | Blanc | +12V (alimentation panneau) |
| 2 | Noir | GND |
| 3 | Rouge | **RS485 A (+)** |
| 4 | Vert | **RS485 B (-)** |
| 5 | Jaune | GND signal |
| 6 (droite) | Bleu | NC (non connecte) |

**ATTENTION** : ce brochage est valable pour le **P23B32 V2 (2019)**. Les autres versions ou modeles (P25B37, P69B133, etc.) peuvent avoir des brochages differents. **Toujours verifier au multimetre avant connexion.**

## Cablage du USR-W610

Le USR-W610 dispose d'un bornier a vis 3 contacts pour RS485 :

| Borne W610 | Signal | Relier a... |
|------------|--------|-------------|
| `A+` | RS485 A | Broche 3 du RJ12 (rouge) |
| `B-` | RS485 B | Broche 4 du RJ12 (vert) |
| `GND` | Masse | Broche 5 du RJ12 (jaune) - optionnel mais recommande |

L'alimentation 5V du W610 est independante du panneau spa.

## Procedure de cablage securisee

1. **Couper l'alimentation 230V du spa** au tableau electrique
2. Demonter le panneau de controle pour acceder a la carte P23B32
3. Localiser le port `COM1` (RJ12, generalement en bord de carte)
4. Confirmer le brochage au multimetre :
   - Tester GND entre carcasse et broche 2 du RJ12 (continuite attendue)
   - Verifier l'absence de tension > 5V sur les broches 3 et 4 au repos
5. Cabler le RJ12 vers le W610 (via adaptateur a borne ou soudure)
6. Remettre l'alimentation du spa
7. Verifier sur le W610 :
   - LED `PWR` allumee fixe
   - LED `WLAN` clignote puis fixe (connexion au WiFi)
   - LED `TXD`/`RXD` clignote lorsque le bus communique

## Configuration du W610

Acceder a l'interface web du W610 a son IP par defaut **192.168.4.1** (mode AP) ou IP attribuee par votre routeur.

**Parametres serie a configurer :**

| Parametre | Valeur |
|-----------|--------|
| Baudrate | **38400** |
| Data bits | 8 |
| Parite | None |
| Stop bits | 1 |
| Flow control | None |

**Parametres reseau a configurer :**

| Parametre | Valeur recommandee |
|-----------|-----|
| Mode | **TCP Server** |
| Port local | **8899** |
| Timeout | 0 (jamais de deconnexion) |
| IP statique | Recommande (ex. 192.168.1.34) |

Documentation officielle complete : https://www.pusr.com/products/wifi-rs485-converter-w610.html

## Tests apres cablage

### Test 1 - Connexion TCP au W610

Depuis n'importe quel PC du reseau :

```bash
nc -zv 192.168.1.34 8899
```

Resultat attendu : `Connection to 192.168.1.34 8899 port [tcp/*] succeeded!`

### Test 2 - Lecture du bus RS485

```bash
nc 192.168.1.34 8899 > test_5s.bin
# Attendre 5 secondes puis Ctrl+C
ls -l test_5s.bin
```

Resultat attendu :
- Fichier > 1 KB en 5 secondes (signe que le bus est actif)
- Si fichier vide : probleme de cablage ou controleur eteint

### Test 3 - Decodage de trames

```bash
python analyzer.py test_5s.bin
```

Resultat attendu : statistiques montrant plusieurs types de trames (0x2E, 0xA5, 0xAA, 0xB4).

## Depannage

### LED TXD/RXD du W610 jamais allumees

- Verifier la polarite RS485 (A+ et B- non inversees)
- Verifier que le baudrate est bien 38400 (PAS 9600 comme indique dans certaines docs Joyonway)
- Verifier que le spa est alimente et que la carte P23B32 fonctionne

### LED TXD/RXD du W610 clignotent mais aucune trame valide decodee

- Probleme de baudrate ou parite
- Resistance de terminaison eventuellement necessaire (120 ohms entre A+ et B-)
- Cable trop long ou mal blinde

### W610 perd la connexion WiFi

- Verifier la puissance du signal WiFi a l'emplacement du spa
- Configurer une **IP statique** dans le W610 (sinon le DHCP peut changer l'IP)
- Eventuellement utiliser un repeteur WiFi proche du spa

## Photos de reference

Les photos de cablage sont disponibles dans l'integration HA :
https://github.com/KnapTheBuilder/ha-joyonway-p23b32/tree/main/docs/images

## Avertissements

**Reverse engineering communautaire**. L'utilisation de cet outil et du cablage decrit se fait a vos risques. Aucune garantie sur :
- L'integrite de la carte P23B32 en cas de mauvais branchement
- Le maintien de la garantie constructeur (potentiellement annulee par modifications)
- La compatibilite electrique entre votre W610 et votre installation

Toujours travailler hors tension. En cas de doute, faire appel a un electricien qualifie.
