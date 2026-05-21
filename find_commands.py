#!/usr/bin/env python3
"""
joyonway-frame-analyzer - find_commands.py
Identifie les trames rares (potentielles commandes utilisateur) dans une capture.

Usage:
    python find_commands.py capture.bin [seuil_max]

Workflow recommande :
    1. Lancer une capture nc en continu.
    2. Pendant la capture, declencher UNE action via l'app Joyonway
       (ex. changer la consigne, allumer la lumiere, etc.).
    3. Arreter la capture (Ctrl+C).
    4. Lancer ce script : la trame de commande sera dans les rares.

Auteur : KnapTheBuilder
Licence : MIT
"""

import sys
from collections import Counter
from pathlib import Path
from decoder import extract_frames, get_frame_type, TRAME_TYPES


def main() -> int:
    if len(sys.argv) not in (2, 3):
        print(f"Usage: python {sys.argv[0]} capture.bin [seuil_max]")
        return 1

    capture_path = Path(sys.argv[1])
    if not capture_path.exists():
        print(f"ERREUR: fichier introuvable : {capture_path}")
        return 1

    seuil_max = int(sys.argv[2]) if len(sys.argv) == 3 else 5

    raw = capture_path.read_bytes()
    frames = extract_frames(raw)
    counts = Counter(frames)

    print(f"Capture : {capture_path.name}")
    print(f"Trames totales : {len(frames)}")
    print(f"Trames uniques : {len(counts)}")
    print(f"Seuil de rarete : {seuil_max} occurrences ou moins")
    print()

    rares = sorted(
        [(f, c) for f, c in counts.items() if c <= seuil_max],
        key=lambda x: (x[1], x[0].hex()),
    )

    if not rares:
        print(f"Aucune trame rare trouvee (seuil = {seuil_max}).")
        return 0

    print(f"=== {len(rares)} trames rares (<= {seuil_max} occurrences) ===")
    print()

    by_type = {}
    for f, c in rares:
        ftype = get_frame_type(f)
        by_type.setdefault(ftype, []).append((f, c))

    for ftype in sorted(by_type.keys(), key=lambda x: x if x is not None else 999):
        type_name = TRAME_TYPES.get(ftype, "(type inconnu)")
        print(f"-- Type 0x{ftype:02X} ({type_name}) --")
        for f, c in by_type[ftype]:
            hex_str = f.hex()
            if ftype == 0xA1 and len(f) > 16:
                byte16 = f[16]
                consigne_c = round((byte16 - 32) * 5 / 9, 1) if 60 <= byte16 <= 104 else None
                consigne_info = (
                    f" [byte 16 = 0x{byte16:02X} = {byte16} dec / "
                    f"{consigne_c if consigne_c else 'hors plage'} degC]"
                )
            else:
                consigne_info = ""

            print(f"  x{c:<3} [{len(f):3d}b] {hex_str}{consigne_info}")
        print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
