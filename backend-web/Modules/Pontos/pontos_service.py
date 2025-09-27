from Modules.Pontos.pontos_repository import get_pontos_by_user

def calcular_saldos(usuario_id):
    pontos = get_pontos_by_user(usuario_id)
    saldo_atual = sum(
        p["quantidade"] if p["tipo"]=="credito" and p["status"]=="confirmado"
        else -p["quantidade"] if p["tipo"]=="debito" and p["status"]=="confirmado"
        else 0
        for p in pontos
    )
    em_processamento = sum(p["quantidade"] for p in pontos if p["status"]=="processando")
    total = sum(p["quantidade"] for p in pontos if p["tipo"]=="credito" and p["status"]=="confirmado")
    retirado = sum(p["quantidade"] for p in pontos if p["tipo"]=="debito" and p["status"]=="confirmado")

    return {
        "saldo_atual": saldo_atual,
        "em_processamento": em_processamento,
        "total": total,
        "retirado": retirado,
        "historico": pontos
    }
