---
name: Partage de capture RS485
about: Partager une capture pour aider au decodage du protocole
title: '[CAPTURE] '
labels: capture
assignees: ''
---

## Modele de controleur

- Modele : (P23B32 V1, P23B32 V2, P25B37, P69B133, autre)
- Annee de fabrication : (2019, 2020, etc.)
- Numero de serie (optionnel) : 

## Conditions de la capture

- Date : YYYY-MM-DD
- Duree de la capture : (en secondes ou minutes)
- Etat initial du spa : (au repos, en filtration, en chauffage, etc.)

## Action(s) realisee(s) pendant la capture

Decrire precisement ce que vous avez fait pendant la capture :

- A T+30s : appui sur bouton "Lumiere ON" via app Joyonway
- A T+60s : changement consigne de 35C a 36C
- etc.

## Materiel utilise

- Pont serie : (USR-W610, autre)
- Baudrate utilise : (38400 par defaut sur P23B32 V2)
- IP/port du pont : 

## Fichier de capture

Joindre le fichier `.bin` en attachement (drag & drop dans cette issue).

Si le fichier est trop volumineux (>25 Mo limite GitHub), partager via WeTransfer ou similaire.

## Analyse preliminaire

Sortie de `python analyzer.py capture.bin` (les premieres 50 lignes suffisent) :

```
Coller la sortie ici
```

## Observations particulieres

Tout element notable observe dans la capture.
