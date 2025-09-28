"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Reward {
  id: number;
  name: string;
  description: string;
  details: string;
  pointsCost: number;
  imageUrl: string;
  category: string;
  stock: number;
  sizes?: string[];
}

interface CartItem extends Reward {
  key: string;
  selectedSize?: string;
  quantity: number;
}

export default function RewardsPage(): React.ReactElement {
  const router = useRouter();

  // estados
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Reward | null>(null);
  const [selectedSize, setSelectedSize] = useState("");

  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addingKey, setAddingKey] = useState<string | null>(null);

  const [notification, setNotification] = useState<string>("");

    // buscar pontos reais do backend
  useEffect(() => {
    api.get("/api/pontos")
      .then((res) => {
        setUserPoints(res.data.saldo_atual);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  // mock fetch
  useEffect(() => {
    setTimeout(() => {
      setRewards([
        {
          id: 1,
          name: "Caneca Mahle Pro",
          description: "Cerâmica premium, 350ml.",
          details:
            "Revestimento antiaderente; resistente a micro-ondas e lava-louças.",
          pointsCost: 500,
          imageUrl: "/images/caneca.png",
          category: "Canecas",
          stock: 12,
        },
        {
          id: 2,
          name: "Camiseta Polo Tech",
          description: "100% algodão orgânico.",
          details:
            "Modelagem unissex; cores exclusivas; lavar à mão.",
          pointsCost: 1200,
          imageUrl: "https://tse3.mm.bing.net/th/id/OIP.TErzhUnjYeWS9iMHmKVT3AHaJf?rs=1&pid=ImgDetMain&o=7&rm=3",
          category: "Vestuário",
          sizes: ["P", "M", "G", "GG"],
          stock: 5,
        },
        {
          id: 3,
          name: "Boné UltraFit",
          description: "Tecido respirável.",
          details:
            "Velcro ajustável; forro mesh; aba curva.",
          pointsCost: 800,
          imageUrl: "/images/bone.png",
          category: "Acessórios",
          stock: 20,
        },
        {
          id: 4,
          name: "Mochila Executive",
          description: "Para notebook 15”.",
          details:
            "Compartimentos internos; alças acolchoadas; proteção RFID.",
          pointsCost: 2500,
          imageUrl: "/images/mochila.png",
          category: "Acessórios",
          sizes: ['15"', '17"'],
          stock: 3,
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  // filtrar e ordenar
  const filtered = rewards
    .filter((r) =>
      (category === "Todas" || r.category === category) &&
      r.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === "asc" ? a.pointsCost - b.pointsCost : b.pointsCost - a.pointsCost
    );

  // totais
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalCartPts = cart.reduce((sum, i) => sum + i.pointsCost * i.quantity, 0);

  // notificação
  function showNotification(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  }

  // carrinho
  function addToCart(item: Reward, size?: string) {
    if (userPoints == null) return;
    const key = `${item.id}_${size || ""}`;
    setAddingKey(key);
    setTimeout(() => {
      setCart((prev) => {
        const exist = prev.find((i) => i.key === key);
        if (exist) {
          return prev.map((i) =>
            i.key === key && userPoints >= i.pointsCost * (i.quantity + 1)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prev, { ...item, quantity: 1, selectedSize: size, key }];
      });
      setAddingKey(null);
    }, 500);
  }

  function removeFromCart(key: string) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.key === key ? { ...i, quantity: Math.max(i.quantity - 1, 0) } : i
        )
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
    } else {
      showNotification("❌ Pontos insuficientes");
    }
  }

  const categories = ["Todas", "Canecas", "Vestuário", "Acessórios"];

  return (
    <div className="min-h-screen bg-[#ededed] text-[#00205b]">
      {/* HEADER */}
      <header className="bg-[#00205b] text-white shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-6">
          {/* back + título */}
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-2xl hover:opacity-80">
              ←
            </button>
            <h1 className="text-2xl font-bold">Loja de Brindes</h1>
          </div>

          {/* busca + ordenação */}
          <div className="flex flex-1 items-center gap-4">
            <input
              type="text"
              placeholder="Buscar brinde..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border   border-gray-300 text-[#e0d4d4] focus:ring-2 focus:ring-[#41b6e6]"
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

          {/* pontos + carrinho */}
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
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
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
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(loading ? Array(4).fill(null) : filtered).map((item, idx) => {
            if (loading) {
              return (
                <div
                  key={idx}
                  className="h-96 bg-[#c6d6e3] rounded-xl animate-pulse"
                />
              );
            }

            const affordable = (userPoints ?? 0) >= item.pointsCost;
            const key = `${item.id}_${item.sizes?.[0] || ""}`;

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelected(item);
                  setDetailOpen(true);
                  setSelectedSize(item.sizes?.[0] || "");
                }}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition cursor-pointer overflow-hidden"
              >
                {/* novo container com padding */}
                <div className="p-4">
                  <div className="relative h-40 bg-[#f9f9f9] rounded-lg flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="px-4 pb-4 flex flex-col h-full">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-[#75787b] flex-1 mt-2">
                    {item.description}
                  </p>

                  {/* pontuação e estoque */}
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xl font-bold text-[#1e2a63]">
                      {item.pointsCost} pts
                    </span>
                    <span className="text-sm text-[#75787b]">
                      Estoque: {item.stock}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item, item.sizes?.[0]);
                      }}
                      disabled={!affordable || addingKey === key}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        affordable
                          ? "bg-[#41b6e6] text-white hover:bg-[#33a1d1]"
                          : "bg-[#c8c9c7] text-[#75787b] cursor-not-allowed"
                      }`}
                    >
                      {addingKey === key ? "Adicionando..." : "+ Carrinho"}
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
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDetailOpen(false)}
          />
          <aside className="relative ml-auto bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col">
            <button
              onClick={() => setDetailOpen(false)}
              className="self-end mb-4 text-xl"
            >
              ✖
            </button>
            <img
              src={selected.imageUrl}
              alt={selected.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h2 className="mt-4 text-2xl font-semibold">{selected.name}</h2>
            <p className="mt-2 text-[#75787b]">{selected.details}</p>

            {selected.sizes && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Tamanho:
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#41b6e6]"
                >
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
                  {selected.pointsCost} pts
                </span>
                <button
                  onClick={() =>
                    addToCart(
                      selected,
                      selected.sizes ? selectedSize : undefined
                    )
                  }
                  disabled={addingKey === `${selected.id}_${selectedSize}`}
                  className="px-4 py-2 bg-[#41b6e6] text-white rounded-lg hover:bg-[#33a1d1] transition"
                >
                  {addingKey === `${selected.id}_${selectedSize}`
                    ? "Adicionando..."
                    : "+ Adicionar"}
                </button>
              </div>
              <button
                onClick={() => setDetailOpen(false)}
                className="w-full py-2 text-center rounded-lg border border-gray-300"
              >
                Voltar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* DRAWER — Carrinho */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <aside className="relative ml-auto bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col">
            <button
              onClick={() => setCartOpen(false)}
              className="self-end mb-4 text-xl"
            >
              ✖
            </button>
            <h2 className="text-2xl font-semibold mb-4">Carrinho</h2>
            <div className="flex-1 overflow-auto space-y-4">
              {cart.length === 0 && (
                <p className="text-gray-500">Carrinho vazio</p>
              )}
              {cart.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.selectedSize && (
                      <p className="text-sm text-[#75787b]">
                        Tamanho: {item.selectedSize}
                      </p>
                    )}
                    <p className="text-sm text-[#75787b]">
                      {item.pointsCost} pts × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      –
                    </button>
                    <button
                      onClick={() => addToCart(item, item.selectedSize)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <p className="flex justify-between font-semibold">
                Total: <span>{totalCartPts} pts</span>
              </p>
              <button
                onClick={checkout}
                disabled={userPoints == null || userPoints < totalCartPts}
                className={`w-full mt-4 py-3 rounded-lg text-white font-semibold transition ${
                  userPoints != null && userPoints >= totalCartPts
                    ? "bg-[#43b02a] hover:bg-forest"
                    : "bg-[#c8c9c7] cursor-not-allowed text-[#75787b]"
                }`}
              >
                Finalizar Resgate
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Notificação centralizada */}
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
