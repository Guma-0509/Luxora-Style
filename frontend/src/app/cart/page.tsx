'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  openWhatsAppOrder,
  getStoreWhatsAppNumber,
  setStoreWhatsAppNumber,
} from '../../lib/whatsapp';
import { WhatsAppFilledIcon } from '../../components/common/WhatsAppIcon';
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
  PhoneCall,
  Settings2,
  Check,
  X,
  ExternalLink,
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

  // WhatsApp number configuration modal
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumberState] = useState('18095550199');
  const [phoneNotification, setPhoneNotification] = useState<string | null>(null);

  useEffect(() => {
    setWhatsAppNumberState(getStoreWhatsAppNumber());
  }, []);

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

  const handleSendToWhatsApp = () => {
    if (items.length === 0) return;
    openWhatsAppOrder(
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      discount,
      appliedCoupon?.code
    );
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreWhatsAppNumber(whatsAppNumber);
    setPhoneNotification('Número de WhatsApp actualizado correctamente');
    setTimeout(() => {
      setPhoneNotification(null);
      setIsPhoneModalOpen(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#18191A] text-[#353535] dark:text-[#F5F6F8] transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* 1. Breadcrumbs */}
        <nav className="text-xs text-[#777777] dark:text-[#A8ABB2] mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="hover:text-[#353535] dark:hover:text-[#F5F6F8]">Inicio</Link>
            <span>/</span>
            <span className="text-[#353535] dark:text-[#F5F6F8] font-bold">Carrito de Compras</span>
          </div>

          <button
            onClick={() => setIsPhoneModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] px-3 py-1 text-[11px] font-bold text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-[#F5F6F8] transition-colors cursor-pointer"
          >
            <WhatsAppFilledIcon className="h-3.5 w-3.5 text-[#3C6E71] dark:text-[#4D8B8E]" />
            <span>WhatsApp: +{whatsAppNumber}</span>
            <Settings2 className="h-3 w-3 ml-0.5" />
          </button>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight mb-8">
          Tu Carrito de Compras ({items.length} {items.length === 1 ? 'artículo' : 'artículos'})
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-16 text-center shadow-subtle">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#D9D9D9]/30 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C] text-[#777777] dark:text-[#A8ABB2] mb-4">
              <ShoppingBag className="h-9 w-9" />
            </div>
            <h2 className="text-xl font-black text-[#353535] dark:text-[#F5F6F8]">Tu carrito está vacío</h2>
            <p className="mt-2 text-xs text-[#777777] dark:text-[#A8ABB2] max-w-md">
              Aún no has agregado productos a tu pedido. Explora nuestras colecciones y añade tus favoritos.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-6 py-3 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-colors shadow-subtle cursor-pointer"
            >
              Explorar Catálogo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Items Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] shadow-subtle">
                <div className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 hover:bg-[#D9D9D9]/15 dark:hover:bg-[#2E3236]/40 transition-colors"
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-[#D9D9D9]/30 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C] p-1">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="h-full w-full object-contain rounded-xl"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#D9D9D9]/40 dark:bg-[#3A3B3C] text-[10px] text-[#777777]">
                              Foto
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Link
                            href={`/products/${item.productSlug}`}
                            className="text-sm font-bold text-[#353535] dark:text-[#F5F6F8] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-colors line-clamp-2"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-xs font-semibold text-[#777777] dark:text-[#A8ABB2]">
                            Opción: <span className="text-[#353535] dark:text-[#F5F6F8] font-bold">{item.title}</span>
                          </p>
                          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] font-mono">SKU: {item.sku}</p>
                          <p className="text-sm font-black text-[#353535] dark:text-[#F5F6F8] sm:hidden mt-2 font-mono">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t border-[#D9D9D9] dark:border-[#3A3B3C] sm:border-t-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] p-1 shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-xl text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/40 dark:hover:bg-[#2E3236] transition-colors cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#353535] dark:text-[#F5F6F8]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="flex h-7 w-7 items-center justify-center rounded-xl text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/40 dark:hover:bg-[#2E3236] disabled:opacity-30 transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price Subtotal */}
                        <div className="text-right min-w-[90px]">
                          <p className="font-mono text-base font-black text-[#353535] dark:text-[#F5F6F8]">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-[10px] text-[#777777] dark:text-[#A8ABB2] font-mono">
                            {formatCurrency(item.price)} c/u
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="rounded-xl p-2 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] hover:text-[#353535] dark:hover:text-[#F5F6F8] transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/10 dark:bg-[#1E1F20]/50 p-4">
                  <Link
                    href="/"
                    className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] flex items-center gap-1.5"
                  >
                    &larr; Seguir comprando
                  </Link>

                  <button
                    onClick={clearCart}
                    className="text-xs font-bold text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-[#F5F6F8] transition-colors cursor-pointer"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 shadow-subtle text-center">
                <div className="flex flex-col items-center space-y-1">
                  <Truck className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                  <span className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8]">Envío Rápido</span>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">Todo el país</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <ShieldCheck className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                  <span className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8]">Atención Directa</span>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">Vía WhatsApp</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <RotateCcw className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                  <span className="text-xs font-bold text-[#353535] dark:text-[#F5F6F8]">Garantía 30 Días</span>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">Devolución fácil</span>
                </div>
              </div>
            </div>

            {/* Right: Order Summary & WhatsApp Action */}
            <div className="space-y-6">
              {/* Free Shipping Alert */}
              <div className="rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 shadow-subtle">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-[#353535] dark:text-[#F5F6F8]">
                    {isFreeShipping ? '¡Envío Gratis Activado!' : 'Envío Gratis'}
                  </span>
                  <span className="font-mono text-[#3C6E71] dark:text-[#4D8B8E]">
                    {isFreeShipping ? '100%' : `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%`}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#D9D9D9] dark:bg-[#3A3B3C]">
                  <div
                    className="h-full bg-[#3C6E71] dark:bg-[#4D8B8E] transition-all rounded-full"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-[#777777] dark:text-[#A8ABB2]">
                  {isFreeShipping ? (
                    <span className="font-bold text-[#3C6E71] dark:text-[#4D8B8E]">¡Tu orden califica para Envío Gratis! 🎉</span>
                  ) : (
                    <>
                      Agrega <strong className="text-[#353535] dark:text-[#F5F6F8]">{formatCurrency(freeShippingThreshold - subtotal)}</strong> más para obtener envío gratuito.
                    </>
                  )}
                </p>
              </div>

              {/* Coupon Form */}
              <div className="rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 shadow-subtle space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] uppercase tracking-wider">
                  <Tag className="h-4 w-4 text-[#3C6E71] dark:text-[#4D8B8E]" />
                  <span>¿Tienes un cupón de descuento?</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-2xl bg-[#3C6E71]/15 dark:bg-[#4D8B8E]/20 p-3 text-xs text-[#3C6E71] dark:text-[#4D8B8E] font-bold border border-[#3C6E71]/30">
                    <div>
                      <p>Cupón &quot;{appliedCoupon.code}&quot; aplicado</p>
                      <span className="text-[10px] font-normal">Descuento de {formatCurrency(appliedCoupon.discountAmount)}</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs underline hover:text-[#284B63] dark:hover:text-white cursor-pointer"
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
                        className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3 py-2 text-xs font-semibold uppercase text-[#353535] dark:text-[#F5F6F8] placeholder:normal-case placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-4 py-2 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isValidatingCoupon ? '...' : 'Aplicar'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] font-semibold text-[#353535] dark:text-[#F5F6F8] flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-[#3C6E71] dark:text-[#4D8B8E]" /> {couponError}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Summary & WHATSAPP ACTION BUTTON */}
              <div className="rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 shadow-subtle space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#353535] dark:text-[#F5F6F8] pb-3 border-b border-[#D9D9D9] dark:border-[#3A3B3C]">
                  Resumen del Pedido
                </h3>

                <div className="space-y-2.5 text-xs text-[#777777] dark:text-[#A8ABB2]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#353535] dark:text-[#F5F6F8] font-mono">{formatCurrency(subtotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#3C6E71] dark:text-[#4D8B8E] font-bold">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Envío estimado</span>
                    <span>{isFreeShipping ? <strong className="text-[#3C6E71] dark:text-[#4D8B8E] font-bold">GRATIS</strong> : formatCurrency(shippingCost)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Impuestos (18% ITBIS)</span>
                    <span className="font-bold text-[#353535] dark:text-[#F5F6F8] font-mono">{formatCurrency(tax)}</span>
                  </div>

                  <div className="flex justify-between text-base font-black text-[#353535] dark:text-[#F5F6F8] pt-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
                    <span>Total a Pagar</span>
                    <span className="font-mono">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* BOTÓN PRINCIPAL DE WHATSAPP */}
                <button
                  onClick={handleSendToWhatsApp}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] py-4 text-sm font-black text-white shadow-subtle hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-all transform active:scale-98 cursor-pointer"
                >
                  <WhatsAppFilledIcon className="h-5 w-5 text-[#3C6E71] dark:text-white" />
                  <span>Enviar Pedido a WhatsApp</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>

                <p className="text-[11px] text-center text-[#777777] dark:text-[#A8ABB2]">
                  Al hacer clic se enviará el detalle de tus productos seleccionados directamente al WhatsApp de la tienda.
                </p>

                <div className="pt-2 border-t border-[#D9D9D9]/60 dark:border-[#3A3B3C]/60 text-center">
                  <Link
                    href="/checkout"
                    className="text-xs font-bold text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-[#F5F6F8] transition-colors"
                  >
                    O continuar con Formulario Web &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CONFIGURAR NÚMERO DE WHATSAPP */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                <WhatsAppFilledIcon className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                Número de WhatsApp de la Tienda
              </h3>
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {phoneNotification && (
              <div className="flex items-center gap-2 rounded-2xl bg-[#3C6E71]/15 dark:bg-[#4D8B8E]/20 p-3 text-xs font-bold text-[#3C6E71] dark:text-[#4D8B8E] border border-[#3C6E71]/30">
                <Check className="h-4 w-4" />
                <span>{phoneNotification}</span>
              </div>
            )}

            <form onSubmit={handleSavePhone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">
                  Número de Teléfono con Código de País (sin signos ni espacios)
                </label>
                <input
                  type="text"
                  required
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumberState(e.target.value)}
                  placeholder="Ej. 18095550199 o 18295550199 o 52155..."
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] font-mono focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
                <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] mt-1 block">
                  A este número llegarán todos los pedidos enviados por los clientes desde el carrito.
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-4 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#3C6E71] dark:bg-[#4D8B8E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] shadow-subtle active:scale-98 cursor-pointer"
                >
                  Guardar Número
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
