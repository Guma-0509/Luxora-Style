'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { X, Check, ShoppingBag, Plus, Minus, Layers, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  // Extract all available colors and sizes from variants
  const { colors, sizes, hasAttributes } = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) {
      return { colors: [], sizes: [], hasAttributes: false };
    }

    const colorSet = new Set<string>();
    const sizeSet = new Set<string>();

    product.variants.forEach((v) => {
      // 1. From attributes
      if (v.attributes) {
        Object.entries(v.attributes).forEach(([k, val]) => {
          const keyLower = k.toLowerCase();
          if (keyLower.includes('col') || keyLower.includes('ton')) {
            colorSet.add(String(val));
          } else if (keyLower.includes('tal') || keyLower.includes('siz') || keyLower.includes('med') || keyLower.includes('cap')) {
            sizeSet.add(String(val));
          }
        });
      }

      // 2. Fallback: Parse from title (e.g. "Chicago Red / Talla 40" or "Triple White / Talla 41")
      if (v.title && v.title.includes('/')) {
        const parts = v.title.split('/').map((p) => p.trim());
        if (parts.length >= 2) {
          if (colorSet.size === 0) colorSet.add(parts[0]);
          if (sizeSet.size === 0) sizeSet.add(parts[1].replace(/talla/i, '').trim());
        }
      }
    });

    const colorsArr = Array.from(colorSet);
    const sizesArr = Array.from(sizeSet);

    return {
      colors: colorsArr,
      sizes: sizesArr,
      hasAttributes: colorsArr.length > 0 || sizesArr.length > 0,
    };
  }, [product]);

  // Reset state whenever the modal opens or the product changes
  useEffect(() => {
    if (isOpen && product) {
      const firstVariant = (product.variants && product.variants.length > 0)
        ? product.variants[0]
        : {
            id: `def-${product.id}`,
            sku: product.sku || `SKU-${product.id}`,
            title: 'Estándar',
            price: product.basePrice || 0,
            stock: 50,
            attributes: {},
          };

      setSelectedVariant(firstVariant as ProductVariant);
      setQuantity(1);
      setJustAdded(false);

      // Determine initial color and size
      if (firstVariant.attributes) {
        const attrs = firstVariant.attributes;
        const colorVal = Object.entries(attrs).find(([k]) => k.toLowerCase().includes('col'))?.[1];
        const sizeVal = Object.entries(attrs).find(([k]) => k.toLowerCase().includes('tal') || k.toLowerCase().includes('siz'))?.[1];
        if (colorVal) setSelectedColor(String(colorVal));
        if (sizeVal) setSelectedSize(String(sizeVal));
      } else if (firstVariant.title && firstVariant.title.includes('/')) {
        const parts = firstVariant.title.split('/').map((p) => p.trim());
        if (parts[0]) setSelectedColor(parts[0]);
        if (parts[1]) setSelectedSize(parts[1].replace(/talla/i, '').trim());
      }
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentVariant = selectedVariant || product.variants?.[0] || {
    id: `def-${product.id}`,
    sku: product.sku || `SKU-${product.id}`,
    title: 'Estándar',
    price: product.basePrice || 0,
    stock: 50,
  };

  const currentPrice = Number(currentVariant.price ?? product.basePrice ?? 0);
  const currentStock = typeof currentVariant.stock === 'number' ? currentVariant.stock : 50;
  const isOutOfStock = currentStock <= 0;

  // Handle color selection
  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    if (product.variants && product.variants.length > 0) {
      // Find variant matching new color + current size
      const match = product.variants.find((v) => {
        const titleMatch = v.title?.toLowerCase().includes(color.toLowerCase());
        const attrMatch = Object.values(v.attributes || {}).some(
          (val) => String(val).toLowerCase() === color.toLowerCase()
        );
        return titleMatch || attrMatch;
      });
      if (match) {
        setSelectedVariant(match);
      }
    }
  };

  // Handle size selection
  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    if (product.variants && product.variants.length > 0) {
      const match = product.variants.find((v) => {
        const titleMatch = v.title?.toLowerCase().includes(size.toLowerCase());
        const attrMatch = Object.values(v.attributes || {}).some(
          (val) => String(val).toLowerCase() === size.toLowerCase()
        );
        return titleMatch || attrMatch;
      });
      if (match) {
        setSelectedVariant(match);
      }
    }
  };

  const handleAdd = () => {
    if (!currentVariant || isOutOfStock) return;
    onAddToCart(product, currentVariant as ProductVariant, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 800);
  };

  const primaryImage =
    currentVariant.imageUrl ||
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 shadow-dropdown sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] hover:text-[#353535] dark:hover:text-[#F5F6F8] transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Product Preview Card */}
        <div className="flex gap-4 items-center border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-5">
          <div className="h-22 w-22 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C] p-1 shadow-xs">
            <img
              src={primaryImage}
              alt={product.name}
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#3C6E71] dark:text-[#4D8B8E] uppercase tracking-wider">
              {product.category?.name || 'Luxora Style'}
            </span>
            <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] leading-snug">{product.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-[#353535] dark:text-[#F5F6F8] font-mono">
                {formatCurrency(currentPrice)}
              </span>
              {currentStock > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 px-2 py-0.5 text-[10px] font-bold text-[#3C6E71] dark:text-[#4D8B8E]">
                  <CheckCircle2 className="h-3 w-3" /> {currentStock} en stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D9D9D9] dark:bg-[#3A3B3C] px-2 py-0.5 text-[10px] font-bold text-[#777777] dark:text-[#A8ABB2]">
                  <AlertCircle className="h-3 w-3" /> Agotado
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-[#777777] dark:text-[#A8ABB2]">SKU: {currentVariant.sku}</p>
          </div>
        </div>

        {/* 1. Interactive Color Selection if available */}
        {colors.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-[#353535] dark:text-[#F5F6F8]">Color / Estilo:</span>
              <span className="font-bold text-[#3C6E71] dark:text-[#4D8B8E]">{selectedColor || colors[0]}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((col) => {
                const isSelected = selectedColor.toLowerCase() === col.toLowerCase();
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleSelectColor(col)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#3C6E71] dark:border-[#4D8B8E] bg-[#3C6E71] dark:bg-[#4D8B8E] text-white shadow-subtle'
                        : 'border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] text-[#353535] dark:text-[#F5F6F8] hover:border-[#353535] dark:hover:border-[#4D8B8E] hover:bg-[#D9D9D9]/20 dark:hover:bg-[#2E3236]'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                    <span>{col}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Interactive Size (Talla) Selection if available */}
        {sizes.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-[#353535] dark:text-[#F5F6F8]">Talla / Medida:</span>
              <span className="font-bold text-[#3C6E71] dark:text-[#4D8B8E]">{selectedSize || sizes[0]}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => {
                const isSelected = selectedSize.toLowerCase() === sz.toLowerCase();
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleSelectSize(sz)}
                    className={`flex min-w-[48px] items-center justify-center rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#3C6E71] dark:border-[#4D8B8E] bg-[#3C6E71] dark:bg-[#4D8B8E] text-white shadow-subtle scale-102'
                        : 'border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] text-[#353535] dark:text-[#F5F6F8] hover:border-[#353535] dark:hover:border-[#4D8B8E] hover:bg-[#D9D9D9]/20 dark:hover:bg-[#2E3236]'
                    }`}
                  >
                    <span>{sz}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Variant List Cards (All Combinations) */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#353535] dark:text-[#F5F6F8]">
              Opciones & Variantes Disponibles ({product.variants.length}):
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
              {product.variants.map((v) => {
                const isSelected = currentVariant.id === v.id;
                const isOut = v.stock <= 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={isOut}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.title && v.title.includes('/')) {
                        const parts = v.title.split('/').map((p) => p.trim());
                        if (parts[0]) setSelectedColor(parts[0]);
                        if (parts[1]) setSelectedSize(parts[1].replace(/talla/i, '').trim());
                      }
                    }}
                    className={`flex items-center justify-between rounded-2xl border p-3 text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-[#3C6E71] dark:border-[#4D8B8E] bg-[#3C6E71] dark:bg-[#4D8B8E] text-white shadow-subtle'
                        : isOut
                        ? 'border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] text-[#777777] dark:text-[#A8ABB2] cursor-not-allowed opacity-50'
                        : 'border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/20 dark:hover:bg-[#2E3236] hover:border-[#353535] dark:hover:border-[#4D8B8E]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate">{v.title}</p>
                      <span
                        className={`text-[10px] block font-mono ${
                          isSelected ? 'text-white/80' : 'text-[#777777] dark:text-[#A8ABB2]'
                        }`}
                      >
                        {isOut ? 'Agotado temporalmente' : `${v.stock} unidades disponibles`}
                      </span>
                    </div>
                    <span className="font-mono font-black">{formatCurrency(v.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Quantity Stepper */}
        <div className="flex items-center justify-between border-t border-[#D9D9D9] dark:border-[#3A3B3C] pt-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8]">Cantidad:</span>
            <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">
              Máx: {currentStock} unidades
            </span>
          </div>
          <div className="flex items-center rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] p-1 shadow-subtle">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/40 dark:hover:bg-[#2E3236] disabled:opacity-30 transition-colors cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-xs font-black text-[#353535] dark:text-[#F5F6F8] font-mono">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(currentStock > 0 ? currentStock : 99, quantity + 1))}
              disabled={quantity >= currentStock || isOutOfStock}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/40 dark:hover:bg-[#2E3236] disabled:opacity-30 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 5. Add CTA Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black text-white shadow-subtle transition-all transform active:scale-98 cursor-pointer ${
            isOutOfStock
              ? 'bg-[#D9D9D9] dark:bg-[#3A3B3C] text-[#777777] dark:text-[#A8ABB2] cursor-not-allowed'
              : justAdded
              ? 'bg-[#3C6E71] dark:bg-[#4D8B8E] scale-102 ring-2 ring-[#3C6E71]'
              : 'bg-[#353535] dark:bg-[#4D8B8E] hover:bg-[#284B63] dark:hover:bg-[#3C6E71]'
          }`}
        >
          {justAdded ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-white animate-bounce" />
              <span>¡Agregado al Carrito!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>
                Agregar {quantity} al Carrito • {formatCurrency(currentPrice * quantity)}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
