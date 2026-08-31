'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { Product, Category, ProductVariant } from '../types';
import { TreintaHeader } from '../components/storefront/TreintaHeader';
import { TreintaCategoryPills } from '../components/storefront/TreintaCategoryPills';
import { TreintaProductCard } from '../components/storefront/TreintaProductCard';
import { TreintaLiveCart } from '../components/storefront/TreintaLiveCart';
import { TreintaVariantModal } from '../components/storefront/TreintaVariantModal';
import { useCartStore } from '../store/cartStore';
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Boxes,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Tenis & Sneakers', slug: 'tenis-sneakers' },
  { id: 'cat-2', name: 'Perfumes & Fragancias', slug: 'perfumes-fragancias' },
  { id: 'cat-3', name: 'T-Shirts & Camisetas', slug: 't-shirts-camisetas' },
  { id: 'cat-4', name: 'Pantalones & Jeans', slug: 'pantalones-jeans' },
  { id: 'cat-5', name: 'Relojes & Accesorios', slug: 'relojes-accesorios' },
  { id: 'cat-6', name: 'Gorras & Caps', slug: 'gorras-caps' },
  { id: 'cat-7', name: 'Camisas & Polos', slug: 'camisas-polos' },
  { id: 'cat-8', name: 'Chaquetas & Hoodies', slug: 'chaquetas-hoodies' },
];

