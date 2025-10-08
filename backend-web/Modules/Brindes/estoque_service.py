from typing import Dict, Any, List
from Modules.Movimentacoes.movimentacoes_repository import load_movs

def estoque_atual_por_variacao(variant_id: int, stock_initial: int) -> int:
    movs = load_movs()
    # considerar apenas confirmed
    outs = sum(m["QTD"] for m in movs if m["VARIANT_ID"] == variant_id and m["TYPE"] == "OUT" and m["STATUS"] == "confirmed")
    ins = sum(m["QTD"] for m in movs if m["VARIANT_ID"] == variant_id and m["TYPE"] == "IN" and m["STATUS"] == "confirmed")
    return max(stock_initial - outs + ins, 0)

def estoque_atual_map(brindes: List[Dict[str, Any]]) -> Dict[int, int]:
    # retorna {variant_id: stock_current}
    return {b["id"]: estoque_atual_por_variacao(b["id"], b["stockInitial"]) for b in brindes}
