"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// ---------- Tipos vindos do backend ----------
type BackendBrinde = {
  id?: number;
  ID?: string;

  product_id?: number;
  PRODUCT_ID?: string;

  sku?: string;
  SKU?: string;

  name?: string;
  Nome?: string;

  description?: string;
  Descricao?: string;

  details?: string;
  Detalhes?: string;

  category?: string;
  Categoria?: string;

  size?: string | null;
  Tamanho?: string | null;

  pointsCost?: number;
  Custo?: string;

  // variantes de estoque / inicial / atual
  stock?: number;
  stockCurrent?: number;
  stockInitial?: number;
  Estoque?: number;
  Estoque_Inicial?: number;
  EstoqueInicial?: number;

  // urls e datas
  imageUrl?: string | null;
  URL?: string | null;

  createdAt?: string;
  Data_Cadastro?: string;
  updatedAt?: string;
  Ultima_Modificacao?: string;

  // possível formato agrupado
  variants?: any;
};


// ---------- Modelos da UI ----------
type Variant = {
  id: number;
  size?: string;
  pointsCost: number;
  imageUrl?: string;
  stock?: number;
  sku?: string;
};

interface Reward {
  id: number;
  name: string;
  description: string;
  details?: string;
  category: string;
  imageUrl?: string;
  pointsCost: number;
  stock: number;
  sizes?: string[];
  variants: Variant[];
}

interface CartItem {
  key: string;
  variantId: number;
  name: string;
  imageUrl?: string;
  pointsCost: number;
  quantity: number;
  selectedSize?: string;
}

// ---------- Helpers ----------
const SIZE_SUFFIX_REGEX = /\s*-\s*(P|M|G|GG)\s*$/i;

function normalizeBaseName(name: string): string {
  return (name || "").replace(SIZE_SUFFIX_REGEX, "").trim();
}

