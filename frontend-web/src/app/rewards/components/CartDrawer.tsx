import React from "react";
import { CartItem } from "../types/reward";
import { DEFAULT_REWARD_IMAGE } from "../utils/helpers";

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  totalPoints: number;
  userPoints: number | null;
  onClose: () => void;
  onRemove: (key: string) => void;
  onIncrement: (key: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  totalPoints,
  userPoints,
  onClose,
  onRemove,
  onIncrement,
  onCheckout,
  onClearCart,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Fundo escurecido */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Painel lateral */}
      <aside className="relative ml-auto bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col">
        {/* Cabeçalho */}
        <button onClick={onClose} className="self-end mb-4 text-xl hover:text-red-500 transition">
          ✖
        </button>
        <h2 className="text-2xl font-semibold mb-4">Carrinho</h2>

        {/* Itens */}
        <div className="flex-1 overflow-auto space-y-4">
          {items.length === 0 && <p className="text-gray-500">Carrinho vazio</p>}
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <img
                src={item.imageUrl || DEFAULT_REWARD_IMAGE}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                {item.selectedSize && (
                  <p className="text-sm text-[#75787b]">Tamanho: {item.selectedSize}</p>
                )}
                <p className="text-sm text-[#75787b]">
                  {item.pointsCost} pts × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onRemove(item.key)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  –
                </button>
                <button
                  onClick={() => onIncrement(item.key)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div className="mt-6 space-y-3">
          <p className="flex justify-between font-semibold">
            Total: <span>{totalPoints} pts</span>
          </p>

          {/* 🔴 Botão de Esvaziar Carrinho com hover destacado */}
          <button
            onClick={onClearCart}
            disabled={items.length === 0}
            className={`w-full py-2 rounded-lg border font-semibold transition-colors duration-200 ${
              items.length > 0
                ? "border-red-500 text-red-600 hover:bg-red-500 hover:text-white hover:shadow-md"
                : "border-gray-300 text-gray-400 cursor-not-allowed"
            }`}
          >
            Esvaziar Carrinho
          </button>

          {/* 🟢 Botão de Finalizar Resgate */}
          <button
            onClick={onCheckout}
            disabled={userPoints == null || userPoints < totalPoints || items.length === 0}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-colors duration-200 ${
              userPoints != null && userPoints >= totalPoints && items.length > 0
                ? "bg-[#43b02a] hover:bg-green-600"
                : "bg-[#c8c9c7] cursor-not-allowed text-[#75787b]"
            }`}
          >
            Finalizar Resgate
          </button>
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
