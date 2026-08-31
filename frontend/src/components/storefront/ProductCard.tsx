'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, calculateDiscountPercentage } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [added, setAdded] = React.useState(false);

  const mainImage =
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600';

  const hoverImage = product.images?.[1]?.url || mainImage;

  const discount = calculateDiscountPercentage(product.basePrice, product.compareAtPrice);

  const rating = product.reviewsSummary?.averageRating || 5.0;
  const reviewCount = product.reviewsSummary?.totalReviews || 0;

  const defaultVariant = product.variants?.[0];
  const isOutOfStock = product.totalStock !== undefined ? product.totalStock === 0 : false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!defaultVariant || isOutOfStock) return;
    addItem(product, defaultVariant, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300">
      {/* 1. Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
          {discount && (
            <span className="rounded-full bg-brand-accent px-2.5 py-1 text-[11px] font-black text-white shadow-md">
              -{discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="rounded-full bg-primary-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              NUEVO
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              AGOTADO
            </span>
          )}
        </div>
      </Link>

      {/* 2. Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span>{product.brand?.name || product.category?.name || 'General'}</span>
          {product.variants && product.variants.length > 1 && (
            <span className="text-slate-400">+{product.variants.length} opciones</span>
          )}
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-brand transition-colors mb-1.5 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating Stars */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-600">({reviewCount})</span>
        </div>

        {/* Pricing & Add to Cart Button */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(product.basePrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-primary-900 text-white hover:bg-brand hover:scale-105 active:scale-95'
            }`}
            title={isOutOfStock ? 'Agotado' : 'Agregar al Carrito'}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
