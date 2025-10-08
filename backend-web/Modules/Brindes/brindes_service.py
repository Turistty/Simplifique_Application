from typing import List, Dict, Any
from .brindes_repository import load_brindes_raw
from .estoque_service import estoque_atual_map

def listar_variacoes() -> List[Dict[str, Any]]:
    # variações cruas + estoque atual
    items = load_brindes_raw()
    stock_map = estoque_atual_map(items)
    for it in items:
        it["stockCurrent"] = stock_map.get(it["id"], it["stockInitial"])
    return items

def agrupar_por_produto() -> List[Dict[str, Any]]:
    # agrupa por product_id para uso do frontend (card + sizes)
    items = listar_variacoes()
    groups: Dict[int, Dict[str, Any]] = {}

    for it in items:
        pid = it["product_id"]
        if pid not in groups:
            groups[pid] = {
                "product_id": pid,
                "name": it["name"].replace(" - P","").replace(" - M","").replace(" - G","").replace(" - GG","").strip(),
                "description": it["description"],
                "details": it["details"],
                "category": it["category"],
                "imageUrl": it["imageUrl"],
                "variants": [],
            }
        # adiciona variante
        groups[pid]["variants"].append({
            "id": it["id"],
            "sku": it["sku"],
            "size": it["size"],
            "pointsCost": it["pointsCost"],
            "stockCurrent": it["stockCurrent"],
            "imageUrl": it["imageUrl"],
        })
        # fallbacks básicos
        if not groups[pid]["imageUrl"] and it["imageUrl"]:
            groups[pid]["imageUrl"] = it["imageUrl"]

    # calcular campos derivados: sizes, pointsCost (mínimo), stock (soma)
    result = []
    for g in groups.values():
        sizes = sorted(list({v["size"] for v in g["variants"] if v["size"]}))
        min_cost = min([v["pointsCost"] for v in g["variants"] if isinstance(v["pointsCost"], int)], default=0)
        total_stock = sum([v["stockCurrent"] for v in g["variants"]])
        result.append({
            "product_id": g["product_id"],
            "name": g["name"],
            "description": g["description"],
            "details": g["details"],
            "category": g["category"],
            "imageUrl": g["imageUrl"],
            "pointsCost": min_cost,
            "stock": total_stock,
            "sizes": sizes if sizes else None,
            "variants": g["variants"],
        })
    return result
