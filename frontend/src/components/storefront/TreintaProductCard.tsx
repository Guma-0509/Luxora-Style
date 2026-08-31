'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Plus, Check, Eye, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';

interface TreintaProductCardProps {
  product: Product;
  onQuickAdd: (product: Product) => void;
  onOpenVariants?: (product: Product) => void;
}

export const TreintaProductCard: React.FC<TreintaProductCardProps> = ({
  product,
  onQuickAdd,
  onOpenVariants,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const variants = product.variants || [];
  const hasVariants = variants.length > 1;

  const isOutOfStock = Boolean(
    (variants.length > 0 && variants.every((v) => v.stock <= 0)) ||
    (product as any).status === 'OUT_OF_STOCK',
  );

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.basePrice) / product.compareAtPrice!) * 100)
    : 0;

  // Extract available sizes / options from variants
  const sizePills: string[] = Array.from(
    new Set(
      variants.flatMap((v) => {
        const titleParts = (v.title || '').split('/');
        if (titleParts.length > 1) {
          return [titleParts[1].replace(/talla/i, '').trim()];
        }
        if (v.attributes) {
          return Object.entries(v.attributes)
            .filter(([k]) => k.toLowerCase().includes('tal') || k.toLowerCase().includes('siz') || k.toLowerCase().includes('cap'))
            .map(([, val]) => String(val));
        }
        return [];
      }),
    ),
  ).slice(0, 4);

  // Extract colors
  const colorCount = new Set(
    variants.flatMap((v) => {
      const titleParts = (v.title || '').split('/');
      if (titleParts.length > 1) {
        return [titleParts[0].trim()];
      }
      return [];
    }),
  ).size;

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (hasVariants && onOpenVariants) {
      onOpenVariants(product);
    } else {
      onQuickAdd(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1200);
    }
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenVariants) {
      onOpenVariants(product);
    } else {
      onQuickAdd(product);
    }
  };

  const primaryImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-3.5 transition-all duration-200 hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:shadow-card">
      {/* 1. Clickable Image & Badge Area */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square w-full overflow-hidden rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#18191A] p-2 mb-3"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="h-full w-full object-cover object-center rounded-xl transition-transform duration-300 group-hover:scale-103"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 rounded-full bg-[#3C6E71] dark:bg-[#4D8B8E] px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Category Pill Tag */}
        {product.category && (
          <span className="absolute bottom-3 left-3 rounded-full bg-[#FFFFFF]/95 dark:bg-[#242526]/95 border border-[#D9D9D9] dark:border-[#3A3B3C] px-2 py-0.5 text-[9px] font-bold text-[#353535] dark:text-[#F5F6F8] backdrop-blur-xs">
            {product.category.name}
          </span>
        )}

        {/* Quick variant count badge if multiple */}
        {hasVariants && (
          <span className="absolute top-3 right-3 rounded-full bg-[#353535]/85 dark:bg-[#18191A]/85 text-white px-2 py-0.5 text-[9px] font-bold shadow-xs">
            {variants.length} Opciones
          </span>
        )}
      </Link>

      {/* 2. Product Metadata & Title */}
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-[#777777] dark:text-[#A8ABB2]">
          <span>{product.brand?.name || 'Luxora Selection'}</span>
          <span className="font-mono text-[10px]">SKU: {product.sku}</span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="block font-bold text-[#353535] dark:text-[#F5F6F8] text-xs leading-snug line-clamp-2 hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-colors"
        >
          {product.name}
        </Link>

        {/* Available Tallas / Sizes Chips */}
        {sizePills.length > 0 && (
          <div className="flex items-center gap-1 pt-1 flex-wrap">
            <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] font-semibold">Tallas:</span>
            {sizePills.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={handleOpenModal}
                className="rounded-md border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#18191A] px-1.5 py-0.5 text-[9px] font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-colors cursor-pointer"
                title={`Ver opciones para talla ${sz}`}
              >
                {sz}
              </button>
            ))}
            {colorCount > 1 && (
              <span className="text-[9px] font-semibold text-[#3C6E71] dark:text-[#4D8B8E] ml-0.5">
                • {colorCount} colores
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Pricing & Action CTA Button */}
      <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#D9D9D9]/60 dark:border-[#3A3B3C]/60">
        <div className="flex flex-col">
          {hasDiscount && (
            <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] line-through font-semibold font-mono">
              {formatCurrency(product.compareAtPrice!)}
            </span>
          )}
          <span className="text-sm font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight font-mono">
            {formatCurrency(product.basePrice)}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleActionClick}
          disabled={isOutOfStock}
          className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition-all shadow-subtle active:scale-95 cursor-pointer ${
            isOutOfStock
              ? 'bg-[#D9D9D9] dark:bg-[#3A3B3C] text-[#777777] dark:text-[#A8ABB2] cursor-not-allowed'
              : isAdded
              ? 'bg-[#3C6E71] dark:bg-[#4D8B8E] text-white scale-102'
              : hasVariants
              ? 'bg-[#FFFFFF] dark:bg-[#18191A] border border-[#353535] dark:border-[#3A3B3C] text-[#353535] dark:text-[#F5F6F8] hover:bg-[#353535] hover:text-white dark:hover:bg-[#3C6E71] dark:hover:border-[#3C6E71]'
              : 'bg-[#353535] dark:bg-[#4D8B8E] text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71]'
          }`}
          aria-label={`Agregar ${product.name} al carrito`}
        >
          {isOutOfStock ? (
            <span>Agotado</span>
          ) : isAdded ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>¡Agregado!</span>
            </>
          ) : hasVariants ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Tallas & Opciones</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>Agregar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
