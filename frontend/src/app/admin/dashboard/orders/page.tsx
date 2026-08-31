'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import {
  ShoppingCart,
  Search,
  Truck,
  Edit2,
  Check,
  AlertCircle,
  X,
  Package,
} from 'lucide-react';

const INITIAL_ORDERS = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-20260830-4921',
    customerName: 'Carlos Mendoza',
    email: 'carlos@wallystore.com',
    itemsCount: 3,
    itemsDescription: 'Nike Air Jordan 1 Retro (42), T-Shirt Oversize (M)',
    createdAt: new Date().toISOString(),
    grandTotal: 225.0,
    paymentMethod: 'Tarjeta de Crédito',
    paymentStatus: 'Aprobado',
    status: 'PAID',
    carrier: 'FedEx Express',
    trackingNumber: 'FDX-893019284',
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-20260830-8812',
    customerName: 'Mariana Reyes',
    email: 'mariana.reyes@email.com',
    itemsCount: 2,
    itemsDescription: 'Dior Sauvage EDP 100ml, Gorra NY Yankees',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    grandTotal: 173.0,
    paymentMethod: 'Transferencia Bancaria',
    paymentStatus: 'Verificado',
    status: 'PROCESSING',
    carrier: 'DHL Express',
    trackingNumber: 'DHL-449102941',
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-20260829-1092',
    customerName: 'David Gómez',
    email: 'david.gomez@gmail.com',
    itemsCount: 4,
    itemsDescription: 'Adidas Ultraboost (41), Jeans Slim Fit (32), Reloj Casio',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    grandTotal: 278.98,
    paymentMethod: 'Tarjeta de Débito',
    paymentStatus: 'Aprobado',
    status: 'SHIPPED',
    carrier: 'FedEx Express',
    trackingNumber: 'FDX-994012485',
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-20260828-0044',
    customerName: 'Lucía Fernández',
    email: 'lucia.f@hotmail.com',
    itemsCount: 1,
    itemsDescription: 'Bleu de Chanel Parfum 100ml',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    grandTotal: 165.0,
    paymentMethod: 'Tarjeta de Crédito',
    paymentStatus: 'Aprobado',
    status: 'DELIVERED',
    carrier: 'DHL Express',
    trackingNumber: 'DHL-102948172',
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('PAID');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('FedEx Express');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    api
      .get('/admin/orders')
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setOrders(
            res.data.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              customerName: `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || 'Cliente',
              email: o.user?.email || 'N/A',
              itemsCount: o.items?.length || 1,
              itemsDescription: o.items?.map((i: any) => i.title).join(', ') || 'Artículos de moda',
              createdAt: o.createdAt,
              grandTotal: Number(o.grandTotal),
              paymentMethod: o.payment?.method || 'Tarjeta',
              paymentStatus: o.payment?.status || 'Aprobado',
              status: o.status,
              carrier: o.carrier || 'FedEx Express',
              trackingNumber: o.trackingNumber || '',
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenEdit = (ord: any) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setTrackingNumber(ord.trackingNumber || '');
    setCarrier(ord.carrier || 'FedEx Express');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await api
        .patch(`/admin/orders/${selectedOrder.id}/status`, {
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
        })
        .catch(() => {});

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: newStatus, trackingNumber, carrier }
            : o,
        ),
      );

      setNotification({
        message: `Orden ${selectedOrder.orderNumber} actualizada a estado: ${newStatus}`,
        type: 'success',
      });
      setSelectedOrder(null);
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification({ message: 'Error al actualizar pedido', type: 'error' });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="h-6 w-6 text-[#3C6E71]" />
            Gestión de Pedidos & Ventas
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Supervisa el flujo de ventas, estados de entrega y números de guía courier
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-bold shadow-subtle border ${
            notification.type === 'success'
              ? 'bg-[#FFFFFF] border-[#3C6E71] text-[#3C6E71]'
              : 'bg-[#FFFFFF] border-[#D9D9D9] text-[#353535]'
          }`}
        >
          <Check className="h-4 w-4 text-[#3C6E71]" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Buscar por # de orden, cliente o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2 pl-10 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777]" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
        >
          <option value="ALL">Todos los Estados</option>
          <option value="PENDING">Pendiente de Pago</option>
          <option value="PAID">Pagado (PAID)</option>
          <option value="PROCESSING">En Preparación (PROCESSING)</option>
          <option value="SHIPPED">Despachado (SHIPPED)</option>
          <option value="DELIVERED">Entregado (DELIVERED)</option>
          <option value="CANCELLED">Cancelado (CANCELLED)</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#353535]">
            <thead className="border-b border-[#D9D9D9] bg-[#D9D9D9]/20 text-[11px] uppercase tracking-wider text-[#777777]">
              <tr>
                <th className="py-3.5 px-4">Orden & Guía</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Pago</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#D9D9D9]/15 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-[#353535] block">{ord.orderNumber}</span>
                    {ord.trackingNumber ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#3C6E71] font-mono mt-0.5">
                        <Truck className="h-3 w-3 text-[#3C6E71]" /> {ord.carrier}: {ord.trackingNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#777777]">Sin guía asignada</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#353535]">{ord.customerName}</p>
                    <p className="text-[10px] text-[#777777]">{ord.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-[#777777] font-mono text-[11px]">
                    {formatDate(ord.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#353535] font-mono">
                    {formatCurrency(ord.grandTotal)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#353535] block">{ord.paymentMethod}</span>
                    <span className="text-[10px] font-bold text-[#3C6E71]">{ord.paymentStatus}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block rounded-full bg-[#3C6E71]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#3C6E71]">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(ord)}
                      className="inline-flex items-center gap-1 rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#353535] hover:bg-[#353535] hover:text-white transition-all cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" /> Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-3">
              <div>
                <h3 className="text-base font-black text-[#353535] flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#3C6E71]" />
                  Actualizar Pedido
                </h3>
                <p className="text-xs font-mono text-[#777777] mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-1.5 text-[#777777] hover:bg-[#D9D9D9]/30 hover:text-[#353535]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Estado del Pedido *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                >
                  <option value="PAID">PAID (Pagado)</option>
                  <option value="PROCESSING">PROCESSING (En Preparación / Empaque)</option>
                  <option value="SHIPPED">SHIPPED (Despachado con Guía)</option>
                  <option value="DELIVERED">DELIVERED (Entregado al Cliente)</option>
                  <option value="CANCELLED">CANCELLED (Cancelado & Devolución)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Empresa de Mensajería / Courier
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Ej. FedEx Express, DHL, Servientrega"
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Número de Guía / Tracking
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ej. FDX-993019284"
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#D9D9D9]">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] py-2.5 text-xs font-bold text-[#353535] hover:bg-[#D9D9D9]/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-[#3C6E71] py-2.5 text-xs font-bold text-white hover:bg-[#284B63] shadow-subtle active:scale-98 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
