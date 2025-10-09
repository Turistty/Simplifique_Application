import { Reward, Variant } from "../types/reward";

const SIZE_SUFFIX_REGEX = /\s*-\s*(P|M|G|GG)\s*$/i;

export function normalizeBaseName(name: string): string {
  return (name || "").replace(SIZE_SUFFIX_REGEX, "").trim();
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const numericString = String(value ?? "").replace(/\D/g, "");
  const parsed = parseInt(numericString || "0", 10);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getFirstVariant(item: Reward): Variant | null {
  return item.variants && item.variants.length > 0 ? item.variants[0] : null;
}

export function findVariantForSize(item: Reward, size?: string): Variant | undefined {
  if (!item.variants || item.variants.length === 0) {
    return undefined;
  }

  if (!size) {
    return item.variants[0];
  }

  return item.variants.find((variant) => variant.size === size) || item.variants[0];
}

export const DEFAULT_REWARD_IMAGE = "/logos/Simplifique.png";