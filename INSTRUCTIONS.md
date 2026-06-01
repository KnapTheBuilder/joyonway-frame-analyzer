# Instructions de deploiement GitHub Pages - V4.1

## Etape 1: backup local

Copier le dossier local `joyonway-frame-analyzer/` ailleurs sur le disque,
sauf le sous-dossier cache `.git/`.

## Etape 2: vider le repo local SAUF .git/

Dans le dossier local `joyonway-frame-analyzer/`, supprimer TOUS les
fichiers et dossiers visibles, A L'EXCEPTION du dossier cache `.git/`.

## Etape 3: dezipper directement dans le repo

Dezipper ce ZIP DIRECTEMENT dans ton dossier local `joyonway-frame-analyzer/`.
Tous les fichiers se mettent en place automatiquement. Le dossier `.git/`
existant reste intact.

Structure finale attendue :

```
joyonway-frame-analyzer/
  .git/                        (existant, ne pas toucher)
  .gitignore
  .nojekyll                    (FIX BUILD: desactive Jekyll)
  LICENSE
  README.md
  CHANGELOG.md
  commit_message.txt
  INSTRUCTIONS.md              (ce fichier)
  index.html                   (redirect vers docs/)
  docs/
    .nojekyll                  (FIX BUILD: desactive Jekyll)
    index.html                 (frame analyzer V4.1 standalone)
```

VERIFICATION : sur Windows, activer "Afficher les fichiers caches" dans
l'Explorateur pour voir `.nojekyll` et `.gitignore`. Si ces fichiers ne
sont pas presents apres dezippage, le build Pages echouera.

## Etape 4: configurer le webhook contribute (optionnel)

Si tu veux activer la collecte automatique des captures utilisateurs :

1. Editer `docs/index.html`
2. Chercher la ligne :
   ```
   const CONTRIBUTE_WEBHOOK_URL = '';
   ```
3. Remplacer la chaine vide par l'URL de ton webhook HA, par exemple :
   ```
   const CONTRIBUTE_WEBHOOK_URL = 'https://homeassistant.maisonconnectee43.net/api/webhook/joyonway_contribute_xxxxxxxxxx';
   ```
4. Le token doit etre defini dans `secrets.yaml` cote HA et l'automatisation
   webhook doit ecouter ce token.

Sans cette configuration, la carte Contribute reste visible mais aucune
donnee n'est envoyee. La capture est analysee localement uniquement.

## Etape 5: GitHub Desktop

1. Ouvrir GitHub Desktop sur le repo `joyonway-frame-analyzer`
2. Onglet `Changes` doit afficher les fichiers ajoutes / supprimes / modifies
3. Champ `Summary` : coller la 1ere ligne de `commit_message.txt`
4. Champ `Description` : coller la suite
5. Bouton `Commit to main`
6. Bouton `Push origin`

## Etape 6: GitHub Pages settings (premier deploiement seulement)

Si Pages n'est pas encore configure :
- Onglet `Settings` > menu gauche `Pages`
- `Source` : `Deploy from a branch`
- `Branch` : `main` + folder `/(root)`
- Cliquer `Save`

L'index racine fait un redirect HTML vers `/docs/`. Quelle que soit la
config Pages (root ou /docs), ca marche grace aux 2 fichiers `.nojekyll`.

## Etape 7: verification

URL : https://knapthebuilder.github.io/joyonway-frame-analyzer/

Attendre 1 a 3 minutes apres le push. Verifier dans l'onglet `Actions`
du repo qu'un job `pages build and deployment` est passe en vert.

## Etape 8: configuration webhook HA (si etape 4 active)

Cote Home Assistant, dans `secrets.yaml` :
```
joyonway_contribute_webhook_token: "xxxxxxxxxx"
```

Dans `/config/packages/bms/` (par exemple `spa_contribute_webhook.yaml`),
creer une automatisation qui ecoute le webhook et stocke le payload :

```yaml
# 2026-06-01 | Automatisation | Reception captures Joyonway anonymes | Depend: !secret joyonway_contribute_webhook_token
automation:
  - alias: "Joyonway - Reception capture contributeur"
    trigger:
      platform: webhook
      webhook_id: !secret joyonway_contribute_webhook_token
      allowed_methods:
        - POST
      local_only: false
    action:
      - service: shell_command.save_contribute_capture
        data:
          payload: "{{ trigger.json | tojson }}"
      - service: notify.notify
        data:
          title: "Capture Joyonway recue"
          message: >
            Modele: {{ trigger.json.declared_model }}
            Panel: {{ trigger.json.declared_panel }}
            Bytes: {{ trigger.json.bytes_total }}

shell_command:
  save_contribute_capture: >
    bash -c 'mkdir -p /config/captures &&
    echo "{{ payload }}" > /config/captures/$(date +%Y%m%d_%H%M%S)_{{ trigger.json.declared_model | replace(" ","_") }}.json'
```

## Etape 9: cleanup local (optionnel)

Apres validation OK, supprimer :
- `commit_message.txt`
- `INSTRUCTIONS.md`

Faire un commit "cleanup helpers" et push.
