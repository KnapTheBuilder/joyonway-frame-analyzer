#!/usr/bin/env python3
"""
joyonway-frame-analyzer - analyzer.py
Script principal d'analyse d'une capture RS485 Joyonway P23B32.

Usage:
    python analyzer.py capture.bin

Auteur : KnapTheBuilder
Licence : MIT
"""

import sys
from pathlib import Path
from decoder import (
    analyze_capture,
    TRAME_TYPES,
    decode_broadcast_b4,
    extract_frames,
    get_frame_type,
)


def print_header(title: str, char: str = "=") -> None:
    width = max(80, len(title) + 4)
    print()
    print(char * width)
    print(f"  {title}")
    print(char * width)


def print_subheader(title: str) -> None:
    print()
    print(f"--- {title} ---")


def format_b4_decode(decoded: dict) -> None:
    if "error" in decoded:
        print(f"  ERREUR: {decoded['error']}")
        return

    print(f"  Longueur trame : {decoded['length']} bytes")

    if "temp_eau_c_byte14" in decoded:
        print(f"  Temperature eau (byte 14, C) : {decoded['temp_eau_c_byte14']} degC")

    if "temp_eau_f_byte9" in decoded:
        print(
            f"  Temperature eau (byte 9, F)  : {decoded['temp_eau_f_byte9']} F "
            f"(= {decoded['temp_eau_c_byte9']} degC)"
        )

    if "consigne_f_byte16" in decoded:
        print(
            f"  Consigne thermostat (byte 16, F) : {decoded['consigne_f_byte16']} F "
            f"(= {decoded['consigne_c_byte16']} degC)"
        )

    if "flags_byte17" in decoded:
        print(
            f"  Flags equipements (byte 17) : "
            f"{decoded['flags_byte17_hex']} = {decoded['flags_byte17']}"
        )

    if "crc_or_counter" in decoded:
        print(f"  CRC / compteur (4 derniers bytes) : {decoded['crc_or_counter']}")


def main() -> int:
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} capture.bin")
        print()
        print("Capture exemple :")
        print("  nc 192.168.1.34 8899 > capture.bin")
        return 1

    capture_path = Path(sys.argv[1])
    if not capture_path.exists():
        print(f"ERREUR: fichier introuvable : {capture_path}")
        return 1

    raw = capture_path.read_bytes()
    print_header(f"ANALYSE : {capture_path.name}")

    result = analyze_capture(raw)

    print_subheader("Statistiques globales")
    print(f"  Taille fichier  : {result['file_size_bytes']} octets")
    print(f"  Trames totales  : {result['total_frames']}")
    print(f"  Trames uniques  : {result['unique_frames']}")

    print_subheader("Distribution par type de trame")
    for type_byte, count in sorted(
        result["frame_types"].items(), key=lambda x: -x[1]
    ):
        type_name = TRAME_TYPES.get(type_byte, "(inconnu)")
        print(f"  0x{type_byte:02X}  {count:5d} occurrences  {type_name}")

    print_subheader("Top 10 trames les plus frequentes")
    for entry in result["top_broadcasts"]:
        ftype = entry["type"] if entry["type"] is not None else 0
        type_name = TRAME_TYPES.get(entry["type"], "?") if entry["type"] else "?"
        truncated = entry["hex"][:60] + "..." if len(entry["hex"]) > 60 else entry["hex"]
        print(
            f"  x{entry['count']:<5} [{entry['length']:3d}b] "
            f"type=0x{ftype:02X} ({type_name})"
        )
        print(f"          {truncated}")

    if result["rare_frames"]:
        print_subheader("Trames RARES (1-5 occurrences) - potentielles commandes")
        print(f"  {len(result['rare_frames'])} trames rares trouvees")
        for entry in result["rare_frames"]:
            ftype = entry["type"] if entry["type"] is not None else 0
            type_name = TRAME_TYPES.get(entry["type"], "?")
            print(
                f"  x{entry['count']:<3} [{entry['length']:3d}b] "
                f"type=0x{ftype:02X} "
                f"({type_name})"
            )
            print(f"        {entry['hex']}")

    for type_byte in (0xA1, 0xA4, 0xAA, 0xB4):
        key = f"type_{type_byte:#x}_uniques"
        if key in result and result[key]:
            type_name = TRAME_TYPES.get(type_byte, "?")
            print_subheader(
                f"Trames type 0x{type_byte:02X} uniques ({type_name})"
            )
            for entry in result[key]:
                print(f"  x{entry['count']:<5} [{entry['length']:3d}b]  {entry['hex']}")

    if "b4_decode_first" in result:
        print_subheader("Decodage du PREMIER broadcast 0xB4")
        format_b4_decode(result["b4_decode_first"])

    if "b4_decode_last" in result:
        print_subheader("Decodage du DERNIER broadcast 0xB4")
        format_b4_decode(result["b4_decode_last"])

    print_subheader("Suggestions")
    if result["frame_types"].get(0xA1, 0) > 0:
        a1_count = result["frame_types"][0xA1]
        if a1_count > 50:
            print(
                "  Beaucoup de trames 0xA1 detectees. La plupart sont probablement "
                "des broadcasts d'etat repetes par le controleur."
            )
        if any(e["count"] <= 3 for e in result.get("rare_frames", []) if e["type"] == 0xA1):
            print(
                "  Des trames 0xA1 rares ont ete detectees : ce sont probablement "
                "de vraies commandes envoyees par l'app Joyonway. Examiner le byte 16 "
                "pour la consigne thermostat (en Fahrenheit, plage 60-104)."
            )

    if result["frame_types"].get(0xA4, 0) == 0:
        print(
            "  Aucune trame 0xA4 capturee. Pour decoder la commande filtration, "
            "modifier le planning de filtration via l'app Joyonway pendant la capture."
        )

    print()
    print("=" * 80)
    print("  ANALYSE TERMINEE")
    print("=" * 80)
    print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