const INITIAL_PRODUCTS: any[] = [
  {
    id: 'prod-1',
    name: 'Nike Air Jordan 1 Retro High OG',
    slug: 'nike-air-jordan-1-retro-high-og',
    sku: 'NK-AJ1-OG',
    basePrice: 180.0,
    compareAtPrice: 210.0,
    status: 'PUBLISHED',
    category: { id: 'cat-1', name: 'Tenis & Sneakers', slug: 'tenis-sneakers' },
    brand: { id: 'b-1', name: 'Nike', slug: 'nike' },
    images: [{ id: 'img-1', url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600', isMain: true, displayOrder: 0 }],
    variants: [
      { id: 'v1', sku: 'NK-AJ1-CHI-40', title: 'Chicago Red / Talla 40', price: 180.0, stock: 35 },
      { id: 'v2', sku: 'NK-AJ1-CHI-42', title: 'Chicago Red / Talla 42', price: 180.0, stock: 24 },
      { id: 'v3', sku: 'NK-AJ1-BLK-42', title: 'Shadow Black / Talla 42', price: 185.0, stock: 18 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Adidas Ultraboost Light Running',
    slug: 'adidas-ultraboost-light-running',
    sku: 'AD-UB-LIGHT',
    basePrice: 149.99,
    compareAtPrice: 190.0,
    status: 'PUBLISHED',
    category: { id: 'cat-1', name: 'Tenis & Sneakers', slug: 'tenis-sneakers' },
    brand: { id: 'b-2', name: 'Adidas', slug: 'adidas' },
    images: [{ id: 'img-2', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', isMain: true, displayOrder: 0 }],
    variants: [
      { id: 'v4', sku: 'AD-UB-WHT-41', title: 'Triple White / Talla 41', price: 149.99, stock: 40 },
    ],
  },
  {
    id: 'prod-3',
    name: 'Dior Sauvage Eau de Parfum 100ml',
    slug: 'dior-sauvage-eau-de-parfum-100ml',
    sku: 'DIOR-SV-100',
    basePrice: 135.0,
    compareAtPrice: 160.0,
    status: 'PUBLISHED',
    category: { id: 'cat-2', name: 'Perfumes & Fragancias', slug: 'perfumes-fragancias' },
    brand: { id: 'b-3', name: 'Dior', slug: 'dior' },
    images: [{ id: 'img-3', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600', isMain: true, displayOrder: 0 }],
    variants: [
      { id: 'v5', sku: 'DIOR-SV-EDP-100ML', title: 'Frasco 100ml EDP', price: 135.0, stock: 45 },
      { id: 'v6', sku: 'DIOR-SV-EDP-200ML', title: 'Frasco 200ml Jumbo', price: 195.0, stock: 20 },
    ],
  },
  {
    id: 'prod-4',
    name: 'Camiseta Casual Heavy Cotton Oversize',
    slug: 'camiseta-casual-heavy-cotton-oversize',
    sku: 'TS-OVR-HVY',
    basePrice: 22.5,
    compareAtPrice: 35.0,
    status: 'PUBLISHED',
    category: { id: 'cat-3', name: 'T-Shirts & Camisetas', slug: 't-shirts-camisetas' },
    brand: { id: 'b-4', name: 'Zara Man', slug: 'zara-man' },
    images: [{ id: 'img-4', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600', isMain: true, displayOrder: 0 }],
    variants: [
      { id: 'v7', sku: 'TS-OVR-WHT-M', title: 'Blanco Crudo / Talla M', price: 22.5, stock: 65 },
      { id: 'v8', sku: 'TS-OVR-BLK-L', title: 'Negro Lavado / Talla L', price: 22.5, stock: 38 },
    ],
  },
  {
    id: 'prod-5',
    name: 'Jeans Ajustados Slim Fit Denim Stretch',
    slug: 'jeans-ajustados-slim-fit-denim-stretch',
    sku: 'JNS-SLIM-511',
    basePrice: 39.99,
    compareAtPrice: 59.99,
    status: 'PUBLISHED',
    category: { id: 'cat-4', name: 'Pantalones & Jeans', slug: 'pantalones-jeans' },
    brand: { id: 'b-5', name: 'Levi\'s', slug: 'levis' },
    images: [{ id: 'img-5', url: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=600', isMain: true, displayOrder: 0 }],
    variants: [
      { id: 'v9', sku: 'JNS-SLIM-32', title: 'Azul Medio / Talla 32', price: 39.99, stock: 48 },
    ],
  },
  {
    id: 'prod-6',
    name: 'Reloj Cronógrafo Acero Inoxidable Black Dial',
    slug: 'reloj-cronografo-acero-inoxidable-black-dial',
    sku: 'RLJ-CRN-BLK',
    basePrice: 89.0,
    compareAtPrice: 130.0,
    status: 'PUBLISHED',
    category: { id: 'cat-5', name: 'Relojes & Accesorios', slug: 'relojes-accesorios' },
    brand: { id: 'b-6', name: 'Casio / G-Shock', slug: 'casio-g-shock' },
    images: [{ id: 'img-6', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600', isMain: true, displayOrder: 0 }],
    variants: [
      { id: 'v10', sku: 'RLJ-SLV-BLK', title: 'Plata con Esfera Negra', price: 89.0, stock: 25 },
    ],
  },
  {
    id: 'prod-7',
    name: 'Gorra New Era NY Yankees 59FIFTY Fitted',
    slug: 'gorra-new-era-ny-yankees-59fifty-fitted',
    sku: 'NE-NY-5950',
    basePrice: 38.0,
    compareAtPrice: 45.0,
    status: 'PUBLISHED',
    category: { id: 'cat-6', name: 'Gorras & Caps', slug: 'gorras-caps' },
    brand: { id: 'b-7', name: 'New Era', slug: 'new-era' },
    images: [{ id: 'img-7', url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600', isMain: true, displayOrder: 0 }],
    variants: [
      { id: 'v11', sku: 'NE-NY-NAVY-714', title: 'Azul Navy / Talla 7 1/4', price: 38.0, stock: 30 },
      { id: 'v12', sku: 'NE-NY-BLK-712', title: 'Black on Black / Talla 7 1/2', price: 40.0, stock: 22 },
    ],
  },
];

export default function StorefrontHomePage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  const { addItem } = useCartStore();

  useEffect(() => {
    api
      .get('/categories')
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(() => {});

    api
      .get('/products')
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickAdd = (product: any) => {
    const defaultVariant = product.variants?.[0] || {
      id: `default-${product.id}`,
      sku: product.sku,
      title: 'Estándar',
      price: product.basePrice,
      stock: 10,
    };

    addItem(product, defaultVariant, 1);
  };

  const handleOpenVariants = (product: any) => {
    setModalProduct(product);
  };

  const handleAddToCartWithVariant = (
    product: any,
    variant: any,
    quantity: number,
  ) => {
    addItem(product, variant, quantity);
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category?.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      {/* 1. Header */}
      <TreintaHeader />

      {/* 2. Main Storefront Canvas */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {/* Banner Promocional Elegante */}
        <div className="mb-6 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#3C6E71]/10 border border-[#3C6E71]/30 px-3 py-1 text-xs font-bold text-[#3C6E71]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Colección Exclusiva 2026</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#353535] tracking-tight">
              Moda Urbana, Sneakers & Fragancias de Élite
            </h1>
            <p className="text-xs sm:text-sm text-[#777777] font-medium">
              Explora artículos originales garantizados con envíos rápidos a todo el país y pago 100% protegido.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#353535] px-5 py-3 text-xs font-bold text-white hover:bg-[#284B63] transition-all shadow-subtle active:scale-98"
            >
              <ShieldCheck className="h-4 w-4 text-[#3C6E71]" />
              <span>Acceso Administrador</span>
            </Link>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="mb-6">
          <TreintaCategoryPills
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* 3. Catalog Grid + Live Floating Cart */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 xl:grid-cols-4 items-start">
          {/* Product Grid Area */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#353535] tracking-tight">
                {selectedCategory === 'all'
                  ? 'Catálogo Completo'
                  : categories.find((c) => c.slug === selectedCategory)?.name || 'Colección'}
              </h2>
              <span className="text-xs font-bold text-[#777777]">
                {filteredProducts.length} productos disponibles
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#D9D9D9] bg-[#FFFFFF] p-12 text-center">
                <p className="text-xs font-bold text-[#353535]">No hay productos en esta categoría</p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-3 text-xs font-bold text-[#3C6E71] hover:underline"
                >
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((prod) => (
                  <TreintaProductCard
                    key={prod.id}
                    product={prod}
                    onQuickAdd={handleQuickAdd}
                    onOpenVariants={handleOpenVariants}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Live Cart Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <TreintaLiveCart />
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="mt-16 border-t border-[#D9D9D9] bg-[#FFFFFF] py-8 text-center text-xs text-[#777777]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#353535] text-white text-[10px] font-black">
              W
            </div>
            <span className="font-bold text-[#353535]">Wally Enterprise Commerce</span>
          </div>
          <p>© 2026 Wally Store. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* 5. Variant Modal */}
      {modalProduct && (
        <TreintaVariantModal
          product={modalProduct}
          isOpen={!!modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={handleAddToCartWithVariant}
        />
      )}
    </div>
  );
}
