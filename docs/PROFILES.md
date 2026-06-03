# Profiles - Multi-model architecture guide

## English

### Concept

The frame analyzer uses **JSON profiles** to describe each spa controller protocol. This decouples the decoding logic from the model-specific data, enabling:

- Community contributions without JavaScript changes
- Easy A/B testing of new protocols
- Versioning and traceability per model

### File structure

Each profile is a JSON file in `/profiles/`:

```
profiles/
├── _template.json       # Template for new profiles
├── p23b32_v2.json       # Joyonway P23B32 V2 (validated)
├── p69b133.json         # Joyonway P69B133 (Balboa-like reference)
├── README.md            # Quick guide
└── ... (community contributions)
```

### Profile lifecycle

1. **Draft** : Community member identifies a new model, opens an issue with capture
2. **Submission** : PR with a JSON profile based on `_template.json`
3. **Automated validation** : GitHub Actions checks JSON syntax + required fields
4. **Review** : Maintainer reviews fields against the capture
5. **Merge** : Profile added to `profiles/`
6. **Auto-deploy** : GitHub Pages redeploys with new profile available

### Schema

#### Required top-level fields

```json
{
  "id": "lowercase_with_underscores",
  "name": "Display name",
  "status": "validated | reference | draft | experimental",
  "physical": { "baudrate": 38400, ... },
  "frame_format": {
    "delimiter_start": "0xHH",
    "delimiter_end": "0xHH",
    "type_byte_offset": 5
  }
}
```

#### Optional sections

- `known_types` - Identified frame types with descriptions
- `broadcast_fields` - Decoded fields in status broadcasts
- `command_frames` - Validated command frames in hex
- `transmission` - How to send commands (replay, repeat count, interval)
- `addresses` - Bus addresses if multi-device
- `notes` - Free text notes

### Status levels

| Status | Meaning |
|--------|---------|
| `validated` | Tested on real hardware by at least one contributor |
| `reference` | Documented from external source (other repo, paper) |
| `draft` | Work in progress, may have errors |
| `experimental` | Untested, use with caution |

### How the analyzer uses profiles

At startup, the JavaScript loads all `profiles/*.json` files. The user selects a profile (or auto-detection), and the decoder uses:

- `frame_format.delimiter_start/end` to extract frames
- `frame_format.type_byte_offset` to identify frame type
- `known_types` to label frame types in the UI
- `broadcast_fields` to decode values like temperature, setpoint

### Auto-detection logic

If user does not choose a profile, the analyzer scans the capture and:

1. Counts `0x1A...0x1D` pairs and `0x7E...0x7E` pairs
2. Checks frame lengths against profile typical_length
3. Suggests the most likely profile
4. User confirms or overrides

---

## Francais

### Concept

Le frame analyzer utilise des **profils JSON** pour decrire chaque protocole de controleur de spa. Cela decouple la logique de decodage des donnees specifiques au modele, permettant :

- Contributions communautaires sans modification du JavaScript
- Test A/B facile de nouveaux protocoles
- Versioning et tracabilite par modele

### Structure des fichiers

Chaque profil est un fichier JSON dans `/profiles/` :

```
profiles/
├── _template.json       # Template pour nouveaux profils
├── p23b32_v2.json       # Joyonway P23B32 V2 (valide)
├── p69b133.json         # Joyonway P69B133 (reference type Balboa)
├── README.md            # Guide rapide
└── ... (contributions communautaires)
```

### Cycle de vie d'un profil

1. **Brouillon** : Un membre identifie un nouveau modele, ouvre une issue avec capture
2. **Soumission** : PR avec un profil JSON base sur `_template.json`
3. **Validation auto** : GitHub Actions verifie syntaxe JSON + champs obligatoires
4. **Revue** : Le mainteneur verifie les champs contre la capture
5. **Merge** : Profil ajoute a `profiles/`
6. **Deploiement auto** : GitHub Pages redeploie avec le nouveau profil disponible

### Schema

#### Champs obligatoires de niveau racine

```json
{
  "id": "minuscule_avec_underscores",
  "name": "Nom affiche",
  "status": "validated | reference | draft | experimental",
  "physical": { "baudrate": 38400, ... },
  "frame_format": {
    "delimiter_start": "0xHH",
    "delimiter_end": "0xHH",
    "type_byte_offset": 5
  }
}
```

#### Sections optionnelles

- `known_types` - Types de trames identifies avec descriptions
- `broadcast_fields` - Champs decodes dans les broadcasts d'etat
- `command_frames` - Trames de commande validees en hex
- `transmission` - Comment envoyer des commandes
- `addresses` - Adresses bus si multi-device
- `notes` - Notes libres

### Niveaux de statut

| Statut | Signification |
|--------|---------------|
| `validated` | Teste sur materiel reel par au moins un contributeur |
| `reference` | Documente depuis une source externe |
| `draft` | En cours de travail, peut contenir des erreurs |
| `experimental` | Non teste, a utiliser avec precaution |

### Comment l'analyzer utilise les profils

Au demarrage, le JavaScript charge tous les fichiers `profiles/*.json`. L'utilisateur selectionne un profil (ou auto-detection), et le decodeur utilise :

- `frame_format.delimiter_start/end` pour extraire les trames
- `frame_format.type_byte_offset` pour identifier le type
- `known_types` pour labelliser dans l'UI
- `broadcast_fields` pour decoder temperature, consigne

### Logique d'auto-detection

Si l'utilisateur ne choisit pas de profil, l'analyzer scanne la capture et :

1. Compte les paires `0x1A...0x1D` et `0x7E...0x7E`
2. Verifie les longueurs de trame contre `typical_length` du profil
3. Suggere le profil le plus probable
4. L'utilisateur confirme ou outrepasse
