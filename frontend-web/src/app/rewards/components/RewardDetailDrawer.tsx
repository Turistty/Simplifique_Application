import React from "react";
import { Reward } from "../types/reward";
import { DEFAULT_REWARD_IMAGE, findVariantForSize } from "../utils/helpers";
import { getVariantKey } from "../utils/normalizeBackendItem";

interface RewardDetailDrawerProps {
  open: boolean;
  reward: Reward | null;
  selectedSize: string;
  onSizeChange: (value: string) => void;
  onClose: () => void;
  onAddToCart: (reward: Reward, size?: string) => void;
  addingKey: string | null;
  userPoints: number | null;
}

const RewardDetailDrawer: React.FC<RewardDetailDrawerProps> = ({
  open,
  reward,
  selectedSize,
  onSizeChange,
  onClose,
  onAddToCart,
  addingKey,
  userPoints,
}) => {
  if (!open || !reward) return null;

  const currentVariant = findVariantForSize(reward, reward.sizes?.length ? selectedSize : undefined);
  const cost = currentVariant?.pointsCost || reward.pointsCost || 0;
  const stock = currentVariant?.stock ?? reward.stock ?? 0;
  const variantKey = getVariantKey(reward, reward.sizes?.length ? selectedSize : undefined);

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Fundo escurecido */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Painel lateral */}
      <aside className="relative ml-auto bg-white w-full max-w-2xl h-full flex flex-col">
        {/* Conteúdo principal */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1e2a63]">{reward.name}</h2>
            <button onClick={onClose} className="text-xl hover:text-red-500 transition">
              ✖
            </button>
          </div>

          <div className="rounded-xl bg-[#ffffff] flex items-center justify-center h-100 mb-6">
            <img
              src={currentVariant?.imageUrl || reward.imageUrl || DEFAULT_REWARD_IMAGE}
              alt={reward.name}
              className="max-h-100 object-contain"
            />
          </div>

          <div className="space-y-6 text-[#1e2a63]">
            <div>
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p className="text-sm text-[#75787b] whitespace-pre-line">
                {reward.description || "Sem descrição."}
              </p>
            </div>

            {reward.details && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Detalhes</h3>
                <p className="text-sm text-[#75787b] whitespace-pre-line">{reward.details}</p>
              </div>
            )}

            {reward.sizes?.length ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">Selecione o tamanho</h3>
                <select
                  value={selectedSize}
                  onChange={(event) => onSizeChange(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#41b6e6]"
                >
                  {reward.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>

        {/* Rodapé fixo (ações) */}
        <div className="border-t border-gray-200 p-6 bg-[#f5f7fa]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-[#1e2a63]">
              {cost > 0 ? `${cost} pts` : "Indisponível"}
            </span>
            <button
              onClick={() => onAddToCart(reward, reward.sizes?.length ? selectedSize : undefined)}
              disabled={
                addingKey === variantKey ||
                cost <= 0 ||
                stock <= 0 ||
                (userPoints ?? 0) < cost
              }
              className={`px-15 py-2 rounded-lg font-semibold transition ${
                cost > 0 && stock > 0 && (userPoints ?? 0) >= cost
                  ? "bg-[#41b6e6] text-white hover:bg-[#33a1d1]"
                  : "bg-[#c8c9c7] text-[#75787b] cursor-not-allowed"
              }`}
            >
              {addingKey === variantKey
                ? "Adicionando..."
                : cost <= 0
                ? "Indisponível"
                : stock <= 0
                ? "Sem estoque"
                : (userPoints ?? 0) < cost
                ? "Pontos insuficientes"
                : "+ Adicionar"}
            </button>
          </div>

          <div className="flex justify-between items-center mb-4 text-sm text-[#75787b]">
            <span>Estoque: {stock}</span>
            {reward.sizes?.length && selectedSize ? <span>Tamanho: {selectedSize}</span> : null}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 text-center rounded-lg border border-gray-500 hover:bg-gray-300 transition"
          >
            Voltar
          </button>
        </div>
      </aside>
    </div>
  );
};

export default RewardDetailDrawer;
