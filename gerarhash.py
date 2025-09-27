import bcrypt

senha = "1111".encode("utf-8")
hash_senha = bcrypt.hashpw(senha, bcrypt.gensalt())
print(hash_senha.decode())