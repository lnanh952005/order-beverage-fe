export interface CartItemOption {
  optionId: number;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  sizeId: number;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isAvailable: boolean;
  options: CartItemOption[];
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface AddToCartInput {
  productId: number;
  sizeId: number;
  quantity: number;
  optionIds?: number[];
  note?: string;
}

export interface UpdateCartItemInput {
  quantity: number;
}
