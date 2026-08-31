'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '../../../types';
import { VariantSelector } from '../../../components/storefront/VariantSelector';
import { formatCurrency, calculateDiscountPercentage } from '../../../lib/utils';
import { useCartStore } from '../../../store/cartStore';
import { ShoppingBag, Zap, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductClientWrapperProps {
  product: Product;
}

export function ProductClientWrapper({ product }: ProductClientWrapperProps) {
  const router = useRouter();
  const { addItem, openDrawer } = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const activePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
  const activeCompareAtPrice = selectedVariant?.compareAtPrice
    ? Number(selectedVariant.compareAtPrice)
    : product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;

  const discount = calculateDiscountPercentage(activePrice, activeCompareAtPrice);

  const currentStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = currentStock <= 0;

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1 || newQty > currentStock) return;
    setQuantity(newQty);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedVariant || isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      {/* 1. Price Tag */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-[#353535] tracking-tight font-mono">
          {formatCurrency(activePrice)}
        </span>
        {activeCompareAtPrice && activeCompareAtPrice > activePrice && (
          <span className="text-base text-[#777777] line-through font-mono">
            {formatCurrency(activeCompareAtPrice)}
          </span>
        )}
        {discount && (
          <span className="rounded-full bg-[#3C6E71] px-2.5 py-1 text-xs font-black text-white shadow-subtle">
            Ahorras {discount}%
          </span>
        )}
      </div>

      {/* 2. Stock Indicator */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#D9D9D9]/40 px-3 py-1 text-xs font-bold text-[#353535] border border-[#D9D9D9]">
            <AlertCircle className="h-4 w-4" /> Agotado temporalmente
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#3C6E71]/10 px-3 py-1 text-xs font-bold text-[#3C6E71] border border-[#3C6E71]/30">
            <CheckCircle className="h-4 w-4" /> En Stock ({currentStock} unidades disponibles)
          </span>
        )}
      </div>

      {/* 3. Short description */}
      {product.shortDescription && (
        <p className="text-xs text-[#777777] leading-relaxed border-l-2 border-[#D9D9D9] pl-3">
          {product.shortDescription}
        </p>
      )}

      {/* 4. Multi-Attribute Variant Matrix */}
      {product.variants && product.variants.length > 0 && (
        <VariantSelector
          variants={product.variants}
          selectedVariant={selectedVariant}
          onSelectVariant={(v) => {
            setSelectedVariant(v);
            setQuantity(1);
          }}
        />
      )}

      {/* 5. Quantity Selector & CTAs */}
      <div className="space-y-4 pt-2">
        {/* Quantity Controls */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-[#353535] uppercase tracking-wider">
            Cantidad:
          </span>
          <div className="flex items-center rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-1 shadow-subtle">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isOutOfStock}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#353535] hover:bg-[#D9D9D9]/40 disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-extrabold text-[#353535] font-mono">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= currentStock || isOutOfStock}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#353535] hover:bg-[#D9D9D9]/40 disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-bold text-white shadow-subtle transition-all transform active:scale-98 cursor-pointer ${
              isOutOfStock
                ? 'bg-[#D9D9D9] cursor-not-allowed text-[#777777]'
                : isAdded
                ? 'bg-[#3C6E71]'
                : 'bg-[#353535] hover:bg-[#284B63]'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {isAdded ? '¡Agregado al Carrito!' : 'Agregar al Carrito'}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-black text-white shadow-subtle transition-all transform active:scale-98 cursor-pointer ${
              isOutOfStock
                ? 'bg-[#D9D9D9] cursor-not-allowed text-[#777777]'
                : 'bg-[#3C6E71] hover:bg-[#284B63]'
            }`}
          >
            <Zap className="h-4 w-4" />
            Comprar Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
