# Installation guide / Guide d'installation

## English

### How to apply this update to your GitHub repository

This ZIP contains an **update** to your existing `joyonway-frame-analyzer` GitHub repository. It does **not** include your existing `index.html` (the actual analyzer app) - that stays untouched on GitHub Pages.

### Step 1 - Backup first

Before doing anything, make a backup of your current repository state. In GitHub Desktop:

1. Open the repository `joyonway-frame-analyzer`
2. **Repository menu > Show in Explorer**
3. Copy the entire folder to a backup location (e.g. `joyonway-frame-analyzer-backup-2026-05-21`)

### Step 2 - Extract the ZIP

1. Download `joyonway-frame-analyzer-update.zip` from this chat
2. Extract it to a temporary location (NOT in your repo folder yet)
3. You will see a folder `joyonway-frame-analyzer-update/` with these files:
   - `README.md` (bilingual)
   - `CONTRIBUTING.md` (bilingual)
   - `CHANGELOG.md`
   - `LICENSE`
   - `.gitignore`
   - `profiles/` (3 files)
   - `docs/PROFILES.md`
   - `.github/workflows/` (2 files)
   - `.github/ISSUE_TEMPLATE/` (3 files)

### Step 3 - Copy files to your repo

1. Open your repo folder in Windows Explorer (`Repository menu > Show in Explorer` in GitHub Desktop)
2. Copy ALL files from `joyonway-frame-analyzer-update/` to your repo folder
3. When prompted to overwrite, choose **Yes for all** (this updates README, CONTRIBUTING, etc.)
4. Your existing `index.html`, `app.js`, `style.css`, and other app files will NOT be touched

### Step 4 - Review changes in GitHub Desktop

1. Switch back to GitHub Desktop
2. You will see all the new/modified files in the **Changes** panel
3. Review each file by clicking on it
4. If something looks wrong, right-click > **Discard Changes**

### Step 5 - Commit and push

1. In the **Summary** field, write:
   ```
   v2.0.0 - Multi-model JSON profiles architecture
   ```

2. In **Description**, paste:
   ```
   - Added profiles/ directory with JSON-based model descriptions
   - Initial profiles: P23B32 V2 (validated), P69B133 (reference)
   - Bilingual README and CONTRIBUTING (EN/FR)
   - GitHub Actions for auto-deploy and JSON validation
   - Issue templates for bug, capture share, new model
   - See CHANGELOG.md for details
   ```

3. Click **Commit to main**

4. Click **Push origin** (top toolbar)

### Step 6 - Verify

1. Wait 1-2 minutes for GitHub Actions to run
2. Go to your repo on GitHub: `https://github.com/KnapTheBuilder/joyonway-frame-analyzer`
3. Check the **Actions** tab - both workflows should be green
4. The Pages workflow auto-deploys to: `https://knapthebuilder.github.io/joyonway-frame-analyzer/`

### Step 7 - Optional - Create a Release

For visibility:

1. Go to repo > **Releases** > **Draft a new release**
2. Tag: `v2.0.0`
3. Title: `v2.0.0 - Multi-model architecture`
4. Description: copy from `CHANGELOG.md`
5. Click **Publish release**

### Troubleshooting

**Issue**: GitHub Actions fails with "permission denied" on Pages deploy
- **Fix**: Go to repo Settings > Pages > Source: select **GitHub Actions** (not "Deploy from branch")

**Issue**: JSON validation workflow fails
- **Fix**: Check that all your profile JSON files have valid syntax: `python -m json.tool profiles/yourfile.json`

**Issue**: Old `index.html` still uses hard-coded FORMATS
- This update does NOT modify your existing JavaScript files
- The dynamic profile loading is documented in `docs/PROFILES.md` for the next version
- You can manually update `index.html` later to fetch profiles dynamically with: `fetch('profiles/p23b32_v2.json')`

---

## Francais

### Comment appliquer cette mise a jour a ton depot GitHub

Ce ZIP contient une **mise a jour** de ton depot GitHub `joyonway-frame-analyzer` existant. Il n'inclut **pas** ton `index.html` existant (l'app analyzer elle-meme) - celui-ci reste intact sur GitHub Pages.

### Etape 1 - Faire un backup d'abord

