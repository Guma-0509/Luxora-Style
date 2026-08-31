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
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../lib/mockData';
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

export default function StorefrontHomePage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  const { addItem, initCart } = useCartStore();

  useEffect(() => {
    initCart();

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
          const normalized = res.data.map((p: any) => {
            if (!p.variants || p.variants.length === 0) {
              return {
                ...p,
                variants: [
                  {
                    id: `var-${p.id}`,
                    sku: p.sku || `SKU-${p.id}`,
                    title: 'Estándar',
                    price: p.basePrice || 0,
                    stock: 50,
                    attributes: {},
                  },
                ],
              };
            }
            return p;
          });
          setProducts(normalized);
        }
      })
      .catch(() => {});
  }, [initCart]);

  const handleQuickAdd = (product: any) => {
    const defaultVariant = product.variants?.[0] || {
      id: `default-${product.id}`,
      sku: product.sku || `SKU-${product.id}`,
      title: 'Estándar',
      price: product.basePrice || 0,
      stock: 50,
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
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#18191A] text-[#353535] dark:text-[#F5F6F8] flex flex-col transition-colors">
      {/* 1. Header */}
      <TreintaHeader />

      {/* 2. Main Storefront Canvas */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {/* Banner Promocional Elegante */}
        <div className="mb-6 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 border border-[#3C6E71]/30 dark:border-[#4D8B8E]/40 px-3 py-1 text-xs font-bold text-[#3C6E71] dark:text-[#4D8B8E]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Colección Exclusiva 2026</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight">
              Moda Urbana, Sneakers & Fragancias de Élite
            </h1>
            <p className="text-xs sm:text-sm text-[#777777] dark:text-[#A8ABB2] font-medium">
              Explora artículos originales garantizados con envíos rápidos a todo el país y pago 100% protegido.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-5 py-3 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-all shadow-subtle active:scale-98"
            >
              <ShieldCheck className="h-4 w-4 text-[#3C6E71] dark:text-white" />
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
              <h2 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight">
                {selectedCategory === 'all'
                  ? 'Catálogo Completo'
                  : categories.find((c) => c.slug === selectedCategory)?.name || 'Colección'}
              </h2>
              <span className="text-xs font-bold text-[#777777] dark:text-[#A8ABB2]">
                {filteredProducts.length} productos disponibles
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-12 text-center">
                <p className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8]">No hay productos en esta categoría</p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-3 text-xs font-bold text-[#3C6E71] dark:text-[#4D8B8E] hover:underline cursor-pointer"
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
      <footer className="mt-16 border-t border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#18191A] py-8 text-center text-xs text-[#777777] dark:text-[#A8ABB2] transition-colors">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black border border-[#353535] dark:border-[#3A3B3C] overflow-hidden p-0.5">
              <img src="/logo.png" alt="Luxora Style" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-[#353535] dark:text-[#F5F6F8]">Luxora Style Official Store</span>
          </div>
          <p>© 2026 Luxora Style. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* 5. Variant Modal */}
      <TreintaVariantModal
        product={modalProduct}
        isOpen={Boolean(modalProduct)}
        onClose={() => setModalProduct(null)}
        onAddToCart={handleAddToCartWithVariant}
      />
    </div>
  );
}
