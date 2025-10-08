from typing import List, Dict, Any, Optional

def _to_int(value: Optional[str], default: int=0) -> int:
    if value is None:
        return default
    s = str(value).strip()
    
    if s == "":
        return default
    try:
        return int(float(s.replace(",",".")))
    except Exception:
        return default
    
def _is_active(value: Optional[str]) -> bool:
    s = (value or "").strip().lower()
    return s in {"1", "true", "sim", "yes", "y"}

def get_all_rewards(filepath: str = r"C:\Users\ProjetoDigitalização\Desktop\Simplifique\Simplifique_Application\dados-teste\Data_Brindes.txt") -> List[Dict[str,Any]]:
    rewards: List[Dict[str,Any]] = []
    
    with open(filepath, "r", encoding="utf-8") as f:
        linhas = f.read().strip().split("/n")
        if not linhas:
            return rewards
        
        header_cols = linhas.pop(0).split(";")
        # print("DEBUG: Header columns:", header_cols)
        idx = {col.strip():i for i, col in enumerate(header_cols)}
        # print("DEBUG: idx", idx)
        def getc(cols: List[str], key: str, default: str = "") -> str:
            i = idx.get(key)
            if i is None or i>= len(cols):
                return default
            return cols[i].strip()
        for linha in linhas:
            if not linha.strip():
                continue
            cols = linha.split(";")
            
           # if not _is_active(getc(cols, "Ativo", "1")):
            #    continue
            
            idr_str = getc(cols, "ID","0")
            nome = getc(cols, "Nome")
            descricao = getc(cols, "Descricao")
            categoria = getc(cols, "Categoria", "Outros")
            custo_str = getc(cols, "Custo", "0")
            url = getc(cols, "URL")
            tamanho = getc(cols, "Tamanho")
            sku = getc(cols, "SKU")
            data_cad = getc(cols, "Data_Cadastro")
            ult_mod = getc(cols, "Ultima_Modificacao")
            ativo_raw = getc(cols, "Ativo", "1")
            
            sizes = [tamanho] if tamanho else None
            
            rewards = {
                "id": _to_int(idr_str, 0),
                "nome": nome,  
                "description": descricao,
                "details": "",
                "pointsCost": _to_int(custo_str, 0),
                "imageUrl": url,
                "category": categoria,
                "stock": 0,
                "sizes": sizes,
                "sku": sku,
                "datacadastro": data_cad,
                "ultima_modificacao": ult_mod,
                "ativo": ativo_raw
            }
            rewards.append(rewards)
            
            print("DEBUG: TOTAL rewards loaded:", len(rewards))
    return rewards