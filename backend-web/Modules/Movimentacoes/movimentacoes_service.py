from typing import Dict, Any, List
from Modules.Brindes.brindes_service import listar_variacoes
from .movimentacoes_repository import append_mov, update_status, load_movs

def validar_estoque(items_req: List[Dict[str, Any]]) -> bool:
    variacoes = {v["id"]: v for v in listar_variacoes()}
    for it in items_req:
        v = variacoes.get(it["variantId"])
        if not v:
            return False
        if it["quantity"] <= 0:
            return False
        if v["stockCurrent"] < it["quantity"]:
            return False
        if (v.get("pointsCost") or 0) <= 0:
            return False
    return True

def criar_resgate(user_id: int, items_req: List[Dict[str, Any]], total_points: int) -> Dict[str, Any]:
    """
    Cria movimentações OUT em status 'processing' para cada variante solicitada.
    Retorna dict com ok True e movimentacoes criadas ou ok False e mensagem de erro.
    """
    if not validar_estoque(items_req):
        return {"ok": False, "error": "Estoque insuficiente ou custo inválido"}

    created_movs = []
    for it in items_req:
        variant_id = int(it["variantId"])
        quantity = int(it["quantity"])
        # recuperar dados da variante para SKU e product_id e pontos unitários
        variacoes = {v["id"]: v for v in listar_variacoes()}
        v = variacoes.get(variant_id)
        if not v:
            return {"ok": False, "error": f"Variante {variant_id} não encontrada"}

        points_unit = v.get("pointsCost", 0)
        points_total = points_unit * quantity

        mov = {
            "USER_ID": user_id,
            "VARIANT_ID": variant_id,
            "PRODUCT_ID": v.get("product_id") or 0,
            "SKU": v.get("sku") or "",
            "QTD": quantity,
            "POINTS_TOTAL": points_total,
            "TYPE": "OUT",
            "STATUS": "processing"
        }
        appended = append_mov(mov)
        created_movs.append(appended)

    return {"ok": True, "movimentacoes": created_movs}

def confirmar_resgate(mov_id: int) -> Dict[str, Any]:
    """
    Marca movimentação como 'confirmed' e retorna a movimentação alterada.
    Se já estiver confirmado ou não existir, retorna erro.
    """
    movs = load_movs()
    target = next((m for m in movs if m["MOV_ID"] == mov_id), None)
    if not target:
        return {"ok": False, "error": "Movimentação não encontrada"}
    if target["STATUS"] == "confirmed":
        return {"ok": False, "error": "Movimentação já confirmada"}

    changed = update_status(mov_id, "confirmed")
    if not changed:
        return {"ok": False, "error": "Falha ao atualizar status"}
    return {"ok": True, "movimentacao": changed}
