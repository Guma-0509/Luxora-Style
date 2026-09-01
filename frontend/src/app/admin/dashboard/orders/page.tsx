'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import {
  ShoppingCart,
  Search,
  Truck,
  Edit2,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { getStoredOrders, saveOrdersStore, deleteAllOrdersStore } from '../../../../lib/catalogStore';

const INITIAL_ORDERS: any[] = [];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<any | null>(null);
  const [selectedOrderForView, setSelectedOrderForView] = useState<any | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('PAID');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('FedEx Express');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const local = getStoredOrders();
    if (typeof window !== 'undefined' && localStorage.getItem('luxora_orders_initialized')) {
      setOrders(local);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxora_orders_initialized', 'true');
        saveOrdersStore(INITIAL_ORDERS);
      }
      setOrders(INITIAL_ORDERS);
    }
  }, []);

  const handleOpenView = (ord: any) => {
    setSelectedOrderForView(ord);
  };

  const handleOpenEdit = (ord: any) => {
    setSelectedOrderForEdit(ord);
    setNewStatus(ord.status);
    setTrackingNumber(ord.trackingNumber || '');
    setCarrier(ord.carrier || 'FedEx Express');
  };

  const handleConfirmDeleteOrder = () => {
    if (!orderToDelete) return;
    const num = orderToDelete.orderNumber;
    const updated = orders.filter((o) => o.id !== orderToDelete.id);
    setOrders(updated);
    saveOrdersStore(updated);
    setOrderToDelete(null);
    setNotification({
      message: `Orden "${num}" eliminada exitosamente`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleConfirmClearAllOrders = () => {
    deleteAllOrdersStore();
    setOrders([]);
    setIsClearAllModalOpen(false);
    setNotification({
      message: 'Se han eliminado todas las órdenes del registro',
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForEdit) return;

    try {
      await api
        .patch(`/admin/orders/${selectedOrderForEdit.id}/status`, {
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
        })
        .catch(() => {});

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderForEdit.id
            ? { ...o, status: newStatus, trackingNumber, carrier }
            : o,
        ),
      );

      setNotification({
        message: `Orden ${selectedOrderForEdit.orderNumber} actualizada a estado: ${newStatus}`,
        type: 'success',
      });
      setSelectedOrderForEdit(null);
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
          <h1 className="text-2xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="h-6 w-6 text-[#3C6E71] dark:text-[#4D8B8E]" />
            Gestión de Pedidos & Ventas
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1">
            Supervisa compras, clientes, estados de envío y números de seguimiento
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {orders.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-3.5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vaciar Todo ({orders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-bold shadow-subtle border animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-[#FFFFFF] dark:bg-[#242526] border-[#3C6E71] dark:border-[#4D8B8E] text-[#3C6E71] dark:text-[#4D8B8E]'
              : 'bg-[#FFFFFF] dark:bg-[#242526] border-[#D9D9D9] dark:border-[#3A3B3C] text-[#353535] dark:text-[#F5F6F8]'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-[#3C6E71] dark:text-[#4D8B8E]" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Buscar por # de orden, cliente o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2 pl-10 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777] dark:text-[#A8ABB2]" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2 text-xs font-bold text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-[#F5F6F8]"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3 py-2 text-xs text-[#353535] dark:text-[#F5F6F8] font-bold focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PAID">Pagados</option>
            <option value="PROCESSING">En Proceso</option>
            <option value="SHIPPED">Enviados</option>
            <option value="DELIVERED">Entregados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Orden / Guía</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Monto Total</th>
                <th className="py-3.5 px-4">Pago</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60 text-[#353535] dark:text-[#F5F6F8]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#777777] dark:text-[#A8ABB2]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingCart className="h-8 w-8 text-[#777777] opacity-40" />
                      <p className="font-bold text-[#353535] dark:text-[#F5F6F8]">No hay pedidos registrados</p>
                      <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Los pedidos completados aparecerán listados aquí.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#D9D9D9]/15 dark:hover:bg-[#2E3236]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#353535] dark:text-[#F5F6F8] block">{ord.orderNumber}</span>
                      {ord.trackingNumber ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#3C6E71] dark:text-[#4D8B8E] font-mono mt-0.5">
                          <Truck className="h-3 w-3" /> {ord.carrier}: {ord.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">Sin guía asignada</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#353535] dark:text-[#F5F6F8]">{ord.customerName}</p>
                      <p className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">{ord.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-[#777777] dark:text-[#A8ABB2] font-mono text-[11px]">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#353535] dark:text-[#F5F6F8] font-mono">
                      {formatCurrency(ord.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#353535] dark:text-[#F5F6F8] block">{ord.paymentMethod}</span>
                      <span className="text-[10px] font-bold text-[#3C6E71] dark:text-[#4D8B8E]">{ord.paymentStatus}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-full bg-[#3C6E71]/15 dark:bg-[#4D8B8E]/20 text-[#3C6E71] dark:text-[#4D8B8E] border border-[#3C6E71]/30 px-2.5 py-0.5 text-[10px] font-bold">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* VER */}
                        <button
                          onClick={() => handleOpenView(ord)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-2.5 py-1.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-all shadow-subtle cursor-pointer"
                          title="Ver Detalle"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                          <span>Ver</span>
                        </button>

                        {/* EDITAR */}
                        <button
                          onClick={() => handleOpenEdit(ord)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#3C6E71]/40 dark:border-[#4D8B8E]/40 bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 px-2.5 py-1.5 text-xs font-bold text-[#3C6E71] dark:text-[#4D8B8E] hover:bg-[#3C6E71] hover:text-white dark:hover:bg-[#4D8B8E] dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                          title="Editar Pedido"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </button>

                        {/* BORRAR */}
                        <button
                          onClick={() => setOrderToDelete(ord)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                          title="Eliminar Pedido"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Borrar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE SINGLE ORDER MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 dark:border-red-500/40 bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">¿Eliminar Pedido?</h3>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button
                onClick={() => setOrderToDelete(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
              <strong className="text-sm font-black text-[#353535] dark:text-[#F5F6F8]">{orderToDelete.orderNumber}</strong>
              <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-0.5">Cliente: {orderToDelete.customerName} ({orderToDelete.email})</p>
              <p className="text-xs font-mono font-bold text-[#3C6E71] dark:text-[#4D8B8E] mt-1">Total: {formatCurrency(orderToDelete.grandTotal)}</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-4 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                className="rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-subtle active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sí, Eliminar Pedido</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL ORDERS MODAL */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 dark:border-red-500/40 bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">¿Vaciar Todo el Historial de Pedidos?</h3>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Se eliminarán {orders.length} órdenes</p>
                </div>
              </div>
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#777777] dark:text-[#A8ABB2]">
              ¿Estás seguro de que deseas eliminar <strong>todos los pedidos</strong> ({orders.length} registros)?
              El historial de ventas se vaciará por completo.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-4 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllOrders}
                className="rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-subtle active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sí, Vaciar Todo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div>
                <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                  Detalle del Pedido
                </h3>
                <p className="text-xs font-mono text-[#3C6E71] dark:text-[#4D8B8E] mt-0.5">{selectedOrderForView.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Cliente</span>
                  <strong className="text-[#353535] dark:text-[#F5F6F8]">{selectedOrderForView.customerName}</strong>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">{selectedOrderForView.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Estado</span>
                  <strong className="text-[#3C6E71] dark:text-[#4D8B8E]">{selectedOrderForView.status}</strong>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">{selectedOrderForView.paymentMethod}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Dirección de Entrega</span>
                <p className="text-xs text-[#353535] dark:text-[#F5F6F8] font-medium">{selectedOrderForView.shippingAddress}</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Artículos ({selectedOrderForView.itemsCount})</span>
                <p className="text-xs text-[#353535] dark:text-[#F5F6F8] font-medium">{selectedOrderForView.itemsDescription}</p>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 border border-[#3C6E71]/30">
                <span className="font-bold text-[#353535] dark:text-[#F5F6F8]">Total Pagado:</span>
                <span className="font-mono font-black text-base text-[#3C6E71] dark:text-[#4D8B8E]">
                  {formatCurrency(selectedOrderForView.grandTotal)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C] flex justify-end">
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-5 py-2.5 text-xs font-bold text-white shadow-subtle cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {selectedOrderForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div>
                <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                  Actualizar Pedido
                </h3>
                <p className="text-xs font-mono text-[#777777] dark:text-[#A8ABB2] mt-0.5">{selectedOrderForEdit.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForEdit(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">
                  Estado del Pedido *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] p-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                >
                  <option value="PAID">PAID (Pagado)</option>
                  <option value="PROCESSING">PROCESSING (En Preparación / Empaque)</option>
                  <option value="SHIPPED">SHIPPED (Despachado con Guía)</option>
                  <option value="DELIVERED">DELIVERED (Entregado al Cliente)</option>
                  <option value="CANCELLED">CANCELLED (Cancelado & Devolución)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">
                  Empresa de Envío / Courier
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Ej. FedEx Express, DHL, Envía..."
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2 text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">
                  Número de Guía / Tracking
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ej. FDX-893019284"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2 font-mono text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForEdit(null)}
                  className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-4 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#3C6E71] dark:bg-[#4D8B8E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] shadow-subtle active:scale-98 cursor-pointer"
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
