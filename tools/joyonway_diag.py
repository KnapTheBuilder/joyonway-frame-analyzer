#!/usr/bin/env python3
# 2026-06-05 | Diag | Verifie si une capture RS485 contient des trames Joyonway exploitables | Depend: capture brute .bin ou .txt
#
# Joyonway Frame Analyzer - Outil de diagnostic capture
# Christophe Knap (KnapTheBuilder) - MIT
#
# But : dire en 5 secondes si une capture est decodable, et sinon pourquoi.
# N'envoie rien. 100 pour cent local. Aucune dependance externe.
#
# Usage :
#   python3 joyonway_diag.py capture.bin
#   python3 joyonway_diag.py capture.txt
#
# Accepte le binaire brut (sortie de  nc IP 8899 > capture.bin )
# et le texte hex (xxd, hex colle, avec ou sans \xNN).

import sys
import collections


def load_bytes(path):
    """Charge une capture, binaire brut ou representation texte/hex."""
    raw = open(path, "rb").read()

    # Heuristique : si l'octet 0x00 est present en quantite, c'est du binaire brut.
    # Sinon on tente une reconstruction depuis une representation texte (\xNN, hex).
    nul_ratio = raw.count(0x00) / max(len(raw), 1)
    printable = sum(1 for b in raw if 32 <= b < 127 or b in (9, 10, 13))
    print_ratio = printable / max(len(raw), 1)

    # Binaire brut probable
    if nul_ratio > 0.01 and print_ratio < 0.95:
        return raw, "binaire brut"

    # Reconstruction texte : gere \xNN, \n \t \r litteraux, et hex pur
    text = raw.decode("latin-1")
    out = bytearray()
    i = 0
    n = len(text)
    saw_escape = False
    while i < n:
        c = text[i]
        if c == "\\" and i + 1 < n:
            x = text[i + 1]
            if x == "x" and i + 3 < n:
                try:
                    out.append(int(text[i + 2:i + 4], 16))
                    i += 4
                    saw_escape = True
                    continue
                except ValueError:
                    pass
            if x in "ntr\\":
                out.append({"n": 10, "t": 9, "r": 13, "\\": 92}[x])
                i += 2
                saw_escape = True
                continue
        out.append(ord(c) & 0xFF)
        i += 1

    if saw_escape:
        return bytes(out), "texte avec echappements \\xNN"

    # Tentative hex pur (xxd ou hex colle)
    cleaned = []
    for line in text.splitlines():
        # retire un eventuel offset xxd en debut de ligne (ex: 00000000:)
        if ":" in line[:10]:
            line = line.split(":", 1)[1]
        # retire la colonne ASCII de droite de xxd (apres double espace)
        if "  " in line:
            line = line.split("  ", 1)[0]
        cleaned.append(line)
    hexstr = "".join(cleaned)
    hexstr = "".join(ch for ch in hexstr if ch in "0123456789abcdefABCDEF")
    if len(hexstr) >= 4 and len(hexstr) % 2 == 0:
        return bytes.fromhex(hexstr), "hex texte"

    return raw, "inconnu (traite comme binaire brut)"


def verdict(data):
    """Analyse le flux et rend un diagnostic clair."""
    n = len(data)
    if n == 0:
        print("FICHIER VIDE. Aucun octet a analyser.")
        return

    cnt = collections.Counter(data)
    ff = 100 * cnt.get(0xFF, 0) / n
    nul = 100 * cnt.get(0x00, 0) / n

    n_7e = data.count(b"\x7e")          # delimiteur Balboa / P69B133
    n_1a = data.count(b"\x1a")          # debut trame P23B32
    n_1d = data.count(b"\x1d")          # fin trame P23B32
    n_motif = data.count(b"\x03\x00\xa0")  # signature flux corrompu/PAC observe

    print("=" * 56)
    print("  JOYONWAY DIAG - resultat")
    print("=" * 56)
    print(f"  Octets analyses        : {n}")
    print(f"  Taux 0xFF              : {ff:.1f} %")
    print(f"  Taux 0x00              : {nul:.1f} %")
    print(f"  Delimiteurs 0x7E       : {n_7e}   (P69B133 type Balboa)")
    print(f"  Debuts 0x1A / fins 0x1D: {n_1a} / {n_1d}   (P23B32 V2)")
    print(f"  Motif 03 00 A0         : {n_motif}   (flux non-Joyonway / PAC)")
    print("-" * 56)

    # Decision
    if n_1a > 20 and n_1d > 20:
        print("  PROTOCOLE DETECTE : Joyonway P23B32 V2 (0x1A...0x1D).")
        print("  -> Capture exploitable. Depose-la dans l'analyzer.")
        print("  -> Baud attendu : 38400.")
        return

    if n_7e > 20:
        print("  PROTOCOLE DETECTE : type Balboa / P69B133 (0x7E).")
        print("  -> Capture exploitable cote profil Balboa.")
        print("  -> Baud attendu : 115200. Integration de reference : Gaet78.")
        return

    # Pas de protocole valide
    print("  AUCUNE TRAME JOYONWAY VALIDE.")
    print("")
    if n_motif > 200:
        print("  Signature de flux non-Joyonway detectee (motif 03 00 A0")
        print("  repete). Deux causes possibles, par ordre de probabilite :")
    else:
        print("  La capture ne contient ni 0x7E ni 0x1A/0x1D. Causes :")
    print("")
    print("  1) MAUVAIS BAUD RATE. Le pont livre des octets desynchronises.")
    print("     -> Teste 9600, 38400, 115200 et relance ce diag a chaque fois.")
    print("     -> Le bon baud fait apparaitre 0x7E (P69B133) ou 0x1A (P23B32).")
    print("")
    print("  2) BUS POLLUE PAR UN AUTRE EQUIPEMENT (ex: PAC sur le bus).")
    print("     -> Debranche la PAC, garde le pont seul, recapture.")
    print("     -> Si le motif disparait, c'etait la PAC.")
    print("")
    print("  Inutile de deposer cette capture dans l'analyzer en l'etat :")
    print("  elle ne contient aucune trame spa decodable.")


def main():
    if len(sys.argv) != 2:
        print("Usage : python3 joyonway_diag.py <capture.bin|capture.txt>")
        sys.exit(1)
    data, kind = load_bytes(sys.argv[1])
    print(f"Format detecte : {kind}")
    verdict(data)


if __name__ == "__main__":
    main()