function safeNumber(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").replace(/\D/g, "");
  const n = parseInt(s || "0", 10);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeBackendItem(b: BackendBrinde) {
  const id =
    typeof b.id === "number"
      ? b.id
      : Number.parseInt((b.ID || b.ID || "").toString().trim() || "0", 10);

  const product_id =
    typeof b.product_id === "number"
      ? b.product_id
      : Number.parseInt((b.PRODUCT_ID || "").toString().trim() || "0", 10) || id;

  const name =
    (b.name && String(b.name).trim()) || (b.Nome && String(b.Nome).trim()) || `Item ${id}`;

  const description =
    (b.description && String(b.description).trim()) ||
    (b.Descricao && String(b.Descricao).trim()) ||
    "";

  const details =
    (b.details && String(b.details).trim()) ||
    (b.Detalhes && String(b.Detalhes).trim()) ||
    "";

  const category =
    (b.category && String(b.category).trim()) ||
    (b.Categoria && String(b.Categoria).trim()) ||
    "Outros";

  const size =
    (b.size && String(b.size).trim()) || (b.Tamanho && String(b.Tamanho).trim()) || undefined;

  const pointsCost =
    typeof b.pointsCost === "number" ? b.pointsCost : /^\d+$/.test(String(b.Custo || "").trim()) ? parseInt(String(b.Custo || "").trim(), 10) : 0;

  const imageUrl =
    (b.imageUrl && String(b.imageUrl).trim()) || (b.URL && String(b.URL).trim()) || undefined;

  const stockInitial = safeNumber((b as any).stockInitial ?? b.stockInitial ?? b.Estoque_Inicial ?? 0, 0);
  const stockCurrent = safeNumber((b as any).stockCurrent ?? b.stockCurrent ?? b.stock ?? stockInitial, stockInitial);

  const sku = (b.sku || b.SKU || "").toString().trim();

  return {
    id,
    product_id,
    sku,
    name,
    description,
    details,
    category,
    size,
    pointsCost,
    imageUrl,
    createdAt: b.createdAt || b.Data_Cadastro || "",
    updatedAt: b.updatedAt || b.Ultima_Modificacao || "",
    stockInitial,
    stockCurrent,
  };
}

function isProductShape(obj: any): boolean {
  return !!obj && (obj.product_id !== undefined || obj.pointsCost !== undefined || Array.isArray(obj.variants));
}

function toReward(item: any): Reward {
  // Se já for produto agrupado vindo do backend
  if (isProductShape(item)) {
    const productId = item.product_id ?? item.id ?? 0;
    const name = item.name ?? item.Nome ?? "";
    const description = item.description ?? item.Descricao ?? "";
    const details = item.details ?? item.Detalhes ?? "";
    const category = item.category ?? item.Categoria ?? "Outros";
    const imageUrl = item.imageUrl ?? item.URL ?? (Array.isArray(item.variants) && item.variants[0]?.imageUrl) ?? "/logos/Simplifique.png";
    const pointsCost = safeNumber(item.pointsCost ?? item.custo ?? 0, 0);
    const stock = safeNumber(item.stock ?? item.stockCurrent ?? item.stockCurrent ?? 0, 0);

    // normalizar variantes se existirem
    const variantsRaw = Array.isArray(item.variants) ? item.variants : [];
    const variants: Variant[] = variantsRaw.map((v: any) => ({
      id: v.id ?? v.ID ?? 0,
      size: v.size ?? v.Tamanho ?? undefined,
      pointsCost: safeNumber(v.pointsCost ?? v.Custo ?? 0, 0),
      imageUrl: v.imageUrl ?? v.URL ?? undefined,
      stock: safeNumber(v.stockCurrent ?? v.stockInitial ?? v.stock ?? 0, 0),
      sku: v.sku ?? v.SKU ?? undefined,
    }));

    const sizes = Array.from(new Set(variants.map((vv) => vv.size).filter(Boolean))) as string[] | undefined;

    return {
      id: productId,
      name: normalizeBaseName(name),
      description,
      details,
      category,
      imageUrl,
      pointsCost,
      stock,
      sizes: sizes && sizes.length ? sizes : undefined,
      variants: variants.length ? variants : [{ id: productId, size: undefined, pointsCost, imageUrl, stock }],
    };
  }

  // Caso seja variação isolada (linha CSV)
  const norm = normalizeBackendItem(item as BackendBrinde);
  return {
    id: norm.product_id || norm.id,
    name: normalizeBaseName(norm.name),
    description: norm.description,
    details: norm.details,
    category: norm.category,
    imageUrl: norm.imageUrl ?? "/logos/Simplifique.png",
    pointsCost: norm.pointsCost ?? 0,
    stock: norm.stockCurrent ?? norm.stockInitial ?? 0,
    sizes: norm.size ? [norm.size] : undefined,
    variants: [
      {
        id: norm.id,
        size: norm.size,
        pointsCost: norm.pointsCost,
        imageUrl: norm.imageUrl,
        stock: norm.stockCurrent ?? norm.stockInitial ?? 0,
        sku: norm.sku,
      },
    ],
  };
}

function getFirstVariant(item: Reward): Variant | null {
  return item.variants && item.variants.length > 0 ? item.variants[0] : null;
}

function findVariantForSize(item: Reward, size?: string): Variant | undefined {
  if (!item.variants || item.variants.length === 0) return undefined;
  if (!size) return item.variants[0];
  return item.variants.find((v) => v.size === size) || item.variants[0];
}

// ---------- Componente ----------
export default function RewardsPage(): React.ReactElement {
  const router = useRouter();

  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Reward | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addingKey, setAddingKey] = useState<string | null>(null);

  const [notification, setNotification] = useState<string>("");

  // buscar pontos reais do backend
  useEffect(() => {
    api
      .get("/api/pontos")
      .then((res) => {
        setUserPoints(res.data.saldo_atual);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  // buscar produtos agrupados primeiro; fallback para /api/brindes
  useEffect(() => {
    setLoading(true);
    api
      .get("/api/brindes/produtos")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const rewards = list.map((p: any) => toReward(p));
        setRewards(rewards);
        setLoading(false);
      })
      .catch(() => {
        api
          .get("/api/brindes")
          .then((res) => {
            const list = Array.isArray(res.data) ? res.data : [];
            // transformar variações em produtos agrupados localmente
            const mapped = list.map((l: any) => toReward(l));
            // quando são variações, toReward ainda retornará produtos por variação; agrupar por id/name
            const groups = new Map<string, Reward>();
            for (const r of mapped) {
              const key = `${r.name}::${r.category}`;
              if (!groups.has(key)) {
                groups.set(key, { ...r });
              } else {
                const g = groups.get(key)!;
                // merge variants, sizes, stock, pointsCost
                g.variants = [...g.variants, ...r.variants];
                g.sizes = Array.from(new Set([...(g.sizes || []), ...(r.sizes || [])]));
                g.stock = (g.stock || 0) + (r.stock || 0);
                g.pointsCost = Math.min(g.pointsCost || Infinity, r.pointsCost || Infinity) || 0;
              }
            }
            setRewards(Array.from(groups.values()));
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      });
  }, []);

  // filtro e ordenação
  const filtered = rewards
    .filter(
      (r) =>
        (category === "Todas" || r.category === category) &&
        r.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === "asc" ? a.pointsCost - b.pointsCost : b.pointsCost - a.pointsCost
    );

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalCartPts = cart.reduce((sum, i) => sum + i.pointsCost * i.quantity, 0);

  function showNotification(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  }

function addToCart(item: Reward, size?: string) {
  if (userPoints == null) {
    showNotification("❌ Usuário não autenticado ou pontos indisponíveis.");
    return { success: false };
  }

  const variant = findVariantForSize(item, size);
  if (!variant) {
    showNotification("❌ Variação não encontrada.");
    return { success: false };
  }

  if ((variant.pointsCost ?? 0) <= 0) {
    showNotification("❌ Brinde indisponível para resgate (custo não definido).");
    return { success: false };
  }

  if ((variant.stock ?? 0) <= 0) {
    showNotification("❌ Sem estoque disponível para essa variação.");
    return { success: false };
  }

  if (userPoints < (variant.pointsCost ?? 0)) {
    showNotification("❌ Pontos insuficientes para resgatar este brinde.");
    return { success: false };
  }

  const key = `${variant.id}_${size || ""}`;
  setAddingKey(key);

  setTimeout(() => {
    setCart((prev) => {
      const exist = prev.find((i) => i.key === key);
      if (exist) {
        const nextQty = exist.quantity + 1;
        if (userPoints >= exist.pointsCost * nextQty && nextQty <= (variant.stock ?? Infinity)) {
          showNotification("✅ Quantidade aumentada com sucesso!");
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: nextQty } : i
          );
        }
        showNotification("❌ Pontos insuficientes ou estoque insuficiente para aumentar a quantidade.");
        return prev;
      }

      const newItem: CartItem = {
        key,
        variantId: variant.id,
        name: item.name,
        imageUrl: variant.imageUrl || item.imageUrl || "/logos/Simplifique.png",
        pointsCost: variant.pointsCost,
        quantity: 1,
        selectedSize: size,
      };

      showNotification("✅ Brinde adicionado com sucesso!");
      return [...prev, newItem];
    });
    setAddingKey(null);
  }, 250);

  return { success: true };
}


  function removeFromCart(key: string) {
    setCart((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, quantity: Math.max(i.quantity - 1, 0) } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function checkout() {
    if (!window.confirm(`Confirmar resgate de ${totalCartPts} pts?`)) return;
    if (userPoints !== null && userPoints >= totalCartPts) {
      setUserPoints((p) => (p ?? 0) - totalCartPts);
      setCart([]);
      setCartOpen(false);
      showNotification("✅ Seu pedido entrou em processamento");
      // TODO: POST /api/movimentacoes/resgate com userId e items
    } else {
      showNotification("❌ Pontos insuficientes");
    }
  }

  const categories = ["Todas", ...Array.from(new Set(rewards.map((r) => r.category)))];

  return (
    <div className="min-h-screen bg-[#ededed] text-[#00205b]">
      {/* HEADER */}
      <header className="bg-[#00205b] text-white shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-2xl hover:opacity-80">
              ←
            </button>
            <h1 className="text-2xl font-bold">Loja de Brindes</h1>
          </div>

          <div className="flex flex-1 items-center gap-4">
            <input
              type="text"
              placeholder="Buscar brinde..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-[#c3c7cd] focus:ring-2 focus:ring-[#41b6e6]"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "asc" | "desc")}
              className="px-3 py-2 rounded-lg bg-white text-[#00205b] border border-gray-300 focus:ring-2 focus:ring-[#41b6e6]"
            >
              <option value="asc">Menor custo</option>
              <option value="desc">Maior custo</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            {userPoints == null ? (
              <div className="h-6 w-24 bg-[#c6d6e3] animate-pulse rounded" />
            ) : (
              <div className="px-3 py-2 bg-white text-[#00205b] rounded-lg font-medium">
                🎯 {userPoints} pts
              </div>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative px-3 py-2 bg-white text-[#00205b] rounded-lg hover:bg-[#f0f0f0] transition"
            >
              🛒
                {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff3b30] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md border-2 border-white">
                  {totalItems}
                </span>
                )}
            </button>
          </div>
        </div>

        {/* filtros */}
        <nav className="bg-[#ededed]">
          <div className="max-w-6xl mx-auto px-4 overflow-x-auto">
            <ul className="flex gap-3 py-3 whitespace-nowrap">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm transition ${
                      category === cat
                        ? "bg-[#41b6e6] text-white"
                        : "bg-[#c8c9c7] text-[#00205b] hover:bg-[#b7ce95]"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* GALERIA */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(loading ? Array(4).fill(null) : filtered).map((item, idx) => {
        if (loading) {
          return <div key={idx} className="h-80 bg-[#c6d6e3] rounded-xl animate-pulse" />;
        }

        const firstVariant = getFirstVariant(item);
        const defaultSize = item.sizes?.[0] || firstVariant?.size || "";
        const effectiveCost = item.pointsCost || 0;
        const affordable = (userPoints ?? 0) >= effectiveCost;
        const key = `${firstVariant?.id || item.id}_${defaultSize}`;

        return (
            <div
            key={item.id}
            onClick={() => {
              setSelected(item);
              setDetailOpen(true);
              setSelectedSize(defaultSize);
            }}
            className="group bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition cursor-pointer overflow-hidden flex flex-col"
            >
            <div className="p-4">
              <div className="relative h-40 bg-[#ffffff] rounded-lg flex items-center justify-center">
              <img src={item.imageUrl || "/logos/Simplifique.png"} alt={item.name} className="max-h-full max-w-full object-contain" />
              </div>
            </div>

            <div className="px-4 pb-4 flex flex-col flex-1">

              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-sm text-[#75787b] flex-1 mt-2">{item.description}</p>

              <div className="mt-2 flex justify-between items-center">
              <span className="text-xl font-bold text-[#1e2a63]">{effectiveCost > 0 ? `${effectiveCost} pts` : "Indisponível"}</span>
              <span className="text-sm text-[#75787b]">Estoque: {item.stock}</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
              <button
                onClick={(e) => {
                e.stopPropagation();
                addToCart(item, defaultSize || undefined);
                }}
                disabled={
                  effectiveCost <= 0 ||
                  !affordable ||
                  addingKey === key ||
                  (firstVariant?.stock ?? item.stock) <= 0
                }
                className={`px-10 py-1 rounded-lg font-semibold transition ${
                  effectiveCost > 0 && affordable && (firstVariant?.stock ?? item.stock) > 0
                  ? "bg-[#200b50] text-white hover:bg-[#33a1d1]"
                  : "bg-[#c8c9c7] text-[#75787b] cursor-not-allowed"
                } mx-auto block`}
                >
                {addingKey === key
                ? "Adicionando..."
                : (firstVariant?.stock ?? item.stock) <= 0
                ? "Sem estoque"
                : "+ Carrinho"}
              </button>
              </div>
            </div>
            </div>
        );
          })}
        </div>
        </main>

        {/* DRAWER — Detalhe */}
        {detailOpen && selected && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDetailOpen(false)} />
            <aside className="relative ml-auto bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col">
          <button onClick={() => setDetailOpen(false)} className="self-end mb-4 text-xl">
            ✖
          </button>
          <img src={selected.imageUrl || "/logos/Simplifique.png"} alt={selected.name} className="w-full h-100 object-cover rounded-lg" />
          <h2 className="mt-4 text-2xl font-semibold">{selected.name}</h2>
          <p className="mt-2 text-[#75787b]">{selected.description}</p>
          <p className="mt-2 text-sm text-[#75787b] whitespace-pre-line">{selected.details}</p>

          {selected.sizes && selected.sizes.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Tamanho:</label>
              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#41b6e6]">
            {selected.sizes.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
              </select>
            </div>
          )}

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-[#1e2a63]">
            {(() => {
              const v = findVariantForSize(selected, selectedSize);
              const cost = v?.pointsCost || selected.pointsCost || 0;
              return cost > 0 ? `${cost} pts` : "Indisponível";
            })()}
              </span>
                <button
                onClick={() => {
                  addToCart(selected, selected.sizes ? selectedSize : undefined);

                }}
                disabled={
                  addingKey === `${findVariantForSize(selected, selectedSize)?.id || selected.id}_${selectedSize}` ||
                  (() => {
                  const v = findVariantForSize(selected, selectedSize);
                  const cost = v?.pointsCost || selected.pointsCost || 0;
                  const stock = v?.stock ?? selected.stock ?? 0;
                  return cost <= 0 || stock <= 0 || (userPoints ?? 0) < cost;
                  })()
                }
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  (() => {
                  const v = findVariantForSize(selected, selectedSize);
                  const cost = v?.pointsCost || selected.pointsCost || 0;
                  const stock = v?.stock ?? selected.stock ?? 0;
                  if (cost > 0 && stock > 0 && (userPoints ?? 0) >= cost) {
                    return "bg-[#41b6e6] text-white hover:bg-[#33a1d1]";
                  }
                  return "bg-[#c8c9c7] text-[#75787b] cursor-not-allowed";
                  })()
                }`}
                >
                {addingKey === `${findVariantForSize(selected, selectedSize)?.id || selected.id}_${selectedSize}`
                  ? "Adicionando..."
                  : (() => {
                    const v = findVariantForSize(selected, selectedSize);
                    const cost = v?.pointsCost || selected.pointsCost || 0;
                    const stock = v?.stock ?? selected.stock ?? 0;
                    if (cost <= 0) return "Indisponível";
                    if (stock <= 0) return "Sem estoque";
                    if ((userPoints ?? 0) < cost) return "Pontos insuficientes";
                    return "+ Adicionar";
                  })()}
                </button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[#75787b]">
            Estoque: {findVariantForSize(selected, selectedSize)?.stock ?? selected.stock}
              </span>
            </div>
            <button onClick={() => setDetailOpen(false)} className="w-full py-2 text-center rounded-lg border border-gray-300">
              Voltar
            </button>
          </div>
            </aside>
          </div>
        )}

        {/* DRAWER — Carrinho */}
        {cartOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
            <aside className="relative ml-auto bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col">
          <button onClick={() => setCartOpen(false)} className="self-end mb-4 text-xl">
            ✖
          </button>
          <h2 className="text-2xl font-semibold mb-4">Carrinho</h2>
          <div className="flex-1 overflow-auto space-y-4">
            {cart.length === 0 && <p className="text-gray-500">Carrinho vazio</p>}
            {cart.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
            <img src={item.imageUrl || "/logos/Simplifique.png"} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              {item.selectedSize && <p className="text-sm text-[#75787b]">Tamanho: {item.selectedSize}</p>}
              <p className="text-sm text-[#75787b]">{item.pointsCost} pts × {item.quantity}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => removeFromCart(item.key)} className="p-1 hover:bg-gray-100 rounded">–</button>
              <button onClick={() => setCart((prev) => prev.map((i) => i.key === item.key ? { ...i, quantity: i.quantity + 1 } : i))} className="p-1 hover:bg-gray-100 rounded">+</button>
            </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="flex justify-between font-semibold">Total: <span>{totalCartPts} pts</span></p>
            <button onClick={checkout} disabled={userPoints == null || userPoints < totalCartPts} className={`w-full mt-4 py-3 rounded-lg text-white font-semibold transition ${userPoints != null && userPoints >= totalCartPts ? "bg-[#43b02a] hover:bg-forest" : "bg-[#c8c9c7] cursor-not-allowed text-[#75787b]"}`}>
              Finalizar Resgate
            </button>
          </div>
            </aside>
          </div>
        )}

      {/* Notificação */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-6 py-4 shadow-lg rounded-full flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <span>{notification}</span>
          </div>
        </div>
      )}
    </div>
  );
}
