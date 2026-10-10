export interface Category {
  id: number;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ProductSize {
  id: number;
  name: string;
  code: string;
  priceDelta: number;
  isDefault: boolean;
}

export interface Option {
  id: number;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
}

export interface OptionGroup {
  id: number;
  name: string;
  selectionType: 'single' | 'multiple';
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: Option[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  isAvailable: boolean;
  categoryId: number;
  category?: Category;
  sizes?: ProductSize[];
  optionGroups?: OptionGroup[];
}
