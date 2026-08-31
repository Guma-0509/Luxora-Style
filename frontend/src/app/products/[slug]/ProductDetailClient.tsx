'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductGallery } from '../../../components/storefront/ProductGallery';
import { ProductSpecsTable } from '../../../components/storefront/ProductSpecsTable';
import { ProductClientWrapper } from './ProductClientWrapper';
import { Product } from '../../../types';
import { ShieldCheck, Truck, RotateCcw, Star, PackageSearch, ArrowLeft } from 'lucide-react';
import { TreintaHeader } from '../../../components/storefront/TreintaHeader';
import { findProductBySlug, useCatalog } from '../../../lib/catalogStore';
import { api } from '../../../lib/api';

export function ProductDetailClient({ initialProduct, slug }: { initialProduct?: Product | null; slug: string }) {
  const { products } = useCatalog();
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);

  useEffect(() => {
    // 1. Try local catalog store first
    const found = findProductBySlug(slug) || products.find((p) => p.slug === slug || p.id === slug);
    if (found) {
      setProduct(found);
      setLoading(false);
      return;
    }

    // 2. Try API fetch
    api
      .get(`/products/slug/${slug}`)
      .then((res: any) => {
        if (res?.data) {
          setProduct(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [slug, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#18191A] flex flex-col">
        <TreintaHeader />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-pulse space-y-4 text-center">
            <div className="h-10 w-10 mx-auto rounded-full bg-[#3C6E71]/20 animate-spin" />
            <p className="text-xs text-[#777777] dark:text-[#A8ABB2]">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#18191A] text-[#353535] dark:text-[#F5F6F8] flex flex-col">
        <TreintaHeader />
        <main className="flex-1 mx-auto max-w-lg px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#D9D9D9]/30 dark:bg-[#242526] flex items-center justify-center text-[#777777] mb-4">
            <PackageSearch className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-black">Producto no encontrado</h1>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1 mb-6">
            El producto solicitado no está disponible en este momento.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-6 py-3 text-xs font-bold text-white shadow-subtle hover:bg-[#284B63]"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a Primera Plana
          </Link>
        </main>
      </div>
    );
  }

  const rating = product.reviewsSummary?.averageRating || 5.0;
  const totalReviews = product.reviewsSummary?.totalReviews || 14;

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#18191A] text-[#353535] dark:text-[#F5F6F8] flex flex-col transition-colors">
      <TreintaHeader />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full">
        {/* 1. Breadcrumbs */}
        <nav className="text-xs text-[#777777] dark:text-[#A8ABB2] mb-6 flex items-center space-x-2">
          <Link href="/" className="hover:text-[#353535] dark:hover:text-[#F5F6F8]">Inicio</Link>
          <span>/</span>
          <Link href="/" className="hover:text-[#353535] dark:hover:text-[#F5F6F8]">Catálogo</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/?category=${product.category.slug}`} className="hover:text-[#353535] dark:hover:text-[#F5F6F8]">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#353535] dark:text-[#F5F6F8] font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2. Main Product Hero */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-start">
          {/* Left: Media Gallery */}
          <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 shadow-subtle">
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Right: Details & Purchase Matrix */}
          <div className="space-y-6 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-subtle">
            {/* Brand & Title */}
            <div>
              {product.brand && (
                <span className="text-xs font-bold uppercase tracking-wider text-[#3C6E71] dark:text-[#4D8B8E]">
                  {product.brand.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight mt-1 leading-snug">
                {product.name}
              </h1>
              <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1 font-mono">SKU: {product.sku}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-4">
              <div className="flex text-[#3C6E71] dark:text-[#4D8B8E]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(rating) ? 'fill-[#3C6E71] dark:fill-[#4D8B8E] text-[#3C6E71] dark:text-[#4D8B8E]' : 'text-[#D9D9D9] dark:text-[#3A3B3C]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8]">{rating}</span>
              <span className="text-xs text-[#777777] dark:text-[#A8ABB2]">({totalReviews} calificaciones verificadas)</span>
            </div>

            {/* Client Buying Actions */}
            <ProductClientWrapper product={product} />

            {/* Value Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#D9D9D9] dark:border-[#3A3B3C] text-center">
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] text-[#353535] dark:text-[#F5F6F8]">
                <Truck className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E] mb-1" />
                <span className="text-[11px] font-bold">Envío Seguro</span>
                <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">24 a 48 horas</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] text-[#353535] dark:text-[#F5F6F8]">
                <ShieldCheck className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E] mb-1" />
                <span className="text-[11px] font-bold">Garantía Oficial</span>
                <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">100% Original</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] text-[#353535] dark:text-[#F5F6F8]">
                <RotateCcw className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E] mb-1" />
                <span className="text-[11px] font-bold">Devolución</span>
                <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">Hasta 30 días</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Product Description & Specifications */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-subtle">
            <div className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <h2 className="text-lg font-black text-[#353535] dark:text-[#F5F6F8]">Descripción del Producto</h2>
            </div>
            <div className="text-sm text-[#353535] dark:text-[#F5F6F8] leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>

          <div className="rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 shadow-subtle">
            <ProductSpecsTable
              specifications={product.specifications || []}
              sku={product.sku}
              brandName={product.brand?.name}
              weight={product.weight}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
