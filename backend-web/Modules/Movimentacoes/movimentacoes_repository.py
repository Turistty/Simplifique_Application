import csv
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

MOV_FILE = Path(__file__).resolve().parents[3] / "dados-teste" / "Data_Movimentation.txt"

def ensure_file():
    if not MOV_FILE.exists():
        MOV_FILE.write_text("MOV_ID;USER_ID;VARIANT_ID;PRODUCT_ID;SKU;QTD;POINTS_TOTAL;TYPE;STATUS;CREATED_AT\n", encoding="utf-8")

def load_movs() -> List[Dict[str, Any]]:
    ensure_file()
    movs = []
    with open(MOV_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for r in reader:
            movs.append({
                "MOV_ID": int(r.get("MOV_ID") or "0"),
                "USER_ID": int(r.get("USER_ID") or "0"),
                "VARIANT_ID": int(r.get("VARIANT_ID") or "0"),
                "PRODUCT_ID": int(r.get("PRODUCT_ID") or "0"),
                "SKU": (r.get("SKU") or "").strip(),
                "QTD": int(r.get("QTD") or "0"),
                "POINTS_TOTAL": int(r.get("POINTS_TOTAL") or "0"),
                "TYPE": (r.get("TYPE") or "").strip(),  # OUT/IN
                "STATUS": (r.get("STATUS") or "").strip(),  # processing/confirmed/canceled
                "CREATED_AT": (r.get("CREATED_AT") or "").strip(),
            })
    return movs

def next_id(movs: List[Dict[str, Any]]) -> int:
    return (max([m["MOV_ID"] for m in movs], default=0) + 1)

def append_mov(mov: Dict[str, Any]) -> Dict[str, Any]:
    ensure_file()
    movs = load_movs()
    mov_id = next_id(movs)
    mov["MOV_ID"] = mov_id
    mov["CREATED_AT"] = time.strftime("%Y-%m-%d %H:%M:%S")

    with open(MOV_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow([
            mov["MOV_ID"],
            mov.get("USER_ID", 0),
            mov.get("VARIANT_ID", 0),
            mov.get("PRODUCT_ID", 0),
            mov.get("SKU", ""),
            mov.get("QTD", 0),
            mov.get("POINTS_TOTAL", 0),
            mov.get("TYPE", "OUT"),
            mov.get("STATUS", "processing"),
            mov["CREATED_AT"]
        ])
    return mov

def update_status(mov_id: int, new_status: str) -> Optional[Dict[str, Any]]:
    movs = load_movs()
    changed = None
    # reescreve arquivo com status atualizado
    with open(MOV_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(["MOV_ID","USER_ID","VARIANT_ID","PRODUCT_ID","SKU","QTD","POINTS_TOTAL","TYPE","STATUS","CREATED_AT"])
        for m in movs:
            if m["MOV_ID"] == mov_id:
                m["STATUS"] = new_status
                changed = m
            writer.writerow([
                m["MOV_ID"], m["USER_ID"], m["VARIANT_ID"], m["PRODUCT_ID"], m["SKU"],
                m["QTD"], m["POINTS_TOTAL"], m["TYPE"], m["STATUS"], m["CREATED_AT"]
            ])
    return changed
