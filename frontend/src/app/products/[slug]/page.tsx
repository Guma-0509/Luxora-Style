import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductGallery } from '../../../components/storefront/ProductGallery';
import { ProductSpecsTable } from '../../../components/storefront/ProductSpecsTable';
import { ProductClientWrapper } from './ProductClientWrapper';
import { Product } from '../../../types';
import { ShieldCheck, Truck, RotateCcw, Star } from 'lucide-react';
import { TreintaHeader } from '../../../components/storefront/TreintaHeader';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const res = await fetch(`${baseURL}/products/slug/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Product;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Producto no encontrado | Luxora Style' };

  return {
    title: `${product.seoTitle || product.name} | Luxora Style`,
    description: product.seoDescription || product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description.slice(0, 160),
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const rating = product.reviewsSummary?.averageRating || 5.0;
  const totalReviews = product.reviewsSummary?.totalReviews || 12;

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      <TreintaHeader />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full">
        {/* 1. Breadcrumbs */}
        <nav className="text-xs text-[#777777] mb-6 flex items-center space-x-2">
          <Link href="/" className="hover:text-[#353535]">Inicio</Link>
          <span>/</span>
          <Link href="/" className="hover:text-[#353535]">Catálogo</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/?category=${product.category.slug}`} className="hover:text-[#353535]">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#353535] font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2. Main Product Hero */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-start">
          {/* Left: Media Gallery */}
          <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-4 shadow-subtle">
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Right: Details & Purchase Matrix */}
          <div className="space-y-6 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-subtle">
            {/* Brand & Title */}
            <div>
              {product.brand && (
                <span className="text-xs font-bold uppercase tracking-wider text-[#3C6E71]">
                  {product.brand.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-[#353535] tracking-tight mt-1 leading-snug">
                {product.name}
              </h1>
              <p className="text-xs text-[#777777] mt-1 font-mono">SKU: {product.sku}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 border-b border-[#D9D9D9] pb-4">
              <div className="flex text-[#3C6E71]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(rating) ? 'fill-[#3C6E71] text-[#3C6E71]' : 'text-[#D9D9D9]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-[#353535]">{rating}</span>
              <span className="text-xs text-[#777777]">({totalReviews} calificaciones verificadas)</span>
            </div>

            {/* Client Buying Actions */}
            <ProductClientWrapper product={product} />

            {/* Value Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#D9D9D9] text-center">
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#D9D9D9]/20 text-[#353535]">
                <Truck className="h-5 w-5 text-[#3C6E71] mb-1" />
                <span className="text-[11px] font-bold">Envío Seguro</span>
                <span className="text-[10px] text-[#777777]">24 a 48 horas</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#D9D9D9]/20 text-[#353535]">
                <ShieldCheck className="h-5 w-5 text-[#3C6E71] mb-1" />
                <span className="text-[11px] font-bold">Garantía Oficial</span>
                <span className="text-[10px] text-[#777777]">100% Original</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#D9D9D9]/20 text-[#353535]">
                <RotateCcw className="h-5 w-5 text-[#3C6E71] mb-1" />
                <span className="text-[11px] font-bold">Devolución</span>
                <span className="text-[10px] text-[#777777]">Hasta 30 días</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Product Description & Specifications */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-subtle">
            <div className="border-b border-[#D9D9D9] pb-3">
              <h2 className="text-lg font-black text-[#353535]">Descripción del Producto</h2>
            </div>
            <div className="text-sm text-[#353535] leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>

          <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle">
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
