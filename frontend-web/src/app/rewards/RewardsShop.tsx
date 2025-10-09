"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

import CartDrawer from "./components/CartDrawer";
import RewardCard from "./components/RewardCard";
import RewardDetailDrawer from "./components/RewardDetailDrawer";
import { useRewards } from "./hooks/useRewards";
import { CartItem, Reward } from "./types/reward";
import { findVariantForSize, getFirstVariant } from "./utils/helpers";
import { getVariantKey } from "./utils/normalizeBackendItem";

export default function RewardsShop(): React.ReactElement {
  const router = useRouter();
  const { rewards, loading, error } = useRewards();

  const [userPoints, setUserPoints] = useState<number | null>(null);
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
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (selected) {
      const firstVariant = getFirstVariant(selected);
      setSelectedSize(selected.sizes?.[0] || firstVariant?.size || "");
    } else {
      setSelectedSize("");
    }
  }, [selected]);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(rewards.map((reward) => reward.category)));
    return ["Todas", ...dynamicCategories];
  }, [rewards]);

  const filteredRewards = useMemo(() => {
    return rewards
      .filter(
        (reward) =>
          (category === "Todas" || reward.category === category) &&
          reward.name.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => (sort === "asc" ? a.pointsCost - b.pointsCost : b.pointsCost - a.pointsCost));
  }, [rewards, category, search, sort]);

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalCartPoints = useMemo(
    () => cart.reduce((sum, item) => sum + item.pointsCost * item.quantity, 0),
    [cart],
  );

  const rewardByVariant = useMemo(() => {
    const map = new Map<number, Reward>();
    rewards.forEach((reward) => {
      reward.variants.forEach((variant) => {
        map.set(variant.id, reward);
      });
    });
    return map;
  }, [rewards]);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => setNotification(""), 3000);
  }, []);

  const handleAddToCart = useCallback(
    (item: Reward, size?: string) => {
      if (userPoints == null) {
        showNotification("❌ Usuário não autenticado ou pontos indisponíveis.");
        return;
      }

      const variant = findVariantForSize(item, size);
      if (!variant) {
        showNotification("❌ Variação não encontrada.");
        return;
      }

      if ((variant.pointsCost ?? 0) <= 0) {
        showNotification("❌ Brinde indisponível para resgate (custo não definido).");
        return;
      }

      if ((variant.stock ?? 0) <= 0) {
        showNotification("❌ Sem estoque disponível para essa variação.");
        return;
      }

      if (userPoints < (variant.pointsCost ?? 0)) {
        showNotification("❌ Pontos insuficientes para resgatar este brinde.");
        return;
      }

      const key = getVariantKey(item, size);
      setAddingKey(key);

      setTimeout(() => {
        setCart((prev) => {
          const existing = prev.find((cartItem) => cartItem.key === key);
          if (existing) {
            const nextQuantity = existing.quantity + 1;
            if (
              userPoints >= existing.pointsCost * nextQuantity &&
              nextQuantity <= (variant.stock ?? Infinity)
            ) {
              showNotification("✅ Quantidade aumentada com sucesso!");
              return prev.map((cartItem) =>
                cartItem.key === key ? { ...cartItem, quantity: nextQuantity } : cartItem,
              );
            }

            showNotification("❌ Pontos insuficientes ou estoque insuficiente para aumentar a quantidade.");
            return prev;
          }

          const newItem: CartItem = {
            key,
            variantId: variant.id,
            name: item.name,
            imageUrl: variant.imageUrl || item.imageUrl,
            pointsCost: variant.pointsCost,
            quantity: 1,
            selectedSize: size,
          };

          showNotification("✅ Brinde adicionado com sucesso!");
          return [...prev, newItem];
        });
        setAddingKey(null);
      }, 250);
    },
    [showNotification, userPoints],
  );

  const handleRemoveFromCart = useCallback((key: string) => {
    setCart((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, quantity: Math.max(item.quantity - 1, 0) } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const handleIncrementInCart = useCallback(
    (key: string) => {
      const item = cart.find((cartItem) => cartItem.key === key);
      if (!item) {
        return;
      }

      const reward = rewardByVariant.get(item.variantId);
      if (!reward) {
        showNotification("❌ Não foi possível localizar o brinde para atualizar o carrinho.");
        return;
      }

      handleAddToCart(reward, item.selectedSize);
    },
    [cart, rewardByVariant, handleAddToCart, showNotification],
  );


    const handleClearCart = useCallback(() => {
      setCart([]); // limpa o carrinho completamente
    }, []);


  const handleCheckout = useCallback(() => {
    if (!window.confirm(`Confirmar resgate de ${totalCartPoints} pts?`)) {
      return;
    }

    if (userPoints !== null && userPoints >= totalCartPoints) {
      setUserPoints((points) => (points ?? 0) - totalCartPoints);
      setCart([]);
      setCartOpen(false);
      showNotification("✅ Seu pedido entrou em processamento");
      // TODO: POST /api/movimentacoes/resgate com userId e items
    } else {
      showNotification("❌ Pontos insuficientes");
    }
  }, [showNotification, totalCartPoints, userPoints]);

  const cardsToRender: (Reward | null)[] = loading ? Array.from({ length: 4 }, () => null) : filteredRewards;

  return (
    <div className="min-h-screen bg-[#ededed] text-[#00205b]">
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
              onChange={(event) => setSearch(event.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-[#c3c7cd] focus:ring-2 focus:ring-[#41b6e6]"
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "asc" | "desc")}
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

      {error && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-[#ff3b30]/10 text-[#a30000] px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cardsToRender.map((reward, index) => (
            <RewardCard
              key={reward ? reward.id : `placeholder-${index}`}
              reward={reward ?? undefined}
              loading={loading}
              userPoints={userPoints}
              onOpenDetail={(item) => {
                setSelected(item);
                setDetailOpen(true);
              }}
              onAddToCart={handleAddToCart}
              addingKey={addingKey}
            />
          ))}
        </div>
      </main>

      <RewardDetailDrawer
        open={detailOpen}
        reward={selected}
        selectedSize={selectedSize}
        onSizeChange={setSelectedSize}
        onClose={() => setDetailOpen(false)}
        onAddToCart={handleAddToCart}
        addingKey={addingKey}
        userPoints={userPoints}
      />

      <CartDrawer
        open={cartOpen}
        items={cart}
        totalPoints={totalCartPoints}
        userPoints={userPoints}
        onClose={() => setCartOpen(false)}
        onRemove={handleRemoveFromCart}
        onIncrement={handleIncrementInCart}
        onCheckout={handleCheckout}
        onClearCart={handleClearCart}
      />

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

