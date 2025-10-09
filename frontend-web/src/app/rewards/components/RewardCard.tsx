import React from "react";

import { Reward } from "../types/reward";
import { DEFAULT_REWARD_IMAGE, findVariantForSize, getFirstVariant } from "../utils/helpers";
import { getVariantKey } from "../utils/normalizeBackendItem";

interface RewardCardProps {
  reward?: Reward;
  loading?: boolean;
  userPoints: number | null;
  onOpenDetail: (reward: Reward) => void;
  onAddToCart: (reward: Reward, size?: string) => void;
  addingKey: string | null;
}

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  loading,
  userPoints,
  onOpenDetail,
  onAddToCart,
  addingKey,
}) => {
  if (loading || !reward) {
    return <div className="h-80 bg-[#c6d6e3] rounded-xl animate-pulse" />;
  }

  const firstVariant = getFirstVariant(reward);
  const defaultSize = reward.sizes?.[0] || firstVariant?.size || "";
  const currentVariant = findVariantForSize(reward, defaultSize);
  const effectiveCost = reward.pointsCost || currentVariant?.pointsCost || 0;
  const affordable = (userPoints ?? 0) >= effectiveCost;
  const stock = currentVariant?.stock ?? reward.stock ?? 0;
  const variantKey = getVariantKey(reward, reward.sizes?.length ? defaultSize : undefined);

  return (
    <div
      onClick={() => onOpenDetail(reward)}
      className={`flex flex-col bg-white rounded-xl shadow-lg overflow-hidden transition transform hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
        affordable ? "border border-transparent" : "border border-[#c8c9c7]"
      }`}
    >
      <div className="relative h-48 bg-[#f5f7fa] flex items-center justify-center">
        <img
          src={reward.imageUrl || DEFAULT_REWARD_IMAGE}
          alt={reward.name}
          className="max-h-40 object-contain"
        />
      </div>

      <div className="flex flex-col flex-1 p-5 gap-4">
        <div>
          <span className="inline-block text-xs uppercase tracking-wider text-[#75787b] mb-2">
            {reward.category}
          </span>
          <h2 className="text-lg font-semibold text-[#1e2a63] line-clamp-2">{reward.name}</h2>
          <p className="mt-2 text-sm text-[#75787b] line-clamp-2">{reward.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#75787b]">A partir de</p>
            <p className="text-xl font-bold text-[#1e2a63]">{effectiveCost} pts</p>
          </div>
          {reward.sizes?.length ? (
            <span className="text-xs text-[#75787b]">{reward.sizes.length} tamanhos</span>
          ) : (
            <span className="text-xs text-[#75787b]">Estoque: {stock}</span>
          )}
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart(reward, reward.sizes?.length ? defaultSize : undefined);
          }}
          disabled={
            addingKey === variantKey ||
            effectiveCost <= 0 ||
            stock <= 0 ||
            (userPoints ?? 0) < effectiveCost
          }
          className={`mt-auto px-4 py-2 rounded-lg font-semibold transition ${
            effectiveCost > 0 && stock > 0 && (userPoints ?? 0) >= effectiveCost
              ? "bg-[#41b6e6] text-white hover:bg-[#33a1d1]"
              : "bg-[#c8c9c7] text-[#75787b] cursor-not-allowed"
          }`}
        >
          {addingKey === variantKey
            ? "Adicionando..."
            : effectiveCost <= 0
            ? "Indisponível"
            : stock <= 0
            ? "Sem estoque"
            : (userPoints ?? 0) < effectiveCost
            ? "Pontos insuficientes"
            : "+ Adicionar"}
        </button>
      </div>
    </div>
  );
};

export default RewardCard;
