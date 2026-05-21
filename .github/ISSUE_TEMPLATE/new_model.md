---
name: Add new model profile / Ajouter un profil de nouveau modele
about: Propose a new spa model JSON profile
title: '[PROFILE] Add support for '
labels: enhancement, new-profile
---

## Spa model / Modele de spa

- **Reference / Reference** : 
- **Year / Annee** : 
- **Manufacturer / Fabricant** : 

## Status of reverse engineering / Etat du reverse engineering

- [ ] Baudrate validated (oscilloscope or other) / Baudrate valide
- [ ] Frame delimiters identified / Delimiteurs trame identifies
- [ ] Status broadcast decoded (temperature, setpoint) / Broadcast etat decode
- [ ] At least one command frame validated / Au moins une trame commande validee

## JSON profile draft / Brouillon profil JSON

Paste your draft profile here (use `profiles/_template.json` as base):
Coller votre brouillon de profil ici (utiliser `profiles/_template.json` comme base) :

```json
{
  "id": "p25b85",
  "name": "Joyonway P25B85",
  ...
}
```

## Capture(s) used / Captures utilisees

Attach the capture file(s) that support this profile.
Joindre les fichiers de capture qui appuient ce profil.

## Validation method / Methode de validation

How did you validate the decoding? / Comment as-tu valide le decodage ?

- Cross-reference with official app display
- Oscilloscope measurement
- Comparison with similar known model
- Other (specify)

## Will you submit a PR? / Veux-tu soumettre une PR ?

- [ ] Yes, I will create a Pull Request with the profile / Oui, je vais creer une PR
- [ ] No, please create the profile based on this issue / Non, merci de creer le profil
