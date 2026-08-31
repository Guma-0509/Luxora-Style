'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { X, Check, ShoppingBag, Plus, Minus } from 'lucide-react';

interface TreintaVariantModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export const TreintaVariantModal: React.FC<TreintaVariantModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.[0] || {
      id: 'default',
      sku: product.sku,
      title: 'Estándar',
      price: product.basePrice,
      stock: 10,
    },
  );

  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAddToCart(product, selectedVariant, quantity);
    onClose();
  };

  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-dropdown sm:p-8 space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#777777] hover:bg-[#D9D9D9]/30 hover:text-[#353535] transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Product Preview */}
        <div className="flex gap-4 items-center">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-[#D9D9D9]/20 border border-[#D9D9D9] p-1">
            <img
              src={primaryImage}
              alt={product.name}
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#3C6E71] uppercase tracking-wider">
              {product.category?.name || 'Wally Store'}
            </span>
            <h3 className="text-sm font-black text-[#353535] leading-snug">{product.name}</h3>
            <p className="text-base font-black text-[#353535] font-mono mt-1">
              {formatCurrency(selectedVariant.price)}
            </p>
          </div>
        </div>

        {/* Variant Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#353535]">
            Selecciona Talla / Variante:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
            {product.variants?.map((v) => {
              const isSelected = selectedVariant.id === v.id;
              const isOut = v.stock === 0;

              return (
                <button
                  key={v.id}
                  disabled={isOut}
                  onClick={() => setSelectedVariant(v)}
                  className={`flex items-center justify-between rounded-2xl border p-3 text-xs font-bold transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'border-[#3C6E71] bg-[#3C6E71] text-white shadow-subtle'
                      : isOut
                      ? 'border-[#D9D9D9] bg-[#D9D9D9]/30 text-[#777777] cursor-not-allowed opacity-50'
                      : 'border-[#D9D9D9] bg-[#FFFFFF] text-[#353535] hover:bg-[#D9D9D9]/20 hover:border-[#353535]'
                  }`}
                >
                  <div className="truncate">
                    <p className="truncate">{v.title}</p>
                    <span className={`text-[10px] block font-mono ${isSelected ? 'text-white/80' : 'text-[#777777]'}`}>
                      {isOut ? 'Agotado' : `${v.stock} disponibles`}
                    </span>
                  </div>
                  <span className="font-mono font-black ml-2">{formatCurrency(v.price)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-center justify-between border-t border-[#D9D9D9] pt-4">
          <span className="text-xs font-bold text-[#353535]">Cantidad:</span>
          <div className="flex items-center rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#353535] hover:bg-[#D9D9D9]/40 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-xs font-black text-[#353535] font-mono">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(selectedVariant.stock || 99, quantity + 1))}
              disabled={quantity >= (selectedVariant.stock || 99)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#353535] hover:bg-[#D9D9D9]/40 disabled:opacity-30 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Add CTA Button */}
        <button
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3C6E71] py-3.5 text-xs font-black text-white shadow-subtle hover:bg-[#284B63] transition-all transform active:scale-98 cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Agregar {quantity} al Carrito • {formatCurrency(selectedVariant.price * quantity)}</span>
        </button>
      </div>
    </div>
  );
};
