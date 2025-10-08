# backend-web/Modules/Brindes/brindes_repository.py
import csv
from pathlib import Path
from typing import List, Dict, Any

DATA_FILE = Path(__file__).resolve().parents[3] / "dados-teste" / "Data_Brindes.txt"

def _int_or_zero(val: Any) -> int:
    try:
        return int(str(val).strip())
    except Exception:
        return 0

def load_brindes_raw() -> List[Dict[str, Any]]:
    """
    Lê o CSV no formato novo e retorna lista de variações (raw) com campos normalizados.
    Este nome é usado por brindes_service.py.
    """
    items: List[Dict[str, Any]] = []
    if not DATA_FILE.exists():
        return items

    with open(DATA_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            ativo = (row.get("Ativo") or "").strip()
            if ativo != "1":
                continue

            item = {
                "id": _int_or_zero(row.get("ID") or row.get("Id") or 0),
                "product_id": _int_or_zero(row.get("PRODUCT_ID") or row.get("Product_ID") or row.get("ProductId") or row.get("Product_Id") or row.get("Product") or row.get("ProductId") or row.get("PRODUCTID") or 0),
                "sku": (row.get("SKU") or row.get("Sku") or "").strip(),
                "name": (row.get("Nome") or row.get("Nome") or row.get("Name") or "").strip(),
                "description": (row.get("Descricao") or row.get("Descricao") or row.get("Description") or "").strip(),
                "details": (row.get("Detalhes") or row.get("Detalhes") or "").strip(),
                "category": (row.get("Categoria") or row.get("Categoria") or row.get("Category") or "").strip(),
                "size": (row.get("Tamanho") or row.get("Tamanho") or row.get("Size") or "").strip() or None,
                "pointsCost": _int_or_zero(row.get("Custo") or row.get("Cost") or 0),
                "stockInitial": _int_or_zero(row.get("Estoque_Inicial") or row.get("EstoqueInicial") or row.get("Estoque") or 0),
                "imageUrl": (row.get("URL") or row.get("Url") or row.get("Image") or "").strip() or None,
                "createdAt": (row.get("Data_Cadastro") or row.get("Data_Cadastro") or row.get("created_at") or "").strip(),
                "updatedAt": (row.get("Ultima_Modificacao") or row.get("Ultima_Modificacao") or row.get("updated_at") or "").strip(),
                "active": 1,
                "tags": (row.get("Tags") or "").strip(),
            }

            # fallback: if product_id missing, use id as product_id (single-variant product)
            if not item["product_id"] or item["product_id"] == 0:
                item["product_id"] = item["id"]

            # sanity: require id and name
            if item["id"] and item["name"]:
                items.append(item)
    return items

# backward compatibility helper (in case other modules import load_brindes)
def load_brindes() -> List[Dict[str, Any]]:
    return load_brindes_raw()
