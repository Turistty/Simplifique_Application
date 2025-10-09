import { Reward, Variant } from "../types/reward";
import {
  DEFAULT_REWARD_IMAGE,
  findVariantForSize,
  normalizeBaseName,
  safeNumber,
} from "./helpers";

export type BackendBrinde = {
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

  stock?: number;
  stockCurrent?: number;
  stockInitial?: number;
  Estoque?: number;
  Estoque_Inicial?: number;
  EstoqueInicial?: number;

  imageUrl?: string | null;
  URL?: string | null;

  createdAt?: string;
  Data_Cadastro?: string;
  updatedAt?: string;
  Ultima_Modificacao?: string;

  variants?: any;
};

export function normalizeBackendItem(item: BackendBrinde) {
  const id =
    typeof item.id === "number"
      ? item.id
      : Number.parseInt((item.ID || "").toString().trim() || "0", 10);

  const productId =
    typeof item.product_id === "number"
      ? item.product_id
      : Number.parseInt((item.PRODUCT_ID || "").toString().trim() || "0", 10) || id;

  const name =
    (item.name && String(item.name).trim()) ||
    (item.Nome && String(item.Nome).trim()) ||
    `Item ${id}`;

  const description =
    (item.description && String(item.description).trim()) ||
    (item.Descricao && String(item.Descricao).trim()) ||
    "";

  const details =
    (item.details && String(item.details).trim()) ||
    (item.Detalhes && String(item.Detalhes).trim()) ||
    "";

  const category =
    (item.category && String(item.category).trim()) ||
    (item.Categoria && String(item.Categoria).trim()) ||
    "Outros";

  const size =
    (item.size && String(item.size).trim()) ||
    (item.Tamanho && String(item.Tamanho).trim()) ||
    undefined;

  const pointsCost =
    typeof item.pointsCost === "number"
      ? item.pointsCost
      : /^\d+$/.test(String(item.Custo || "").trim())
      ? parseInt(String(item.Custo || "").trim(), 10)
      : 0;

  const imageUrl =
    (item.imageUrl && String(item.imageUrl).trim()) ||
    (item.URL && String(item.URL).trim()) ||
    undefined;

  const stockInitial = safeNumber(
    (item as any).stockInitial ?? item.stockInitial ?? item.Estoque_Inicial ?? 0,
    0,
  );

  const stockCurrent = safeNumber(
    (item as any).stockCurrent ?? item.stockCurrent ?? item.stock ?? stockInitial,
    stockInitial,
  );

  const sku = (item.sku || item.SKU || "").toString().trim();

  return {
    id,
    productId,
    sku,
    name,
    description,
    details,
    category,
    size,
    pointsCost,
    imageUrl,
    createdAt: item.createdAt || item.Data_Cadastro || "",
    updatedAt: item.updatedAt || item.Ultima_Modificacao || "",
    stockInitial,
    stockCurrent,
  };
}

function isProductShape(obj: any): boolean {
  return !!obj && (obj.product_id !== undefined || obj.pointsCost !== undefined || Array.isArray(obj.variants));
}

export function toReward(item: any): Reward {
  if (isProductShape(item)) {
    const productId = item.product_id ?? item.id ?? 0;
    const name = item.name ?? item.Nome ?? "";
    const description = item.description ?? item.Descricao ?? "";
    const details = item.details ?? item.Detalhes ?? "";
    const category = item.category ?? item.Categoria ?? "Outros";
    const imageUrl =
      item.imageUrl ??
      item.URL ??
      (Array.isArray(item.variants) && item.variants[0]?.imageUrl) ??
      DEFAULT_REWARD_IMAGE;
    const pointsCost = safeNumber(item.pointsCost ?? item.custo ?? 0, 0);
    const stock = safeNumber(item.stock ?? item.stockCurrent ?? item.stockCurrent ?? 0, 0);

    const variantsRaw = Array.isArray(item.variants) ? item.variants : [];
    const variants: Variant[] = variantsRaw.map((variant: any) => ({
      id: variant.id ?? variant.ID ?? 0,
      size: variant.size ?? variant.Tamanho ?? undefined,
      pointsCost: safeNumber(variant.pointsCost ?? variant.Custo ?? 0, 0),
      imageUrl: variant.imageUrl ?? variant.URL ?? undefined,
      stock: safeNumber(variant.stockCurrent ?? variant.stockInitial ?? variant.stock ?? 0, 0),
      sku: variant.sku ?? variant.SKU ?? undefined,
    }));

    const sizes = Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean))) as string[] | undefined;

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

  const norm = normalizeBackendItem(item as BackendBrinde);

  return {
    id: norm.productId || norm.id,
    name: normalizeBaseName(norm.name),
    description: norm.description,
    details: norm.details,
    category: norm.category,
    imageUrl: norm.imageUrl ?? DEFAULT_REWARD_IMAGE,
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

export function getVariantKey(item: Reward, size?: string): string {
  const variant = findVariantForSize(item, size);
  return `${variant?.id ?? item.id}_${size || ""}`;
}

export function mergeRewardsByGroup(items: Reward[]): Reward[] {
  const groups = new Map<string, Reward>();

  for (const reward of items) {
    const key = `${reward.name}::${reward.category}`;

    if (!groups.has(key)) {
      groups.set(key, { ...reward });
      continue;
    }

    const grouped = groups.get(key)!;

    grouped.variants = [...grouped.variants, ...reward.variants];
    grouped.sizes = Array.from(new Set([...(grouped.sizes || []), ...(reward.sizes || [])]));
    grouped.stock = (grouped.stock || 0) + (reward.stock || 0);
    grouped.pointsCost = Math.min(grouped.pointsCost || Infinity, reward.pointsCost || Infinity) || 0;
  }

  return Array.from(groups.values());
}