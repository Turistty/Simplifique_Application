export type Variant = {
  id: number;
  size?: string;
  pointsCost: number;
  imageUrl?: string;
  stock?: number;
  sku?: string;
};

export interface Reward {
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

export interface CartItem {
  key: string;
  variantId: number;
  name: string;
  imageUrl?: string;
  pointsCost: number;
  quantity: number;
  selectedSize?: string;
}