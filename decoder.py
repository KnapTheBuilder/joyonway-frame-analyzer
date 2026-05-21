"""
joyonway-frame-analyzer - decoder.py
Decodeur des trames RS485 du controleur Joyonway P23B32 V2 (2019)

Auteur : KnapTheBuilder
Licence : MIT
Decouvertes : Gaet78 (HACS originelle), KDy (oscilloscope baudrate 38400), Neuro (ESP32 P23B32 V2)
"""

import re
from collections import Counter
from typing import Dict, List, Tuple, Optional


# Constantes du protocole
FRAME_START = 0x1A
FRAME_END = 0x1D

# Types de trames identifies (byte index 5)
TRAME_TYPES = {
    0xA1: "Commande equipement",
    0xA4: "Filtration / planning",
    0xAA: "Heartbeat / arret",
    0xB4: "Broadcast etat global",
    0xA5: "Polling capteurs",
    0x2E: "Polling actionneurs",
    0xD2: "Signature constante",
}


def extract_frames(raw_data: bytes) -> List[bytes]:
    """
    Extrait toutes les trames delimitees par 0x1A...0x1D dans un blob binaire.

    Args:
        raw_data: contenu binaire brut d'une capture RS485

    Returns:
        Liste de trames (bytes), chacune incluant les delimiteurs.
    """
    hex_data = raw_data.hex()
    matches = re.findall(r'1a[0-9a-f]+?1d', hex_data)
    return [bytes.fromhex(m) for m in matches]


def get_frame_type(frame: bytes) -> Optional[int]:
    """
    Retourne le byte de type (byte index 5) d'une trame, ou None si trop courte.
    """
    if len(frame) < 6:
        return None
    return frame[5]


def decode_broadcast_b4(frame: bytes) -> Dict:
    """
    Decode un broadcast 0xB4 (etat global du spa).

    Format observe (69 bytes typiquement) :
        1A FF 01 3C D2 B4 [...] [byte 14: temp degC] [...] [byte 16: consigne degF] [...] 1D
    """
    if len(frame) < 20:
        return {"error": f"Trame trop courte ({len(frame)} bytes, attendu >=20)"}

    if get_frame_type(frame) != 0xB4:
        return {"error": f"Pas un broadcast 0xB4 (type={get_frame_type(frame):#x})"}

    result = {
        "type": "broadcast_b4",
        "length": len(frame),
        "raw_hex": frame.hex(),
    }

    if len(frame) > 9:
        temp_f_byte9 = frame[9]
        result["temp_eau_f_byte9"] = temp_f_byte9
        result["temp_eau_c_byte9"] = round((temp_f_byte9 - 32) * 5 / 9, 1)

    if len(frame) > 14:
        result["temp_eau_c_byte14"] = frame[14]

    if len(frame) > 16:
        consigne_f = frame[16]
        result["consigne_f_byte16"] = consigne_f
        result["consigne_c_byte16"] = round((consigne_f - 32) * 5 / 9, 1)

    if len(frame) > 17:
        flags = frame[17]
        result["flags_byte17"] = f"{flags:#010b}"
        result["flags_byte17_hex"] = f"{flags:#04x}"

    if len(frame) >= 6:
        crc_bytes = frame[-5:-1]
        result["crc_or_counter"] = crc_bytes.hex()

    return result


def decode_command_a1(frame: bytes) -> Dict:
    """
    Decode une trame de commande equipement 0xA1.
    """
    if len(frame) < 18:
        return {"error": f"Trame trop courte ({len(frame)} bytes)"}

    if get_frame_type(frame) != 0xA1:
        return {"error": "Pas une commande 0xA1"}

    result = {
        "type": "commande_a1",
        "length": len(frame),
        "raw_hex": frame.hex(),
    }

    if len(frame) > 15:
        result["flags_8_15"] = frame[8:16].hex()

    if len(frame) > 16:
        consigne_f = frame[16]
        result["consigne_f_byte16"] = consigne_f
        if 60 <= consigne_f <= 104:
            result["consigne_c_byte16"] = round((consigne_f - 32) * 5 / 9, 1)
            result["consigne_valid_range"] = True
        else:
            result["consigne_valid_range"] = False

    return result


def analyze_capture(raw_data: bytes) -> Dict:
    """
    Analyse complete d'un fichier de capture RS485.
    """
    frames = extract_frames(raw_data)
    counts = Counter(frames)

    result = {
        "file_size_bytes": len(raw_data),
        "total_frames": len(frames),
        "unique_frames": len(counts),
        "frame_types": Counter(),
    }

    for frame, count in counts.items():
        ftype = get_frame_type(frame)
        if ftype is not None:
            result["frame_types"][ftype] += count

    result["top_broadcasts"] = [
        {"count": c, "length": len(f), "type": get_frame_type(f), "hex": f.hex()}
        for f, c in counts.most_common(10)
    ]

    rares = [(f, c) for f, c in counts.items() if c <= 5]
    result["rare_frames"] = sorted(
        [
            {"count": c, "length": len(f), "type": get_frame_type(f), "hex": f.hex()}
            for f, c in rares
        ],
        key=lambda x: (x["count"], x["hex"]),
    )

    for type_byte, type_name in TRAME_TYPES.items():
        unique_of_type = sorted(
            set(f for f in frames if get_frame_type(f) == type_byte)
        )
        if unique_of_type:
            result[f"type_{type_byte:#x}_uniques"] = [
                {"count": counts[f], "length": len(f), "hex": f.hex()}
                for f in unique_of_type
            ]

    for frame in frames:
        if get_frame_type(frame) == 0xB4:
            result["b4_decode_first"] = decode_broadcast_b4(frame)
            break

    for frame in reversed(frames):
        if get_frame_type(frame) == 0xB4:
            result["b4_decode_last"] = decode_broadcast_b4(frame)
            break

    return result
