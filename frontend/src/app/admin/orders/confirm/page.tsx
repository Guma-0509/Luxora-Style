'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import {
  getStoredOrders,
  saveOrdersStore,
  getStoredProducts,
  saveProductsCatalog,
} from '../../../../lib/catalogStore';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  ArrowLeft,
  Package,
  Clock,
  Truck,
  Phone,
  MapPin,
  User,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

function OrderConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id');

  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const loadOrder = () => {
    const all = getStoredOrders();
    setOrders(all);

    if (orderId) {
      const found = all.find((o) => o.id === orderId || o.orderNumber === orderId);
      if (found) {
        setCurrentOrder(found);
      } else if (all.length > 0) {
        setCurrentOrder(all[0]);
      }
    } else if (all.length > 0) {
      setCurrentOrder(all[0]);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleConfirmSale = () => {
    if (!currentOrder) return;

    // 1. Discount inventory for items in this order
    const allProducts = getStoredProducts();
    let inventoryModified = false;

    if (currentOrder.items && Array.isArray(currentOrder.items)) {
      currentOrder.items.forEach((item: any) => {
        allProducts.forEach((prod) => {
          if (prod.id === item.productId || prod.name === item.productName) {
            (prod.variants || []).forEach((v) => {
              if (v.sku === item.sku || v.title === item.title) {
                v.stock = Math.max(0, (v.stock || 0) - (item.quantity || 1));
                inventoryModified = true;
              }
            });
          }
        });
      });
    }

    if (inventoryModified) {
      saveProductsCatalog(allProducts);
    }

    // 2. Update order status to PAID / CONFIRMED
    const updated = orders.map((o) =>
      o.id === currentOrder.id
        ? {
            ...o,
            status: 'PAID',
            paymentStatus: 'Aprobado & Pagado',
            confirmedAt: new Date().toISOString(),
          }
        : o,
    );

    saveOrdersStore(updated);
    setOrders(updated);
    setCurrentOrder((prev: any) => ({
      ...prev,
      status: 'PAID',
      paymentStatus: 'Aprobado & Pagado',
      confirmedAt: new Date().toISOString(),
    }));

    setNotification({
      message: `¡Venta de la orden ${currentOrder.orderNumber} confirmada exitosamente! Ya se sumó a los Ingresos Netos del Dashboard.`,
      type: 'success',
    });
  };

  const handleCancelSale = () => {
    if (!currentOrder) return;

    const updated = orders.map((o) =>
      o.id === currentOrder.id
        ? {
            ...o,
            status: 'CANCELLED',
            paymentStatus: 'Cancelado / No Concretada',
            cancelledAt: new Date().toISOString(),
          }
        : o,
    );

    saveOrdersStore(updated);
    setOrders(updated);
    setCurrentOrder((prev: any) => ({
      ...prev,
      status: 'CANCELLED',
      paymentStatus: 'Cancelado / No Concretada',
      cancelledAt: new Date().toISOString(),
    }));

    setNotification({
      message: `La orden ${currentOrder.orderNumber} ha sido marcada como Venta No Concretada (Cancelada).`,
      type: 'info',
    });
  };

  const handleResetToPending = () => {
    if (!currentOrder) return;

    const updated = orders.map((o) =>
      o.id === currentOrder.id
        ? {
            ...o,
            status: 'PENDING_CONFIRMATION',
            paymentStatus: 'Pendiente de Confirmación',
          }
        : o,
    );

    saveOrdersStore(updated);
    setOrders(updated);
    setCurrentOrder((prev: any) => ({
      ...prev,
      status: 'PENDING_CONFIRMATION',
      paymentStatus: 'Pendiente de Confirmación',
    }));

    setNotification({
      message: `Orden ${currentOrder.orderNumber} devuelta a estado Pendiente.`,
      type: 'info',
    });
  };

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] dark:bg-[#18191A] text-[#353535] dark:text-[#F5F6F8] p-6 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-4 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-8 shadow-subtle">
          <ShoppingCart className="h-12 w-12 text-[#777777] mx-auto opacity-50" />
          <h2 className="text-lg font-black">No se encontró la orden solicitada</h2>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2]">
            Es posible que el enlace haya expirado o la orden haya sido eliminada del sistema.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-2xl bg-[#3C6E71] dark:bg-[#4D8B8E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] transition-all shadow-subtle"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = currentOrder.status === 'PAID' || currentOrder.status === 'SHIPPED' || currentOrder.status === 'DELIVERED';
  const isCancelled = currentOrder.status === 'CANCELLED';
  const isPending = !isConfirmed && !isCancelled;

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-[#18191A] text-[#353535] dark:text-[#F5F6F8] p-4 sm:p-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] px-3.5 py-2 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] transition-all shadow-subtle"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Dashboard</span>
          </Link>

          <Link
            href="/admin/dashboard/orders"
            className="text-xs font-bold text-[#3C6E71] dark:text-[#4D8B8E] hover:underline"
          >
            Ver todos los pedidos
          </Link>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`flex items-center gap-2.5 rounded-2xl p-4 text-xs font-bold shadow-subtle border animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-[#FFFFFF] dark:bg-[#242526] border-[#3C6E71] dark:border-[#4D8B8E] text-[#3C6E71] dark:text-[#4D8B8E]'
                : notification.type === 'info'
                ? 'bg-[#FFFFFF] dark:bg-[#242526] border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-[#FFFFFF] dark:bg-[#242526] border-red-500/40 text-red-600 dark:text-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#3C6E71] dark:text-[#4D8B8E]" />
            ) : (
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Status Hero Card */}
        <div
          className={`rounded-3xl border p-6 sm:p-8 shadow-subtle space-y-4 transition-all ${
            isConfirmed
              ? 'bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/15 border-[#3C6E71]/40 dark:border-[#4D8B8E]/40'
              : isCancelled
              ? 'bg-red-500/10 dark:bg-red-500/15 border-red-500/30 dark:border-red-500/40'
              : 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 dark:border-amber-500/40'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                  isConfirmed
                    ? 'bg-[#3C6E71] text-white border-[#3C6E71]'
                    : isCancelled
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-amber-500 text-white border-amber-500'
                }`}
              >
                {isConfirmed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : isCancelled ? (
                  <XCircle className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                  Estado de la Venta por WhatsApp
                </span>
                <h2 className="text-xl font-black tracking-tight">
                  {isConfirmed
                    ? 'VENTA CONFIRMADA & PAGADA ✅'
                    : isCancelled
                    ? 'VENTA NO CONCRETADA / CANCELADA ❌'
                    : 'PENDIENTE DE CONFIRMACIÓN ⏳'}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] block">
                Total del Pedido
              </span>
              <span className="font-mono text-2xl font-black text-[#3C6E71] dark:text-[#4D8B8E]">
                {formatCurrency(currentOrder.grandTotal)}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#777777] dark:text-[#A8ABB2]">
            {isConfirmed
              ? 'Esta venta ha sido confirmada. El monto ya está sumado en los Ingresos Netos del Dashboard y el stock de los productos ha sido actualizado.'
              : isCancelled
              ? 'Esta venta fue cancelada o rechazada. No se sumará a los ingresos del Dashboard y las existencias se mantienen intactas.'
              : 'El cliente envió este pedido por WhatsApp. Confirma a continuación si recibiste el pago y completaste la venta para reflejarla en el Dashboard.'}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {!isConfirmed && (
              <button
                onClick={handleConfirmSale}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#3C6E71] dark:bg-[#4D8B8E] hover:bg-[#284B63] dark:hover:bg-[#3C6E71] px-5 py-3 text-xs font-bold text-white shadow-subtle active:scale-98 transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar Venta Realizada (Pagada)</span>
              </button>
            )}

            {!isCancelled && (
              <button
                onClick={handleCancelSale}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 hover:bg-red-600 hover:text-white px-5 py-3 text-xs font-bold text-red-600 dark:text-red-400 dark:hover:text-white shadow-subtle active:scale-98 transition-all cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                <span>Marcar Venta No Concretada</span>
              </button>
            )}

            {(isConfirmed || isCancelled) && (
              <button
                onClick={handleResetToPending}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] px-4 py-3 text-xs font-bold text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-white transition-all shadow-subtle cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Volver a Pendiente</span>
              </button>
            )}
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-4">
            <div>
              <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">Detalles de la Orden</h3>
              <p className="text-xs font-mono text-[#3C6E71] dark:text-[#4D8B8E] mt-0.5">{currentOrder.orderNumber}</p>
            </div>
            <span className="text-[11px] font-mono text-[#777777] dark:text-[#A8ABB2]">
              {formatDate(currentOrder.createdAt)}
            </span>
          </div>

          {/* Customer Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C] text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] flex items-center gap-1">
                <User className="h-3 w-3" /> Datos del Cliente
              </span>
              <p className="font-bold text-sm text-[#353535] dark:text-[#F5F6F8]">{currentOrder.customerName}</p>
              {currentOrder.phone && (
                <p className="text-[#777777] dark:text-[#A8ABB2] flex items-center gap-1 font-mono">
                  <Phone className="h-3 w-3" /> {currentOrder.phone}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Dirección de Envío
              </span>
              <p className="text-xs text-[#353535] dark:text-[#F5F6F8] font-medium">{currentOrder.shippingAddress}</p>
              <p className="text-[10px] text-[#3C6E71] dark:text-[#4D8B8E] font-bold">Método: {currentOrder.paymentMethod}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-[#A8ABB2]">
              Productos en la Orden ({currentOrder.itemsCount} unidades)
            </h4>

            <div className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60 border border-[#D9D9D9] dark:border-[#3A3B3C] rounded-2xl overflow-hidden bg-[#FFFFFF] dark:bg-[#1E1F20]">
              {(currentOrder.items || []).map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.productName} className="h-10 w-10 object-cover rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C]" />
                    )}
                    <div>
                      <p className="font-bold text-xs text-[#353535] dark:text-[#F5F6F8]">{item.productName}</p>
                      <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">
                        {item.title} | SKU: {item.sku}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-black text-[#353535] dark:text-[#F5F6F8] block">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">
                      {item.quantity} x {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="p-4 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C] space-y-2 text-xs">
            <div className="flex justify-between text-[#777777] dark:text-[#A8ABB2]">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-[#353535] dark:text-[#F5F6F8]">
                {formatCurrency(currentOrder.subtotal || currentOrder.grandTotal * 0.82)}
              </span>
            </div>
            {currentOrder.discount > 0 && (
              <div className="flex justify-between text-[#3C6E71] dark:text-[#4D8B8E]">
                <span>Descuento {currentOrder.couponCode ? `(${currentOrder.couponCode})` : ''}</span>
                <span className="font-mono font-bold">-{formatCurrency(currentOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#777777] dark:text-[#A8ABB2]">
              <span>Envío</span>
              <span className="font-mono font-bold text-[#353535] dark:text-[#F5F6F8]">
                {currentOrder.shippingCost === 0 ? 'GRATIS' : formatCurrency(currentOrder.shippingCost || 0)}
              </span>
            </div>
            <div className="flex justify-between text-[#777777] dark:text-[#A8ABB2]">
              <span>Impuestos (18% ITBIS)</span>
              <span className="font-mono font-bold text-[#353535] dark:text-[#F5F6F8]">
                {formatCurrency(currentOrder.tax || currentOrder.grandTotal * 0.18)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#D9D9D9] dark:border-[#3A3B3C] text-sm">
              <strong className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">Total Final</strong>
              <strong className="font-mono text-xl font-black text-[#3C6E71] dark:text-[#4D8B8E]">
                {formatCurrency(currentOrder.grandTotal)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#777777]">Cargando confirmación de pedido...</div>}>
      <OrderConfirmContent />
    </Suspense>
  );
}
