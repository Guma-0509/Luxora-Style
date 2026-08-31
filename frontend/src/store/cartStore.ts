import { create } from 'zustand';
import { Product, ProductVariant } from '../types';

export interface CartItemState {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  title: string;
  attributes: Record<string, any>;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  items: CartItemState[];
  isDrawerOpen: boolean;
  isHydrated: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  initCart: () => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

const STORAGE_KEY = 'wally_cart_items';

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isDrawerOpen: false,
  isHydrated: false,

  initCart: () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          set({ items: JSON.parse(saved), isHydrated: true });
          return;
        }
      } catch (e) {}
      set({ isHydrated: true });
    }
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),

  addItem: (product, variant, quantity = 1) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.variantId === variant.id);

    let updatedItems: CartItemState[];
    const image = variant.imageUrl || product.images?.find((img) => img.isMain)?.url || product.images?.[0]?.url;

    if (existingIndex > -1) {
      updatedItems = [...items];
      const newQty = Math.min(updatedItems[existingIndex].quantity + quantity, variant.stock);
      updatedItems[existingIndex].quantity = newQty;
    } else {
      const newItem: CartItemState = {
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        sku: variant.sku,
        title: variant.title,
        attributes: variant.attributes || {},
        price: Number(variant.price),
        imageUrl: image,
        quantity: Math.min(quantity, variant.stock),
        maxStock: variant.stock,
      };
      updatedItems = [...items, newItem];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    }

    set({ items: updatedItems, isDrawerOpen: true });
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(variantId);
      return;
    }

    const { items } = get();
    const updatedItems = items.map((item) => {
      if (item.variantId === variantId) {
        return { ...item, quantity: Math.min(quantity, item.maxStock) };
      }
      return item;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    }

    set({ items: updatedItems });
  },

  removeItem: (variantId) => {
    const { items } = get();
    const updatedItems = items.filter((i) => i.variantId !== variantId);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    }

    set({ items: updatedItems });
  },

  clearCart: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ items: [] });
  },

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
