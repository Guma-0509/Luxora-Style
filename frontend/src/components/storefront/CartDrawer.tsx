'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../lib/utils';

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, getSubtotal } =
    useCartStore();

  if (!isDrawerOpen) return null;

  const subtotal = getSubtotal();
  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-slate-900" />
              <h2 className="text-base font-bold text-slate-900">Tu Carrito ({items.length})</h2>
            </div>
            <button
              onClick={closeDrawer}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-slate-50 p-4 border-b border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>
                {subtotal >= freeShippingThreshold ? (
                  <strong className="text-emerald-600">¡Tienes Envío GRATIS! 🎉</strong>
                ) : (
                  <>
                    Faltan <strong>{formatCurrency(freeShippingThreshold - subtotal)}</strong> para envío gratis
                  </>
                )}
              </span>
              <span>{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Tu carrito está vacío</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  Explora nuestro catálogo y agrega los productos que más te gusten.
                </p>
                <button
                  onClick={closeDrawer}
                  className="mt-6 rounded-xl bg-primary-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-primary-800 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 rounded-xl border border-slate-100 p-3 hover:border-slate-200 transition-colors"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-200">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover object-center"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <Link
                          href={`/products/${item.productSlug}`}
                          onClick={closeDrawer}
                          className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-brand"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-slate-400 hover:text-red-600 transition-colors ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500">{item.title}</p>
                      <p className="text-xs font-extrabold text-slate-900 mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 p-4 sm:p-6 space-y-4 bg-slate-50">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío estimado</span>
                  <span>{subtotal >= freeShippingThreshold ? 'GRATIS' : '$15.00'}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal >= freeShippingThreshold ? subtotal : subtotal + 15)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all transform active:scale-98"
                >
                  Proceder al Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="flex w-full items-center justify-center rounded-xl bg-white border border-slate-300 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Ver Carrito Completo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
