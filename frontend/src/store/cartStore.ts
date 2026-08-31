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
  addItem: (product: any, variant: any, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

const STORAGE_KEY = 'luxora_cart_items';

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isDrawerOpen: false,
  isHydrated: false,

  initCart: () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('wally_cart_items');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            set({ items: parsed, isHydrated: true });
            return;
          }
        }
      } catch (e) {}
      set({ isHydrated: true });
    }
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),

  addItem: (product, variant, quantity = 1) => {
    if (!product) return;

    // Resolve variant safely if fallback was provided
    const safeVariant = variant || {
      id: `def-${product.id}`,
      sku: product.sku || `SKU-${product.id}`,
      title: 'Estándar',
      price: product.basePrice || 0,
      stock: 50,
      attributes: {},
    };

    const variantId = String(safeVariant.id || `var-${Date.now()}`);
    const priceNum = Number(safeVariant.price ?? product.basePrice ?? 0);
    const stockLimit = typeof safeVariant.stock === 'number' && !isNaN(safeVariant.stock)
      ? Math.max(safeVariant.stock, 0)
      : 99;

    const requestedQty = Math.max(1, Number(quantity) || 1);
    const finalQty = stockLimit > 0 ? Math.min(requestedQty, stockLimit) : requestedQty;

    const { items } = get();
    const existingIndex = items.findIndex((i) => i.variantId === variantId);

    const image =
      safeVariant.imageUrl ||
      product.images?.find((img: any) => img.isMain)?.url ||
      product.images?.[0]?.url ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400';

    let updatedItems: CartItemState[];

    if (existingIndex > -1) {
      updatedItems = [...items];
      const existingItem = updatedItems[existingIndex];
      const newTotalQty = stockLimit > 0
        ? Math.min(existingItem.quantity + finalQty, stockLimit)
        : existingItem.quantity + finalQty;

      updatedItems[existingIndex] = {
        ...existingItem,
        quantity: Math.max(1, newTotalQty),
        price: priceNum || existingItem.price,
      };
    } else {
      const newItem: CartItemState = {
        variantId,
        productId: String(product.id || ''),
        productName: product.name || 'Producto',
        productSlug: product.slug || String(product.id || ''),
        sku: safeVariant.sku || product.sku || 'SKU',
        title: safeVariant.title || 'Estándar',
        attributes: safeVariant.attributes || {},
        price: priceNum,
        imageUrl: image,
        quantity: Math.max(1, finalQty),
        maxStock: stockLimit > 0 ? stockLimit : 99,
      };
      updatedItems = [...items, newItem];
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (e) {}
    }

    set({ items: updatedItems, isDrawerOpen: true, isHydrated: true });
  },

  updateQuantity: (variantId, quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) {
      get().removeItem(variantId);
      return;
    }

    const { items } = get();
    const updatedItems = items.map((item) => {
      if (item.variantId === variantId) {
        const max = item.maxStock > 0 ? item.maxStock : 99;
        return { ...item, quantity: Math.min(qty, max) };
      }
      return item;
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (e) {}
    }

    set({ items: updatedItems });
  },

  removeItem: (variantId) => {
    const { items } = get();
    const updatedItems = items.filter((i) => i.variantId !== variantId);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (e) {}
    }

    set({ items: updatedItems });
  },

  clearCart: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
    set({ items: [] });
  },

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  },
}));
