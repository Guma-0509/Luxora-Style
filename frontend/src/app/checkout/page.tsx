'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Banknote,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getSubtotal } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  // Form State
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'DO',
    shippingMethod: 'STANDARD',
    paymentMethod: 'CREDIT_CARD',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    saveInfo: true,
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any | null>(null);

  const subtotal = getSubtotal();
  const freeShippingThreshold = 150;
  const isFreeShipping = subtotal >= freeShippingThreshold && formData.shippingMethod === 'STANDARD';
  const shippingCost = formData.shippingMethod === 'EXPRESS' ? 25 : isFreeShipping ? 0 : 15;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxRate = 0.18;
  const tax = Number((Math.max(subtotal - discount, 0) * taxRate).toFixed(2));
  const grandTotal = Number((Math.max(subtotal - discount, 0) + shippingCost + tax).toFixed(2));

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');

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
      setCouponError(err.message || 'Cupón inválido');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);

    try {
      const simulatedOrder = {
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        itemsCount: items.length,
        total: grandTotal,
        shippingAddress: `${formData.streetAddress}, ${formData.city}, ${formData.state}`,
        paymentMethod: formData.paymentMethod,
        customerEmail: formData.email,
        date: new Date().toISOString(),
      };

      await new Promise((resolve) => setTimeout(resolve, 1500));

      clearCart();
      setOrderComplete(simulatedOrder);
    } catch (err) {
      alert('Hubo un error procesando tu pedido. Por favor verifica tus datos.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Pantalla de Confirmación de Pedido Éxito
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
          <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-8 sm:p-12 shadow-card space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#3C6E71]/10 text-[#3C6E71]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#3C6E71]">
                ¡Pedido Confirmado con Éxito!
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#353535] tracking-tight mt-1">
                Gracias por tu compra, {formData.firstName}
              </h1>
              <p className="text-xs text-[#777777] mt-2">
                Hemos enviado los detalles del recibo y el número de seguimiento a{' '}
                <strong className="text-[#353535]">{orderComplete.customerEmail}</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-[#D9D9D9]/20 p-6 text-left space-y-3 text-xs border border-[#D9D9D9]">
              <div className="flex justify-between border-b border-[#D9D9D9] pb-2">
                <span className="text-[#777777]">Número de Orden:</span>
                <span className="font-mono font-black text-[#353535]">{orderComplete.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#D9D9D9] pb-2">
                <span className="text-[#777777]">Monto Total Pagado:</span>
                <span className="font-black text-[#353535] font-mono">{formatCurrency(orderComplete.total)}</span>
              </div>
              <div className="flex justify-between border-b border-[#D9D9D9] pb-2">
                <span className="text-[#777777]">Dirección de Entrega:</span>
                <span className="font-medium text-[#353535] text-right">{orderComplete.shippingAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Método de Pago:</span>
                <span className="font-bold text-[#353535]">{orderComplete.paymentMethod}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/"
                className="flex-1 rounded-2xl bg-[#353535] py-3.5 text-xs font-bold text-white hover:bg-[#284B63] transition-colors shadow-subtle"
              >
                Volver a la Tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <div className="mx-auto max-w-md text-center space-y-4 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-8 shadow-subtle">
          <h2 className="text-lg font-black text-[#353535]">No hay productos para el checkout</h2>
          <p className="text-xs text-[#777777]">Agrega productos a tu carrito antes de proceder al pago.</p>
          <Link
            href="/"
            className="inline-block rounded-2xl bg-[#353535] px-6 py-3 text-xs font-bold text-white hover:bg-[#284B63] transition-all shadow-subtle"
          >
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* 1. Header */}
        <div className="mb-8 border-b border-[#D9D9D9] pb-4 flex items-center justify-between">
          <div>
            <nav className="text-xs text-[#777777] mb-1">
              <Link href="/cart" className="hover:text-[#353535]">← Volver al Carrito</Link>
            </nav>
            <h1 className="text-2xl font-black text-[#353535] tracking-tight">Checkout Seguro</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#3C6E71]">
            <Lock className="h-4 w-4 text-[#3C6E71]" /> Encriptación SSL 256-bit
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left 2 Cols: Form Sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Customer Contact */}
            <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#353535] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#353535] text-xs text-white">1</span>
                Información de Contacto
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#353535] mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Apellido *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#353535] mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (809) 555-0199"
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#353535] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#353535] text-xs text-white">2</span>
                Dirección de Entrega
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#353535] mb-1">Calle y Número *</label>
                  <input
                    type="text"
                    name="streetAddress"
                    required
                    value={formData.streetAddress}
                    onChange={handleChange}
                    placeholder="Av. Winston Churchill #1099"
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#353535] mb-1">Apartamento / Edificio (Opcional)</label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    placeholder="Apt 4B"
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Ciudad *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Santo Domingo"
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Provincia / Estado *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Distrito Nacional"
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Código Postal</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="10148"
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">País</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  >
                    <option value="DO">República Dominicana</option>
                    <option value="US">Estados Unidos</option>
                    <option value="MX">México</option>
                    <option value="CO">Colombia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Shipping Method */}
            <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#353535] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#353535] text-xs text-white">3</span>
                Método de Envío
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                    formData.shippingMethod === 'STANDARD'
                      ? 'border-[#3C6E71] bg-[#3C6E71]/10'
                      : 'border-[#D9D9D9] hover:bg-[#D9D9D9]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="STANDARD"
                      checked={formData.shippingMethod === 'STANDARD'}
                      onChange={handleChange}
                      className="accent-[#3C6E71]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#353535]">Envío Estándar</p>
                      <p className="text-[11px] text-[#777777]">Entrega de 2 a 4 días laborables</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#353535] font-mono">
                    {isFreeShipping ? <span className="text-[#3C6E71]">GRATIS</span> : '$15.00'}
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                    formData.shippingMethod === 'EXPRESS'
                      ? 'border-[#3C6E71] bg-[#3C6E71]/10'
                      : 'border-[#D9D9D9] hover:bg-[#D9D9D9]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="EXPRESS"
                      checked={formData.shippingMethod === 'EXPRESS'}
                      onChange={handleChange}
                      className="accent-[#3C6E71]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#353535]">Envío Express Prioritario ⚡</p>
                      <p className="text-[11px] text-[#777777]">Entrega en 24 horas garantizada</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#353535] font-mono">$25.00</span>
                </label>
              </div>
            </div>

            {/* Step 4: Payment Method */}
            <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#353535] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#353535] text-xs text-white">4</span>
                Método de Pago
              </h2>
              <div className="space-y-3">
                {/* Credit Card */}
                <label
                  className={`flex flex-col rounded-2xl border p-4 transition-all ${
                    formData.paymentMethod === 'CREDIT_CARD'
                      ? 'border-[#3C6E71] bg-[#3C6E71]/10'
                      : 'border-[#D9D9D9] hover:bg-[#D9D9D9]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CREDIT_CARD"
                        checked={formData.paymentMethod === 'CREDIT_CARD'}
                        onChange={handleChange}
                        className="accent-[#3C6E71]"
                      />
                      <span className="text-xs font-bold text-[#353535] flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-[#3C6E71]" /> Tarjeta de Crédito / Débito
                      </span>
                    </div>
                    <div className="flex gap-1.5 text-[10px] font-bold text-[#777777]">
                      <span>VISA</span>
                      <span>MC</span>
                      <span>AMEX</span>
                    </div>
                  </div>

                  {formData.paymentMethod === 'CREDIT_CARD' && (
                    <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-[#D9D9D9]">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-[#353535] mb-1">Número de Tarjeta *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          required
                          placeholder="•••• •••• •••• 4242"
                          className="w-full rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] p-2 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#353535] mb-1">Expiración (MM/AA) *</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          required
                          placeholder="12/28"
                          className="w-full rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] p-2 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#353535] mb-1">CVC / CVV *</label>
                        <input
                          type="text"
                          name="cardCvc"
                          required
                          placeholder="123"
                          className="w-full rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] p-2 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* Cash On Delivery */}
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                    formData.paymentMethod === 'COD'
                      ? 'border-[#3C6E71] bg-[#3C6E71]/10'
                      : 'border-[#D9D9D9] hover:bg-[#D9D9D9]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="accent-[#3C6E71]"
                    />
                    <span className="text-xs font-bold text-[#353535] flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-[#3C6E71]" /> Pago Contra Entrega (Efectivo al recibir)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#777777]">Sin recargo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Order Summary & Action */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#353535] pb-3 border-b border-[#D9D9D9]">
                Resumen de la Compra
              </h3>

              {/* Mini Items List */}
              <div className="max-h-48 overflow-y-auto space-y-3 divide-y divide-[#D9D9D9]/60 pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 pt-2">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[#D9D9D9]/30 border border-[#D9D9D9]">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#353535] truncate">{item.productName}</p>
                      <p className="text-[10px] text-[#777777]">{item.title} × {item.quantity}</p>
                    </div>
                    <span className="text-xs font-black text-[#353535] font-mono">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="border-t border-[#D9D9D9] pt-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-[#3C6E71]/10 border border-[#3C6E71] p-2 text-xs font-bold text-[#3C6E71]">
                    <span>Cupón: {appliedCoupon.code}</span>
                    <span>-{formatCurrency(appliedCoupon.discountAmount)}</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de cupón"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-[#D9D9D9] px-3 py-1.5 text-xs uppercase text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="rounded-xl bg-[#353535] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#284B63] transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[10px] text-[#353535] mt-1">{couponError}</p>}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 border-t border-[#D9D9D9] pt-3 text-xs text-[#777777]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#353535] font-mono">{formatCurrency(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#3C6E71] font-bold">
                    <span>Descuento</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Costo de Envío</span>
                  <span>{shippingCost === 0 ? <strong className="text-[#3C6E71] font-bold">GRATIS</strong> : formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuesto (18% ITBIS)</span>
                  <span className="font-bold text-[#353535] font-mono">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#353535] pt-3 border-t border-[#D9D9D9]">
                  <span>Total a Pagar</span>
                  <span className="font-mono">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#353535] py-3.5 text-sm font-black text-white shadow-subtle hover:bg-[#284B63] transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Procesando Pedido...</span>
                ) : (
                  <>
                    Confirmar y Pagar <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-[#777777]">
                Al confirmar tu pedido, aceptas los términos de entrega de Wally Store.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
