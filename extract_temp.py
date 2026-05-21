#!/usr/bin/env python3
"""
joyonway-frame-analyzer - extract_temp.py
Extrait l'evolution de la temperature eau dans une capture RS485.

Usage:
    python extract_temp.py capture.bin

Auteur : KnapTheBuilder
Licence : MIT
"""

import sys
from pathlib import Path
from decoder import extract_frames, get_frame_type


def main() -> int:
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} capture.bin")
        return 1

    capture_path = Path(sys.argv[1])
    if not capture_path.exists():
        print(f"ERREUR: fichier introuvable : {capture_path}")
        return 1

    raw = capture_path.read_bytes()
    frames = extract_frames(raw)

    b4_frames = [f for f in frames if get_frame_type(f) == 0xB4 and len(f) > 16]

    if not b4_frames:
        print("ERREUR: aucun broadcast 0xB4 dans la capture.")
        return 1

    print(f"Capture : {capture_path.name}")
    print(f"Broadcasts 0xB4 trouves : {len(b4_frames)}")
    print()

    print(f"{'Index':<8}{'Temp eau (C)':<15}{'Consigne (F)':<15}{'Consigne (C)':<15}{'Flags 17':<12}")
    print("-" * 65)

    prev_temp = None
    prev_consigne = None
    prev_flags = None
    changes = []

    for i, frame in enumerate(b4_frames):
        temp_c = frame[14] if len(frame) > 14 else None
        consigne_f = frame[16] if len(frame) > 16 else None
        consigne_c = round((consigne_f - 32) * 5 / 9, 1) if consigne_f else None
        flags = frame[17] if len(frame) > 17 else None

        if (temp_c, consigne_f, flags) != (prev_temp, prev_consigne, prev_flags):
            flags_hex = f"0x{flags:02X}" if flags is not None else "?"
            print(
                f"{i:<8}{temp_c:<15}{consigne_f:<15}"
                f"{consigne_c:<15}{flags_hex:<12}"
            )
            changes.append((i, temp_c, consigne_f, flags))
            prev_temp = temp_c
            prev_consigne = consigne_f
            prev_flags = flags

    print()
    print("Resume :")
    print(f"  Nombre de changements detectes : {len(changes)}")

    if changes:
        first = changes[0]
        last = changes[-1]
        print(f"  Premiere lecture  : temp={first[1]}C, consigne={first[2]}F")
        print(f"  Derniere lecture  : temp={last[1]}C, consigne={last[2]}F")

        temps = [c[1] for c in changes if c[1] is not None]
        if temps:
            print(f"  Plage temperature : {min(temps)}C a {max(temps)}C")

    return 0


if __name__ == "__main__":
    sys.exit(main())
