from typing import List, Dict, Any
from .rewards_repository import get_all_rewards

def list_rewards(filepath: str =  r"C:\Users\ProjetoDigitalização\Desktop\Simplifique\Simplifique_Application\dados-teste\Data_Brindes.txt") -> List[Dict[str,Any]]:
    return get_all_rewards(filepath)

def group_by_variants(items: List[Dict[str,Any]]) -> List[Dict[str,Any]]:
    groups: dict = {}
    
    for r in items:
        name = r.get("name", "") or ""
        
        base = name
        
        if " - " in name:
            base = name.split(" - ",1)[0].strip()
            
        key = (base, r.get("category", "Outros"), r.get("pointsCost",0))
        
        if key not in groups:
            new_r = dict(r)
            new_r["name"] = base
            
            sz = r.get("sizes")
            if isinstance(sz,list):
                new_r["sizes"] = [s for s in sz if s]
            elif isinstance(sz,str) and sz:
                new_r["sizes"] = [sz]
            else:
                new_r["sizes"] = []
            new_r["stock"] = int(new_r.get("stock") or 0)
            groups[key] = new_r
        else:
            existing = groups[key]
            
            sz = r.get("sizes")
            add_list = sz if isinstance(sz,list) else ([sz]  if isinstance(sz, str) and sz else [] )
            for s in add_list:
                if s and s not in existing["sizes"]:
                    existing ["sizes"].append(s)
                    
            existing["stock"] = int(existing.get("stock") or 0) + int(r.get("stock") or 0)
            
    for v in groups.values():
        if not v["sizes"]:
            v["sizes"] = None
    return list(groups.values())
                    
            