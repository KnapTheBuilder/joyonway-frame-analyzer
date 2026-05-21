# Guide de contribution

Merci de votre interet pour contribuer au projet **Joyonway Frame Analyzer**.

Cet outil est ne d'un effort collaboratif sur le forum Home Assistant Community pour reverser le protocole RS485 des controleurs de spa Joyonway. Toute contribution qui aide a etendre la couverture des modeles ou ameliorer le decodage est la bienvenue.

## Types de contributions recherchees

### 1. Captures RS485 partagees

Le travail le plus utile est de partager des captures binaires `.bin` faites avec `nc 192.168.1.34 8899 > capture.bin` dans des conditions documentees :

- Action precise realisee pendant la capture (changement consigne, activation lumiere, etc.)
- Modele exact du controleur (P23B32 V1 ou V2, annee de fabrication)
- Date de la capture
- Etat initial des equipements

Format ideal : ouvrir une **Issue** avec le label `capture` et joindre le fichier `.bin`.

### 2. Decodage de nouvelles trames

Si vous avez identifie ce que fait une trame inconnue (par exemple les bits du byte 17 du broadcast 0xB4, ou la trame de commande consigne en conditions reelles), proposez une **Pull Request** sur le fichier `decoder.py`.

### 3. Support de nouveaux modeles

Le decodeur actuel cible le P23B32 V2 (2019). Si vous possedez un P25B37, P25B85, P20B29, P69B133 ou autre, contribuez :

- Captures binaires de votre modele
- Comparaison avec les trames documentees
- Adaptation eventuelle du parsing

### 4. Amelioration de la documentation

- Correction de fautes
- Ajout d'exemples concrets
- Schemas de cablage USR-W610 -> bus RS485 du spa
- Photos de connecteurs

## Workflow Git

1. Fork du depot
2. Branche dediee pour votre contribution : `git checkout -b feature/decode-bits-byte17`
3. Commits clairs et atomiques avec messages explicites
4. Test du code modifie sur au moins une capture reelle
5. Pull Request avec description detaillee de ce qui a ete teste

## Conventions de code

- Python 3.8+
- Pas de dependances externes (que stdlib)
- Type hints sur les fonctions publiques
- Docstrings en francais ou anglais (selon votre prefence, soyez coherent dans un meme fichier)
- Indentation 4 espaces (PEP 8)
- Pas de print() de debug laisses en place

## Tests

Avant de proposer une PR, validez votre code sur une capture reelle :

```
python analyzer.py votre_capture.bin
```

Verifiez que :
- Le script tourne sans erreur
- Le decodage du broadcast 0xB4 retourne des valeurs coherentes (temperature plausible 20-40 degC)
- Les trames rares sont correctement identifiees

## Communication

- **Issues GitHub** : bugs, demandes de fonctionnalites, partage de captures
- **Pull Requests** : ameliorations de code ou documentation
- **Forum Home Assistant Community** : discussion generale sur le protocole Joyonway et integration HA - https://community.home-assistant.io/t/joyonway-spa-control/582344

## Code de conduite

Comportement respectueux attendu. Les attaques personnelles, le harcelement, ou tout comportement toxique ne sont pas toleres. Ce projet est un effort collaboratif beneficiant a la communaute.

## Licence

En contribuant, vous acceptez que vos contributions soient publiees sous la meme licence MIT que le projet.

## Remerciements aux contributeurs initiaux

- **Gaet78** pour l'integration HACS originelle Joyonway et le decodage du P69B133
- **KDy** pour l'analyse comparative des trames broadcast et la mesure oscilloscope (validation du baudrate 38400)
- **Neuro** pour les travaux ESP32+MAX485 sur le P23B32 V2

Ce projet n'aurait pas existe sans le fil d'echanges de la communaute Home Assistant.
