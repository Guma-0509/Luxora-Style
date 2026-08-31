'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TreintaHeader } from '../../components/storefront/TreintaHeader';
import { TreintaCategoryPills } from '../../components/storefront/TreintaCategoryPills';
import { TreintaProductCard } from '../../components/storefront/TreintaProductCard';
import { TreintaLiveCart } from '../../components/storefront/TreintaLiveCart';
import { TreintaVariantModal } from '../../components/storefront/TreintaVariantModal';
import { Product, Category } from '../../types';
import { api } from '../../lib/api';
import { PackageSearch, PlusCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../../lib/mockData';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  const { addItem, initCart } = useCartStore();

  useEffect(() => {
    initCart();

    Promise.all([
      api.get('/products?limit=50').catch(() => null),
      api.get('/categories').catch(() => null),
    ])
      .then(([prodRes, catRes]: any) => {
        if (prodRes?.data && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
          const normalized = prodRes.data.map((p: any) => {
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
        if (catRes?.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      })
      .catch(() => {});
  }, [initCart]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === 'all' || p.category?.slug === activeCategory;

    return matchesSearch && matchesCategory;
  });

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
    setSelectedProductForModal(product);
  };

  const handleAddToCartWithVariant = (
    product: any,
    variant: any,
    quantity: number,
  ) => {
    addItem(product, variant, quantity);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#18191A] text-[#353535] dark:text-[#F5F6F8] flex flex-col transition-colors">
      <TreintaHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="mx-auto max-w-7xl w-full flex-1 p-3 sm:p-5 flex flex-col gap-4">
        {/* Category Pills Bar */}
        <div className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-2 px-3 shadow-subtle">
          <TreintaCategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* Dual Layout: Products + Cart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 space-y-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="h-56 rounded-2xl bg-[#FFFFFF] dark:bg-[#242526] border border-[#D9D9D9] dark:border-[#3A3B3C] animate-pulse p-4 flex flex-col items-center justify-between shadow-subtle"
                  >
                    <div className="h-28 w-28 rounded-xl bg-[#D9D9D9]/30 dark:bg-[#1E1F20]" />
                    <div className="h-4 w-16 bg-[#D9D9D9]/40 dark:bg-[#3A3B3C] rounded" />
                    <div className="h-3 w-24 bg-[#D9D9D9]/40 dark:bg-[#3A3B3C] rounded" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-16 text-center shadow-subtle">
                <PackageSearch className="h-10 w-10 text-[#777777] dark:text-[#A8ABB2] mb-3" />
                <h3 className="text-sm font-bold text-[#353535] dark:text-[#F5F6F8]">No se encontraron productos</h3>
                <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1">Prueba cambiando los filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                <Link
                  href="/admin/dashboard/products"
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 text-center hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:bg-[#3C6E71]/5 dark:hover:bg-[#4D8B8E]/5 transition-all cursor-pointer group min-h-[220px]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D9D9D9]/40 dark:bg-[#3A3B3C] text-[#353535] dark:text-[#F5F6F8] group-hover:bg-[#353535] dark:group-hover:bg-[#4D8B8E] group-hover:text-white transition-colors mb-2">
                    <PlusCircle className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8] group-hover:text-[#3C6E71] dark:group-hover:text-[#4D8B8E]">
                    Crear producto
                  </span>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] mt-0.5">Agregar al catálogo</span>
                </Link>

                {filteredProducts.map((product) => (
                  <TreintaProductCard
                    key={product.id}
                    product={product}
                    onQuickAdd={handleQuickAdd}
                    onOpenVariants={handleOpenVariants}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Live Cart */}
          <div className="hidden lg:block lg:col-span-4 sticky top-20">
            <TreintaLiveCart />
          </div>
        </div>
      </main>

      {/* Variant Modal */}
      <TreintaVariantModal
        product={selectedProductForModal}
        isOpen={Boolean(selectedProductForModal)}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={handleAddToCartWithVariant}
      />
    </div>
  );
}
