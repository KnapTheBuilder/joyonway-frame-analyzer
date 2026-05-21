# Installation guide / Guide d'installation - Frame Analyzer v2

## English

### Apply this update to your GitHub repository

This ZIP contains an UPDATE for the `joyonway-frame-analyzer` repository. It does NOT overwrite your existing `index.html` / `app.js` / `style.css` (the actual web app).

### Step 1 - Backup

In GitHub Desktop:
1. Open the repository
2. **Repository menu > Show in Explorer**
3. Copy the folder somewhere as backup

### Step 2 - Apply files

1. Extract this ZIP to a temporary location
2. Copy ALL files from `joyonway-frame-analyzer-v2/` into your repository folder
3. Overwrite when asked (overwrites README, CHANGELOG, profiles, etc.)
4. Your existing app code (index.html, app.js, style.css) is NOT touched

### Step 3 - Update your app code to use the new unescape

Your existing JavaScript app needs to USE the new `unescape.js`. Edit your `index.html` to include it BEFORE your main `app.js`:

```html
<script src="unescape.js"></script>
<script src="app.js"></script>
```

Then in `app.js`, replace your current unescape function with calls to:

```javascript
const unescaped = JoyonwayUnescape.unescapeFrame(rawFrame);
const decoded = JoyonwayUnescape.decodeB4Broadcast(unescaped);
```

### Step 4 - Commit and push (GitHub Desktop)

1. Summary: `v2.0.0 - Correct unescape table from KDy + unified 1A/1D family profile`
2. Description: copy from `CHANGELOG.md`
3. Commit to main, then Push origin
4. GitHub Pages auto-deploys

### Step 5 - Test on a real capture

Drop your existing capture file. Verify decoded values match what your spa panel displays.

---

## Francais

### Appliquer cette mise a jour a ton depot GitHub

Ce ZIP contient une MISE A JOUR pour le depot `joyonway-frame-analyzer`. Il n'ecrase PAS ton `index.html` / `app.js` / `style.css` existants.

### Etape 1 - Backup

Dans GitHub Desktop :
1. Ouvre le depot
2. **Menu Repository > Show in Explorer**
3. Copie le dossier ailleurs en sauvegarde

### Etape 2 - Appliquer les fichiers

1. Extrais ce ZIP dans un dossier temporaire
2. Copie TOUS les fichiers de `joyonway-frame-analyzer-v2/` dans le dossier du depot
3. Ecrase quand demande (remplace README, CHANGELOG, profils, etc.)
4. Tes fichiers app existants (index.html, app.js, style.css) ne sont PAS touches

### Etape 3 - Mettre a jour ton code app pour utiliser le nouvel unescape

Ton JavaScript existant doit UTILISER le nouveau `unescape.js`. Modifie ton `index.html` pour l'inclure AVANT ton `app.js` principal :

```html
<script src="unescape.js"></script>
<script src="app.js"></script>
```

Puis dans `app.js`, remplace ta fonction d'unescape actuelle par des appels a :

```javascript
const unescaped = JoyonwayUnescape.unescapeFrame(rawFrame);
const decoded = JoyonwayUnescape.decodeB4Broadcast(unescaped);
```

### Etape 4 - Commit et push (GitHub Desktop)

1. Summary : `v2.0.0 - Table unescape correcte par KDy + profil famille 1A/1D unifie`
2. Description : copie depuis `CHANGELOG.md`
3. Commit to main, puis Push origin
4. GitHub Pages se redeploie automatiquement

### Etape 5 - Test sur une capture reelle

Depose un de tes fichiers de capture. Verifie que les valeurs decodees correspondent a celles affichees sur le panneau du spa.
