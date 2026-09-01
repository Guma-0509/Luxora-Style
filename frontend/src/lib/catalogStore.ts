'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, Category, ProductVariant } from '../types';
import { INITIAL_CATEGORIES } from './mockData';
import { api } from './api';

const PRODUCTS_STORAGE_KEY = 'luxora_products_catalog';
const CATEGORIES_STORAGE_KEY = 'luxora_categories_catalog';
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

// Helper to get stored products without ever re-injecting demo products
export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out any legacy demo products
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

// Helper to get stored categories
export function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') {
    return INITIAL_CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored categories:', e);
  }

  // Fallback to default categories if none
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
  } catch (e) {}

  return INITIAL_CATEGORIES;
}

// Save product to catalog (Add or Update)
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

  // Ensure category exists in categories list
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

  // Prepare variants
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
    // Normalize variants
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
    // Put new product AT THE VERY BEGINNING (primera plana)
    updatedProducts = [formattedProduct, ...currentProducts];
  }

  // Save to localStorage
  saveProductsCatalog(updatedProducts);

  // Attempt async API sync in background without blocking
  api.post('/products', formattedProduct).catch(() => {});
  api.post('/admin/products', formattedProduct).catch(() => {});

  return formattedProduct;
}

// Delete product from catalog permanently
export function deleteProductFromCatalog(productId: string): Product[] {
  const current = getStoredProducts();
  const updated = current.filter((p) => p.id !== productId && p.sku !== productId && p.slug !== productId);
  saveProductsCatalog(updated);

  api.delete(`/products/${productId}`).catch(() => {});
  api.delete(`/admin/products/${productId}`).catch(() => {});

  return updated;
}

// Delete all products (clean wipe)
export function deleteAllProductsFromCatalog(): Product[] {
  const updated: Product[] = [];
  saveProductsCatalog(updated);
  return updated;
}

// Delete category from catalog
export function deleteCategoryFromCatalog(categoryId: string): Category[] {
  const current = getStoredCategories();
  const updated = current.filter((c) => c.id !== categoryId && c.slug !== categoryId);
  saveCategoriesCatalog(updated);

  api.delete(`/categories/${categoryId}`).catch(() => {});
  api.delete(`/admin/categories/${categoryId}`).catch(() => {});

  return updated;
}

// Delete all categories (clean wipe)
export function deleteAllCategoriesFromCatalog(): Category[] {
  const updated: Category[] = [];
  saveCategoriesCatalog(updated);
  return updated;
}

// Toggle product status (PUBLISHED / DRAFT)
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

// Save products catalog to localStorage & broadcast event
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

// Save categories catalog to localStorage & broadcast event
export function saveCategoriesCatalog(categories: Category[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      window.dispatchEvent(new CustomEvent(CATALOG_EVENT_NAME, { detail: { type: 'categories', count: categories.length } }));
    } catch (e) {
      console.error('Error saving categories catalog:', e);
    }
  }
}

// Lookup single product by slug
export function findProductBySlug(slug: string): Product | null {
  const products = getStoredProducts();
  const found = products.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}

// Custom React Hook for live synchronization across all components
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

    // Listen for real-time catalog changes from other components/tabs
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
