'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, Category, ProductVariant } from '../types';
import { INITIAL_CATEGORIES } from './mockData';
import { api } from './api';

const PRODUCTS_STORAGE_KEY = 'luxora_products_catalog';
const CATEGORIES_STORAGE_KEY = 'luxora_categories_catalog';
const ORDERS_STORAGE_KEY = 'luxora_orders_catalog';
const COUPONS_STORAGE_KEY = 'luxora_coupons_catalog';
const AUDIT_LOGS_STORAGE_KEY = 'luxora_audit_logs_catalog';
const CATALOG_EVENT_NAME = 'luxora_catalog_updated';

// Known legacy demo products to permanently filter out from local cache
const DEMO_PRODUCT_IDS = ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8'];
const DEMO_PRODUCT_SKUS = [
  'NK-AJ1-OG',
  'AD-UB-LIGHT',
  'DIOR-SV-100',
  'TS-OVR-HVY',
  'JNS-SLIM-511',
  'RLJ-CRN-BLK',
  'NE-NY-5950',
  'BLU-CHN-100',
];

// ----------------------------------------------------
// 1. PRODUCTS STORE
// ----------------------------------------------------
export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out any legacy demo products automatically
        const filtered = parsed.filter(
          (p: Product) => !DEMO_PRODUCT_IDS.includes(p.id) && !DEMO_PRODUCT_SKUS.includes(p.sku)
        );
        if (filtered.length !== parsed.length) {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
        }
        return filtered;
      }
    }
  } catch (e) {
    console.error('Error reading stored products:', e);
  }

  return [];
}

export function saveProductsCatalog(products: Product[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent(CATALOG_EVENT_NAME, { detail: { type: 'products', count: products.length } }));
    } catch (e) {
      console.error('Error saving products catalog:', e);
    }
  }
}

export function saveProductToCatalog(productData: Partial<Product> & { categoryName?: string; brandName?: string; stock?: number; imageUrl?: string }): Product {
  const currentProducts = getStoredProducts();
  const currentCategories = getStoredCategories();

  const id = productData.id || `prod-${Date.now()}`;
  const name = productData.name?.trim() || 'Nuevo Producto Luxora';
  const slug = productData.slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  const sku = productData.sku?.trim().toUpperCase() || `LX-${Date.now().toString().slice(-4)}`;
  const basePrice = Number(productData.basePrice || 0);
  const compareAtPrice = productData.compareAtPrice ? Number(productData.compareAtPrice) : null;
  const status = (productData.status as any) || 'PUBLISHED';
  const categoryName = productData.categoryName || productData.category?.name || 'General';
  const categorySlug = productData.category?.slug || categoryName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  const brandName = productData.brandName || productData.brand?.name || 'Luxora Selection';

  let matchingCategory = currentCategories.find(
    (c) => c.slug === categorySlug || c.name.toLowerCase() === categoryName.toLowerCase()
  );
  if (!matchingCategory) {
    matchingCategory = {
      id: `cat-${Date.now()}`,
      name: categoryName,
      slug: categorySlug,
      _count: { products: 1 },
    };
    saveCategoriesCatalog([matchingCategory, ...currentCategories]);
  }

  const primaryImage =
    productData.imageUrl ||
    productData.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600';

  const images = [
    {
      id: `img-${Date.now()}`,
      url: primaryImage,
      isMain: true,
      displayOrder: 0,
    },
  ];

  let variants: ProductVariant[] = productData.variants || [];
  if (variants.length === 0) {
    const stockVal = typeof productData.stock === 'number' ? productData.stock : 30;
    variants = [
      {
        id: `var-${Date.now()}-std`,
        sku: `${sku}-STD`,
        title: 'Estándar',
        price: basePrice,
        stock: stockVal,
        attributes: { Opción: 'Estándar' },
      },
    ];
  } else {
    variants = variants.map((v, idx) => ({
      ...v,
      id: v.id || `var-${Date.now()}-${idx}`,
      sku: v.sku || `${sku}-${idx + 1}`,
      price: typeof v.price === 'number' ? v.price : basePrice,
      stock: typeof v.stock === 'number' ? v.stock : 25,
      attributes: v.attributes || {},
    }));
  }

  const formattedProduct: Product = {
    id,
    name,
    slug,
    sku,
    basePrice,
    compareAtPrice,
    status,
    description: productData.description || `Artículo exclusivo ${name} de la colección oficial Luxora Style. Calidad garantizada y materiales premium.`,
    shortDescription: productData.shortDescription || `${name} - Colección Oficial Luxora Style`,
    category: matchingCategory,
    categoryId: matchingCategory.id,
    brand: { id: `brand-${Date.now()}`, name: brandName, slug: brandName.toLowerCase().replace(/\s+/g, '-') },
    brandId: `brand-${Date.now()}`,
    images: images as any,
    variants,
    specifications: productData.specifications || [
      { name: 'Marca', value: brandName },
      { name: 'Categoría', value: categoryName },
      { name: 'Condición', value: '100% Nuevo Original' },
      { name: 'Garantía', value: '30 Días de Garantía Oficial' },
    ],
    reviewsSummary: {
      averageRating: 5.0,
      totalReviews: 14,
    },
    createdAt: productData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = currentProducts.findIndex((p) => p.id === id || p.sku === sku);
  let updatedProducts: Product[];

  if (existingIndex >= 0) {
    updatedProducts = [...currentProducts];
    updatedProducts[existingIndex] = formattedProduct;
  } else {
    updatedProducts = [formattedProduct, ...currentProducts];
  }

  saveProductsCatalog(updatedProducts);

  api.post('/products', formattedProduct).catch(() => {});
  api.post('/admin/products', formattedProduct).catch(() => {});

  return formattedProduct;
}

export function deleteProductFromCatalog(productId: string): Product[] {
  const current = getStoredProducts();
  const updated = current.filter((p) => p.id !== productId && p.sku !== productId && p.slug !== productId);
  saveProductsCatalog(updated);

  api.delete(`/products/${productId}`).catch(() => {});
  api.delete(`/admin/products/${productId}`).catch(() => {});

  return updated;
}

export function deleteAllProductsFromCatalog(): Product[] {
  const updated: Product[] = [];
  saveProductsCatalog(updated);
  return updated;
}

export function toggleProductStatusInCatalog(productId: string): Product[] {
  const current = getStoredProducts();
  const updated = current.map((p) => {
    if (p.id === productId) {
      const nextStatus = p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      return { ...p, status: nextStatus as any };
    }
    return p;
  });
  saveProductsCatalog(updated);
  return updated;
}

// ----------------------------------------------------
// 2. CATEGORIES STORE
// ----------------------------------------------------
export function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed; // Returns [] cleanly without falling back to demo categories
      }
    }

    // Only seed once on initial browser visit
    const isInit = localStorage.getItem('luxora_categories_initialized');
    if (!isInit) {
      localStorage.setItem('luxora_categories_initialized', 'true');
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
  } catch (e) {
    console.error('Error reading stored categories:', e);
  }

  return [];
}

