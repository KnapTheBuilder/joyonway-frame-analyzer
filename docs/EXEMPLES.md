# Exemples d'utilisation

Quelques scenarios concrets pour utiliser le frame-analyzer.

## Scenario 1 - Analyse d'une capture passive

**Objectif** : comprendre ce que dit le controleur sans rien envoyer.

```bash
# Capturer 5 minutes
nc 192.168.1.34 8899 > capture_passive.bin
# Attendre 5 min puis Ctrl+C

# Analyser
python analyzer.py capture_passive.bin
```

**Resultat type sur une capture de 5 minutes** :

```
Statistiques globales
  Taille fichier  : 14913 octets
  Trames totales  : 701
  Trames uniques  : 44

Distribution par type de trame
  0x2E    300 occurrences  Polling actionneurs
  0xA5    251 occurrences  Polling capteurs
  0xAA     90 occurrences  Heartbeat / arret
  0xB4     50 occurrences  Broadcast etat global
  0xA1     10 occurrences  Commande equipement
```

**Interpretation** :
- 90 heartbeats et 50 broadcasts d'etat -> trafic normal d'un controleur au repos
- Les 10 trames 0xA1 sont identiques entre elles -> probablement un broadcast d'etat (pas une vraie commande)

## Scenario 2 - Identifier une commande precise

**Objectif** : decoder la commande "Lumiere ON".

```bash
# Lancer la capture
nc 192.168.1.34 8899 > capture_lumiere.bin &
CAPTURE_PID=$!

# Attendre 30s pour avoir une baseline
sleep 30

# Appuyer maintenant sur "Lumiere ON" via l'app Joyonway
echo "ACTION A T+30s : Lumiere ON via app"

# Continuer la capture 30 secondes de plus
sleep 30

# Arreter
kill $CAPTURE_PID

# Trouver les commandes rares
python find_commands.py capture_lumiere.bin
```

**Resultat type** : la commande "Lumiere ON" apparait dans les trames rares avec 1 a 3 occurrences.

## Scenario 3 - Suivi de la temperature dans le temps

**Objectif** : voir l'evolution de la temperature eau pendant un cycle de chauffage.

```bash
# Capturer 1 heure pendant un cycle de chauffage
nc 192.168.1.34 8899 > capture_chauffage.bin
# Attendre 1h puis Ctrl+C

python extract_temp.py capture_chauffage.bin
```

**Resultat type** :

```
Index   Temp eau (C)   Consigne (F)   Consigne (C)   Flags 17
-----------------------------------------------------------------
0       32             95             35.0           0x80
12      32             95             35.0           0x84  <- chauffage activé
45      33             95             35.0           0x84
89      34             95             35.0           0x84
112     35             95             35.0           0x80  <- consigne atteinte, chauffage off

Plage temperature : 32C a 35C
```

## Scenario 4 - Capturer une commande consigne thermostat

**Objectif crucial pour l'integration HA** : decoder la trame envoyee quand on change la consigne thermostat.

```bash
# Etat initial : consigne 35C
# Lancer capture
nc 192.168.1.34 8899 > capture_consigne.bin &

# Attendre 1 minute
sleep 60

# Maintenant changer la consigne via l'app Joyonway de 35C a 36C
echo "ACTION : changer consigne de 35C a 36C dans l'app"

# Attendre 1 minute supplementaire
sleep 60

# Arreter capture (Ctrl+C ou kill)
```

**Analyse** :

```bash
python find_commands.py capture_consigne.bin
```

Chercher dans les trames de type **0xA1** une trame ou le **byte 16** vaut `0x60` (96 en decimal = 96F = 35.5C, valeur intermediaire pour 36C consigne arrondie).

**Note importante** : la consigne est en Fahrenheit dans le protocole, meme si l'app affiche Celsius. Plage observee : 60F (15.5C) a 104F (40C).

## Scenario 5 - Diagnostic d'une integration HA qui ne repond plus

**Objectif** : verifier que le W610 communique encore correctement.

```bash
# Capture courte
timeout 30 nc 192.168.1.34 8899 > diag.bin

# Compter les trames
python analyzer.py diag.bin | head -20
```

**Resultats possibles** :

- **Fichier vide ou tres petit** : le W610 ne communique pas avec le bus RS485 -> probleme cablage ou alimentation
- **Beaucoup de 0x2E et 0xA5 mais pas de 0xB4 ou 0xAA** : le controleur principal ne repond plus -> redemarrer le spa
- **Trafic normal mais l'integration HA ne marche pas** : probleme cote HA (socket TCP, integration desactivee, etc.)

## Astuces

### Capture en arriere-plan

```bash
nohup nc 192.168.1.34 8899 > capture_$(date +%Y%m%d_%H%M).bin &
```

Verifier avec `ps aux | grep nc`.

### Tuer les processus nc qui trainent

Le port 8899 du W610 est un slot TCP unique. Si un client `nc` ne s'est pas ferme proprement, le slot reste pris :

```bash
pkill -9 -f "nc 192.168.1.34"
```

### Capture multi-heures (chauffage automatique nuit par exemple)

```bash
nohup nc 192.168.1.34 8899 > nuit.bin &
echo $! > nc.pid
# Attendre la nuit, puis :
kill $(cat nc.pid)
```

### Filtrer les broadcasts B4 uniquement (utile pour suivi temp)

```bash
python -c "
from decoder import extract_frames, get_frame_type
with open('capture.bin', 'rb') as f:
    raw = f.read()
b4 = [f for f in extract_frames(raw) if get_frame_type(f) == 0xB4]
print(f'{len(b4)} broadcasts B4 trouves')
for frame in b4[:5]:
    print(frame.hex())
"
```
