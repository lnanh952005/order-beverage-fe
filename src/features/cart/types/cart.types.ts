export interface CartItemProduct {
  id: number;
  slug: string;
  name: string;
  imageUrl: string | null;
}

export interface CartItemSize {
  id: number;
  name: string;
  priceDelta: number;
}

export interface CartItemOption {
  id: number;
  groupName: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  id: number;
  product: CartItemProduct;
  size: CartItemSize | null;
  options: CartItemOption[];
  quantity: number;
  note: string | null;
  unitPrice: number;
  lineTotal: number;
  isAvailable: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export interface AddToCartInput {
  productId: number;
  sizeId?: number | null;
  optionIds?: number[];
  quantity: number;
  note?: string | null;
}

export interface UpdateCartItemInput {
  quantity?: number;
  sizeId?: number | null;
  optionIds?: number[];
  note?: string | null;
}
