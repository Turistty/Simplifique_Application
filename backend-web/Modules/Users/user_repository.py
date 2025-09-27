def get_all_users(filepath="dados-teste/users.txt"):
    usuarios = []
    # Abre o arquivo de usuários para leitura
    with open(filepath, "r", encoding="utf-8") as f:
        linhas = f.read().strip().split("\n")  # Lê todas as linhas e separa por quebra de linha
        header = linhas.pop(0)  # Remove o cabeçalho
        for linha in linhas:
            cols = linha.split(";")  # Separa os campos por ponto e vírgula
            usuarios.append({
                "id": cols[0],
                "np": cols[1],
                "senha_hash": cols[2],
                "perfil": cols[3],
                "nome": cols[4],
                "departamento": cols[5],
                "ativo": cols[6] == "1",  # Converte para booleano
                "ultimo_login": cols[7],
                "data_cadastro": cols[8]
            })
    return usuarios  # Retorna a lista de usuários

def get_user_by_np(np, filepath="dados-teste/users.txt"):
    # Busca o usuário pelo campo 'np'
    return next((u for u in get_all_users(filepath) if u["np"] == np), None)
