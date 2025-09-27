def get_all_pontos(filepath="dados-teste/pontos.txt"):
    pontos = []
    with open(filepath, "r", encoding="utf-8") as f:
        linhas = f.read().strip().split("\n")
        header = linhas.pop(0)
        for linha in linhas:
            cols = linha.split(";")
            pontos.append({
                "id": cols[0],
                "usuario_id": cols[1],
                "tipo": cols[2],
                "quantidade": int(cols[3]),
                "status": cols[4],
                "origem": cols[5],
                "referencia_id": cols[6],
                "observacao": cols[7],
                "data_movimento": cols[8],
                "registrado_por": cols[9]
            })
    return pontos

def get_pontos_by_user(usuario_id, filepath="dados-teste/pontos.txt"):
    return [p for p in get_all_pontos(filepath) if p["usuario_id"] == str(usuario_id)]