export function saveCategoriesCatalog(categories: Category[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('luxora_categories_initialized', 'true');
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      window.dispatchEvent(new CustomEvent(CATALOG_EVENT_NAME, { detail: { type: 'categories', count: categories.length } }));
    } catch (e) {
      console.error('Error saving categories catalog:', e);
    }
  }
}

export function deleteCategoryFromCatalog(categoryId: string): Category[] {
  const current = getStoredCategories();
  const updated = current.filter((c) => c.id !== categoryId && c.slug !== categoryId);
  saveCategoriesCatalog(updated);

  api.delete(`/categories/${categoryId}`).catch(() => {});
  api.delete(`/admin/categories/${categoryId}`).catch(() => {});

  return updated;
}

export function deleteAllCategoriesFromCatalog(): Category[] {
  const updated: Category[] = [];
  saveCategoriesCatalog(updated);
  return updated;
}

// ----------------------------------------------------
// 3. ORDERS STORE
// ----------------------------------------------------
export function getStoredOrders(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveOrdersStore(orders: any[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent(CATALOG_EVENT_NAME, { detail: { type: 'orders', count: orders.length } }));
    } catch (e) {}
  }
}

export function deleteAllOrdersStore(): any[] {
  const updated: any[] = [];
  saveOrdersStore(updated);
  return updated;
}

// ----------------------------------------------------
// 4. COUPONS STORE
// ----------------------------------------------------
export function getStoredCoupons(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveCouponsStore(coupons: any[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
      window.dispatchEvent(new CustomEvent(CATALOG_EVENT_NAME, { detail: { type: 'coupons', count: coupons.length } }));
    } catch (e) {}
  }
}

export function deleteAllCouponsStore(): any[] {
  const updated: any[] = [];
  saveCouponsStore(updated);
  return updated;
}

// ----------------------------------------------------
// 5. AUDIT LOGS STORE
// ----------------------------------------------------
export function getStoredAuditLogs(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAuditLogsStore(logs: any[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent(CATALOG_EVENT_NAME, { detail: { type: 'logs', count: logs.length } }));
    } catch (e) {}
  }
}

export function deleteAllAuditLogsStore(): any[] {
  const updated: any[] = [];
  saveAuditLogsStore(updated);
  return updated;
}

// ----------------------------------------------------
// 6. GENERAL UTILS & REACT HOOK
// ----------------------------------------------------
export function findProductBySlug(slug: string): Product | null {
  const products = getStoredProducts();
  const found = products.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    const localProds = getStoredProducts();
    const localCats = getStoredCategories();
    setProducts(localProds);
    setCategories(localCats);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener(CATALOG_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(CATALOG_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  const addOrUpdateProduct = useCallback((productData: any) => {
    const saved = saveProductToCatalog(productData);
    loadData();
    return saved;
  }, [loadData]);

  const removeProduct = useCallback((productId: string) => {
    const updated = deleteProductFromCatalog(productId);
    setProducts(updated);
    return updated;
  }, []);

  const removeCategory = useCallback((categoryId: string) => {
    const updated = deleteCategoryFromCatalog(categoryId);
    setCategories(updated);
    return updated;
  }, []);

  const clearAllProducts = useCallback(() => {
    const updated = deleteAllProductsFromCatalog();
    setProducts(updated);
    return updated;
  }, []);

  const clearAllCategories = useCallback(() => {
    const updated = deleteAllCategoriesFromCatalog();
    setCategories(updated);
    return updated;
  }, []);

  const toggleStatus = useCallback((productId: string) => {
    const updated = toggleProductStatusInCatalog(productId);
    setProducts(updated);
    return updated;
  }, []);

  return {
    products,
    categories,
    loading,
    addOrUpdateProduct,
    removeProduct,
    removeCategory,
    clearAllProducts,
    clearAllCategories,
    toggleStatus,
    refreshCatalog: loadData,
  };
}
