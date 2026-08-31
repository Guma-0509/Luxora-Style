'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../lib/utils';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';

export const TreintaLiveCart: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getItemCount } =
    useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="sticky top-20 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 shadow-subtle">
        <div className="flex items-center gap-2 border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-4">
          <ShoppingBag className="h-5 w-5 text-[#353535] dark:text-[#F5F6F8]" />
          <h2 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">Tu Canasta de Compra</h2>
        </div>
        <div className="py-10 text-center text-xs text-[#777777] dark:text-[#A8ABB2]">Cargando carrito...</div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const freeShippingLimit = 150;
  const isFreeShipping = subtotal >= freeShippingLimit;
  const missingForFreeShipping = Math.max(0, freeShippingLimit - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingLimit) * 100));

  return (
    <div className="sticky top-20 flex flex-col rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] shadow-subtle overflow-hidden">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#353535] dark:bg-[#3C6E71] text-white">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight uppercase">
              Canasta de Compra
            </h2>
            <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">
              {itemCount} {itemCount === 1 ? 'artículo añadido' : 'artículos añadidos'}
            </span>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-[10px] font-bold text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-[#F5F6F8] transition-colors cursor-pointer"
          >
            Vaciar
          </button>
        )}
      </div>

      {/* 2. Free Shipping Meter */}
      <div className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] p-4 space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-[#353535] dark:text-[#F5F6F8]">
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-[#3C6E71] dark:text-[#4D8B8E]" />
            Envío Gratis Nacional
          </span>
          <span className="font-mono text-[#3C6E71] dark:text-[#4D8B8E]">{shippingProgress}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#D9D9D9] dark:bg-[#3A3B3C]">
          <div
            className="h-full bg-[#3C6E71] dark:bg-[#4D8B8E] transition-all duration-300 rounded-full"
            style={{ width: `${shippingProgress}%` }}
          />
        </div>

        <p className="text-[10px] text-[#777777] dark:text-[#A8ABB2] font-medium">
          {isFreeShipping ? (
            <span className="font-bold text-[#3C6E71] dark:text-[#4D8B8E]">¡Felicidades! Tienes Envío Gratis 🎉</span>
          ) : (
            <>
              Faltan <strong className="text-[#353535] dark:text-[#F5F6F8]">{formatCurrency(missingForFreeShipping)}</strong> para envío gratis
            </>
          )}
        </p>
      </div>

      {/* 3. Items List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#D9D9D9]/50 dark:divide-[#3A3B3C]/50 p-4 space-y-3">
        {items.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D9D9D9]/30 dark:bg-[#1E1F20] text-[#777777] dark:text-[#A8ABB2]">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8]">Tu canasta está vacía</p>
            <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2] max-w-[200px] mx-auto">
              Selecciona productos del catálogo para comenzar tu compra.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.variantId}
              className="flex items-center gap-3 pt-3 first:pt-0 group"
            >
              {/* Image thumbnail */}
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#D9D9D9]/30 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C] p-0.5">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-full w-full bg-[#D9D9D9]/50 dark:bg-[#3A3B3C] flex items-center justify-center text-[9px] text-[#777777] dark:text-[#A8ABB2]">
                    Foto
                  </div>
                )}
              </div>

              {/* Title & Price info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8] truncate">{item.productName}</p>
                <p className="text-[10px] text-[#777777] dark:text-[#A8ABB2] truncate font-medium">
                  {item.title}
                </p>
                <p className="text-xs font-black text-[#353535] dark:text-[#F5F6F8] font-mono">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] p-0.5 shadow-xs">
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/40 dark:hover:bg-[#2E3236] transition-colors cursor-pointer"
                  aria-label="Restar una unidad"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-[#353535] dark:text-[#F5F6F8]">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  disabled={item.quantity >= item.maxStock}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/40 dark:hover:bg-[#2E3236] disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Añadir una unidad"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Trash Delete */}
              <button
                onClick={() => removeItem(item.variantId)}
                className="text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-[#F5F6F8] p-1 transition-colors cursor-pointer"
                title="Eliminar artículo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 4. Subtotal & Checkout Button */}
      {items.length > 0 && (
        <div className="border-t border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-5 space-y-4">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-[#777777] dark:text-[#A8ABB2]">
              <span>Subtotal</span>
              <span className="font-bold text-[#353535] dark:text-[#F5F6F8] font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#777777] dark:text-[#A8ABB2]">
              <span>Envío</span>
              <span className="font-bold text-[#3C6E71] dark:text-[#4D8B8E]">
                {isFreeShipping ? 'GRATIS' : formatCurrency(15)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#353535] dark:text-[#F5F6F8] pt-2 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
              <span>Total Estimado</span>
              <span className="font-mono">
                {formatCurrency(subtotal + (isFreeShipping ? 0 : 15))}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] py-3.5 text-xs font-black text-white shadow-subtle hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-all transform active:scale-98 cursor-pointer"
          >
            <span>Realizar Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