Avant toute chose, fais une sauvegarde de l'etat actuel du depot. Dans GitHub Desktop :

1. Ouvre le depot `joyonway-frame-analyzer`
2. **Menu Repository > Show in Explorer**
3. Copie le dossier entier vers un emplacement de sauvegarde (par ex. `joyonway-frame-analyzer-backup-2026-05-21`)

### Etape 2 - Extraire le ZIP

1. Telecharge `joyonway-frame-analyzer-update.zip` depuis ce chat
2. Extrais-le dans un emplacement temporaire (PAS encore dans ton dossier de depot)
3. Tu verras un dossier `joyonway-frame-analyzer-update/` avec ces fichiers :
   - `README.md` (bilingue)
   - `CONTRIBUTING.md` (bilingue)
   - `CHANGELOG.md`
   - `LICENSE`
   - `.gitignore`
   - `profiles/` (3 fichiers)
   - `docs/PROFILES.md`
   - `.github/workflows/` (2 fichiers)
   - `.github/ISSUE_TEMPLATE/` (3 fichiers)

### Etape 3 - Copier les fichiers vers ton depot

1. Ouvre ton dossier de depot dans l'Explorateur Windows (menu **Repository > Show in Explorer** dans GitHub Desktop)
2. Copie TOUS les fichiers depuis `joyonway-frame-analyzer-update/` vers le dossier du depot
3. Quand on te demande d'ecraser, choisis **Oui pour tous** (cela met a jour README, CONTRIBUTING, etc.)
4. Tes fichiers existants `index.html`, `app.js`, `style.css`, et autres fichiers de l'app ne seront PAS modifies

### Etape 4 - Verifier les changements dans GitHub Desktop

1. Reviens dans GitHub Desktop
2. Tu verras tous les fichiers nouveaux/modifies dans le panneau **Changes**
3. Verifie chaque fichier en cliquant dessus
4. Si quelque chose semble incorrect, clic droit > **Discard Changes**

### Etape 5 - Commit et push

1. Dans le champ **Summary**, ecris :
   ```
   v2.0.0 - Architecture profils JSON multi-modeles
   ```

2. Dans **Description**, colle :
   ```
   - Ajout du dossier profiles/ avec descriptions modeles en JSON
   - Profils initiaux : P23B32 V2 (valide), P69B133 (reference)
   - README et CONTRIBUTING bilingues (EN/FR)
   - GitHub Actions pour auto-deploy et validation JSON
   - Templates issues pour bug, partage capture, nouveau modele
   - Voir CHANGELOG.md pour details
   ```

3. Clique **Commit to main**

4. Clique **Push origin** (barre d'outils en haut)

### Etape 6 - Verifier

1. Attends 1-2 minutes que GitHub Actions s'execute
2. Va sur ton depot sur GitHub : `https://github.com/KnapTheBuilder/joyonway-frame-analyzer`
3. Verifie l'onglet **Actions** - les deux workflows doivent etre verts
4. Le workflow Pages auto-deploie vers : `https://knapthebuilder.github.io/joyonway-frame-analyzer/`

### Etape 7 - Optionnel - Creer une Release

Pour la visibilite :

1. Va sur le depot > **Releases** > **Draft a new release**
2. Tag : `v2.0.0`
3. Titre : `v2.0.0 - Architecture multi-modeles`
4. Description : copie depuis `CHANGELOG.md`
5. Clique **Publish release**

### Depannage

**Probleme** : GitHub Actions echoue avec "permission denied" sur le deploy Pages
- **Solution** : Va sur Settings > Pages > Source : selectionne **GitHub Actions** (pas "Deploy from branch")

**Probleme** : Le workflow de validation JSON echoue
- **Solution** : Verifie que tous tes profils JSON ont une syntaxe valide : `python -m json.tool profiles/tonfichier.json`

**Probleme** : L'ancien `index.html` utilise encore FORMATS en dur
- Cette mise a jour ne modifie PAS tes fichiers JavaScript existants
- Le chargement dynamique des profils est documente dans `docs/PROFILES.md` pour la prochaine version
- Tu peux manuellement mettre a jour `index.html` plus tard pour charger les profils dynamiquement avec : `fetch('profiles/p23b32_v2.json')`
