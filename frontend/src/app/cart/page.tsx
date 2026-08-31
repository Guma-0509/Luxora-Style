'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  AlertCircle,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const freeShippingThreshold = 150;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 15;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxRate = 0.18;
  const tax = Number((Math.max(subtotal - discount, 0) * taxRate).toFixed(2));
  const total = Number((Math.max(subtotal - discount, 0) + shippingCost + tax).toFixed(2));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError('');
    setIsValidatingCoupon(true);

    try {
      const res: any = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        subtotal,
      });

      if (res.data && res.data.valid) {
        setAppliedCoupon(res.data);
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err.message || 'Cupón inválido o no aplicable');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* 1. Breadcrumbs */}
        <nav className="text-xs text-[#777777] mb-6 flex items-center space-x-2">
          <Link href="/" className="hover:text-[#353535]">Inicio</Link>
          <span>/</span>
          <span className="text-[#353535] font-bold">Carrito de Compras</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-black text-[#353535] tracking-tight mb-8">
          Tu Carrito de Compras ({items.length} {items.length === 1 ? 'artículo' : 'artículos'})
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9D9D9] bg-[#FFFFFF] p-16 text-center shadow-subtle">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#D9D9D9]/30 border border-[#D9D9D9] text-[#777777] mb-4">
              <ShoppingBag className="h-9 w-9" />
            </div>
            <h2 className="text-xl font-black text-[#353535]">Tu carrito está vacío</h2>
            <p className="mt-2 text-xs text-[#777777] max-w-md">
              Aún no has agregado productos a tu pedido. Explora nuestras colecciones y añade tus favoritos.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#353535] px-6 py-3 text-xs font-bold text-white hover:bg-[#284B63] transition-colors shadow-subtle"
            >
              Explorar Catálogo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Items Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] shadow-subtle">
                <div className="divide-y divide-[#D9D9D9]/60">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 hover:bg-[#D9D9D9]/15 transition-colors"
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-[#D9D9D9]/30 border border-[#D9D9D9] p-1">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="h-full w-full object-contain rounded-xl"
                            />
                          )}
                        </div>
                        <div className="space-y-1">
                          <Link
                            href={`/products/${item.productSlug}`}
                            className="text-sm font-bold text-[#353535] hover:text-[#3C6E71] transition-colors line-clamp-2"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-xs font-semibold text-[#777777]">
                            Opción: <span className="text-[#353535] font-bold">{item.title}</span>
                          </p>
                          <p className="text-xs text-[#777777] font-mono">SKU: {item.sku}</p>
                          <p className="text-sm font-black text-[#353535] sm:hidden mt-2 font-mono">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t border-[#D9D9D9] sm:border-t-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-1 shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-xl text-[#353535] hover:bg-[#D9D9D9]/40 transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#353535] font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="flex h-7 w-7 items-center justify-center rounded-xl text-[#353535] hover:bg-[#D9D9D9]/40 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Total Item Price */}
                        <div className="hidden sm:block text-right min-w-[90px]">
                          <span className="text-base font-black text-[#353535] font-mono">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <p className="text-[10px] text-[#777777] font-mono">
                            {formatCurrency(item.price)} c/u
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="rounded-xl p-2 text-[#777777] hover:bg-[#D9D9D9]/40 hover:text-[#353535] transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-[#D9D9D9] bg-[#FFFFFF] p-4 px-6 text-xs">
                  <Link
                    href="/"
                    className="font-bold text-[#3C6E71] hover:text-[#284B63] flex items-center gap-1"
                  >
                    ← Seguir comprando
                  </Link>
                  <button
                    onClick={clearCart}
                    className="font-semibold text-[#777777] hover:text-[#353535] transition-colors cursor-pointer"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>

              {/* Value Guarantees */}
              <div className="grid grid-cols-3 gap-4 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-5 text-center text-xs shadow-subtle">
                <div className="flex flex-col items-center">
                  <Truck className="h-5 w-5 text-[#3C6E71] mb-1" />
                  <span className="font-bold text-[#353535]">Envío Rápido</span>
                  <span className="text-[10px] text-[#777777]">Todo el país</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="h-5 w-5 text-[#3C6E71] mb-1" />
                  <span className="font-bold text-[#353535]">Pago 100% Seguro</span>
                  <span className="text-[10px] text-[#777777]">Encriptación SSL</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="h-5 w-5 text-[#3C6E71] mb-1" />
                  <span className="font-bold text-[#353535]">Garantía 30 Días</span>
                  <span className="text-[10px] text-[#777777]">Devolución fácil</span>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Free shipping meter */}
              <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-5 shadow-subtle space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#353535]">
                  <span>Progreso de Envío Gratis</span>
                  <span className="text-[#3C6E71] font-mono">{isFreeShipping ? '100%' : `${Math.round((subtotal / freeShippingThreshold) * 100)}%`}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#D9D9D9]">
                  <div
                    className="h-full bg-[#3C6E71] transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#777777]">
                  {isFreeShipping ? (
                    <span className="font-bold text-[#3C6E71]">¡Tu orden califica para Envío Gratis! 🎉</span>
                  ) : (
                    <>Agrega <strong className="text-[#353535]">{formatCurrency(freeShippingThreshold - subtotal)}</strong> más para envío gratis.</>
                  )}
                </p>
              </div>

              {/* Coupon input */}
              <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-5 shadow-subtle space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#353535] flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-[#3C6E71]" /> ¿Tienes un cupón de descuento?
                </h4>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-2xl bg-[#3C6E71]/10 border border-[#3C6E71] p-3 text-xs">
                    <div>
                      <span className="font-black text-[#3C6E71] font-mono">{appliedCoupon.code}</span>
                      <p className="text-[10px] text-[#777777]">Descuento: -{formatCurrency(appliedCoupon.discountAmount)}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-[#353535] hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ej. BIENVENIDO10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold uppercase text-[#353535] placeholder:normal-case placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="rounded-2xl bg-[#353535] px-4 py-2 text-xs font-bold text-white hover:bg-[#284B63] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isValidatingCoupon ? '...' : 'Aplicar'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] font-semibold text-[#353535] flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-[#3C6E71]" /> {couponError}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Summary */}
              <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#353535] pb-3 border-b border-[#D9D9D9]">
                  Resumen del Pedido
                </h3>

                <div className="space-y-2.5 text-xs text-[#777777]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#353535] font-mono">{formatCurrency(subtotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#3C6E71] font-bold">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Envío estimado</span>
                    <span>{isFreeShipping ? <strong className="text-[#3C6E71] font-bold">GRATIS</strong> : formatCurrency(shippingCost)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Impuestos (18% ITBIS)</span>
                    <span className="font-bold text-[#353535] font-mono">{formatCurrency(tax)}</span>
                  </div>

                  <div className="flex justify-between text-base font-black text-[#353535] pt-3 border-t border-[#D9D9D9]">
                    <span>Total a Pagar</span>
                    <span className="font-mono">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#353535] py-3.5 text-sm font-black text-white shadow-subtle hover:bg-[#284B63] transition-all transform active:scale-98 cursor-pointer"
                >
                  Proceder al Checkout <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
