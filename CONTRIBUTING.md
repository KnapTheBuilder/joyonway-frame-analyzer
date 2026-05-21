# Contributing / Contribuer

## English

Thanks for your interest. This project grows with community contributions.

### Types of contributions

#### 1. Share an RS485 capture

The most valuable contribution. Open an issue with the `capture_share` template and attach your `.bin` file with:

- Spa model (exact reference if possible)
- Year of manufacture
- Duration of capture
- Actions performed during capture (timeline)
- USR-W610 IP and configuration

#### 2. Add a new model profile

If you have identified a new spa model's protocol, add a JSON profile in `profiles/`. See [profiles/README.md](profiles/README.md).

#### 3. Improve decoder logic

PRs welcome for:
- Better protocol auto-detection
- New decode fields for existing profiles
- UI improvements (responsive, accessibility, languages)
- Performance on large captures

#### 4. Translate

The UI is currently in English with some French strings. Translations to other languages are welcome via PR.

### Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/p25b85-profile`
3. Make atomic commits with clear messages
4. Test on real captures
5. Open a Pull Request describing what you tested

### Code conventions

- Vanilla JavaScript, no framework dependencies
- No external CDN imports (must work offline)
- Indentation: 2 spaces
- Profile JSON: follow `_template.json` structure
- Type hints in JSDoc where helpful

### Testing

Test your changes on:
- Desktop browser (Chrome, Firefox, Safari)
- Mobile browser (Safari iOS, Chrome Android)
- Real captures from at least one model

Validate JSON profiles:

```bash
python -m json.tool profiles/your_profile.json
```

### Code of conduct

Respectful, technical, fact-based discussions. No personal attacks, no spam.

By contributing, you agree your contribution is published under MIT.

---

## Francais

Merci de ton interet. Ce projet grandit avec les contributions communautaires.

### Types de contributions

#### 1. Partager une capture RS485

La contribution la plus utile. Ouvre une issue avec le template `capture_share` et joins ton fichier `.bin` avec :

- Modele de spa (reference exacte si possible)
- Annee de fabrication
- Duree de la capture
- Actions realisees pendant la capture (timeline)
- IP et configuration du USR-W610

#### 2. Ajouter un profil de nouveau modele

Si tu as identifie le protocole d'un nouveau modele de spa, ajoute un profil JSON dans `profiles/`. Voir [profiles/README.md](profiles/README.md).

#### 3. Ameliorer la logique du decodeur

PRs bienvenues pour :
- Meilleure auto-detection du protocole
- Nouveaux champs decodes pour les profils existants
- Ameliorations UI (responsive, accessibilite, langues)
- Performance sur grosses captures

#### 4. Traduire

L'UI est actuellement en anglais avec quelques strings en francais. Les traductions vers d'autres langues sont bienvenues via PR.

### Workflow

1. Fork du depot
2. Branche dediee : `git checkout -b feature/p25b85-profile`
3. Commits atomiques avec messages clairs
4. Test sur captures reelles
5. Pull Request decrivant ce qui a ete teste

### Conventions de code

- JavaScript vanilla, aucune dependance framework
- Aucun import CDN externe (doit fonctionner offline)
- Indentation : 2 espaces
- JSON profile : suivre la structure de `_template.json`
- Type hints en JSDoc quand utile

### Tests

Teste tes modifications sur :
- Navigateur desktop (Chrome, Firefox, Safari)
- Navigateur mobile (Safari iOS, Chrome Android)
- Captures reelles d'au moins un modele

Valider les profils JSON :

```bash
python -m json.tool profiles/ton_profil.json
```

### Code de conduite

Discussions respectueuses, techniques, basees sur les faits. Aucune attaque personnelle, aucun spam.

En contribuant, tu acceptes que ta contribution soit publiee sous MIT.
