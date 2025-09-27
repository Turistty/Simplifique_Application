import bcrypt
from Modules.Users.user_repository import get_user_by_np

def autenticar(np, senha_digitada):
    user = get_user_by_np(np)
    if not user:
        return None
    if bcrypt.checkpw(senha_digitada.encode("utf-8"), user["senha_hash"].encode("utf-8")):
        return user
    return None
