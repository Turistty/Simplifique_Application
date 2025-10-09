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
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative ml-auto bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col">
        <button onClick={onClose} className="self-end mb-4 text-xl">
          ✖
        </button>
        <h2 className="text-2xl font-semibold mb-4">Carrinho</h2>
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
                {item.selectedSize && <p className="text-sm text-[#75787b]">Tamanho: {item.selectedSize}</p>}
                <p className="text-sm text-[#75787b]">{item.pointsCost} pts × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onRemove(item.key)} className="p-1 hover:bg-gray-100 rounded">
                  –
                </button>
                <button onClick={() => onIncrement(item.key)} className="p-1 hover:bg-gray-100 rounded">
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="flex justify-between font-semibold">
            Total: <span>{totalPoints} pts</span>
          </p>
          <button
            onClick={onCheckout}
            disabled={userPoints == null || userPoints < totalPoints || items.length === 0}
            className={`w-full mt-4 py-3 rounded-lg text-white font-semibold transition ${
              userPoints != null && userPoints >= totalPoints && items.length > 0
                ? "bg-[#43b02a] hover:bg-forest"
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
