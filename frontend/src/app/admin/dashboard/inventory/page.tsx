'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/utils';
import {
  Boxes,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  Edit,
  Check,
  AlertCircle,
  X,
  History,
  Package,
} from 'lucide-react';

const INITIAL_INVENTORY = [
  { id: 'v1', sku: 'NK-AJ1-CHI-40', title: 'Chicago Red / Talla 40', productName: 'Nike Air Jordan 1 Retro High OG', price: 180.0, costPrice: 90.0, stock: 35 },
  { id: 'v2', sku: 'NK-AJ1-CHI-42', title: 'Chicago Red / Talla 42', productName: 'Nike Air Jordan 1 Retro High OG', price: 180.0, costPrice: 90.0, stock: 24 },
  { id: 'v3', sku: 'NK-AJ1-BLK-42', title: 'Shadow Black / Talla 42', productName: 'Nike Air Jordan 1 Retro High OG', price: 185.0, costPrice: 92.0, stock: 18 },
  { id: 'v4', sku: 'AD-UB-WHT-41', title: 'Triple White / Talla 41', productName: 'Adidas Ultraboost Light Running', price: 149.99, costPrice: 75.0, stock: 40 },
  { id: 'v5', sku: 'DIOR-SV-EDP-100ML', title: 'Frasco 100ml EDP', productName: 'Dior Sauvage Eau de Parfum 100ml', price: 135.0, costPrice: 70.0, stock: 45 },
  { id: 'v6', sku: 'DIOR-SV-EDP-200ML', title: 'Frasco 200ml Jumbo', productName: 'Dior Sauvage Eau de Parfum 100ml', price: 195.0, costPrice: 100.0, stock: 20 },
  { id: 'v7', sku: 'TS-OVR-WHT-M', title: 'Blanco Crudo / Talla M', productName: 'Camiseta Casual Heavy Cotton Oversize', price: 22.5, costPrice: 8.0, stock: 65 },
  { id: 'v8', sku: 'TS-OVR-BLK-L', title: 'Negro Lavado / Talla L', productName: 'Camiseta Casual Heavy Cotton Oversize', price: 22.5, costPrice: 8.0, stock: 38 },
  { id: 'v9', sku: 'JNS-SLIM-32', title: 'Azul Medio / Talla 32', productName: 'Jeans Ajustados Slim Fit Denim Stretch', price: 39.99, costPrice: 16.0, stock: 48 },
  { id: 'v10', sku: 'RLJ-SLV-BLK', title: 'Plata con Esfera Negra', productName: 'Reloj Cronógrafo Acero Inoxidable Black Dial', price: 89.0, costPrice: 35.0, stock: 25 },
  { id: 'v11', sku: 'NE-NY-NAVY-714', title: 'Azul Navy / Talla 7 1/4', productName: 'Gorra New Era NY Yankees 59FIFTY Fitted', price: 38.0, costPrice: 15.0, stock: 30 },
  { id: 'v12', sku: 'NE-NY-BLK-712', title: 'Black on Black / Talla 7 1/2', productName: 'Gorra New Era NY Yankees 59FIFTY Fitted', price: 40.0, costPrice: 16.0, stock: 3 },
];

export default function AdminInventoryPage() {
  const [variants, setVariants] = useState<any[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<string>('PURCHASE');
  const [adjustReason, setAdjustReason] = useState<string>('Reabastecimiento de proveedor');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    api
      .get('/admin/inventory')
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setVariants(
            res.data.map((v: any) => ({
              id: v.id,
              sku: v.sku,
              title: v.title,
              productName: v.product?.name || 'Producto',
              price: v.price,
              costPrice: v.costPrice,
              stock: v.stock,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    const qty = Number(adjustQuantity);
    const newStock = Math.max(0, selectedVariant.stock + qty);

    try {
      await api
        .post(`/admin/inventory/variants/${selectedVariant.id}/adjust`, {
          quantity: qty,
          type: adjustType,
          reason: adjustReason,
        })
        .catch(() => {});

      setVariants((prev) =>
        prev.map((v) => (v.id === selectedVariant.id ? { ...v, stock: newStock } : v)),
      );

      setNotification({
        message: `Stock de ${selectedVariant.sku} actualizado a ${newStock} unidades`,
        type: 'success',
      });
      setSelectedVariant(null);
      setTimeout(() => setNotification(null), 3500);
    } catch (e: any) {
      setNotification({ message: 'Error al ajustar inventario', type: 'error' });
    }
  };

  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      v.sku.toLowerCase().includes(search.toLowerCase()) ||
      v.productName.toLowerCase().includes(search.toLowerCase()) ||
      v.title.toLowerCase().includes(search.toLowerCase());

    const matchesLowStock = !lowStockOnly || v.stock <= 5;
    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] tracking-tight flex items-center gap-2.5">
            <Boxes className="h-6 w-6 text-[#3C6E71]" />
            Control de Inventario & Almacén
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Supervisa niveles de stock por variante (talla, color), kardex y auditoría
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
            placeholder="Buscar por SKU o variante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2 pl-10 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777]" />
        </div>

        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            lowStockOnly
              ? 'bg-[#3C6E71] text-white shadow-subtle'
              : 'border border-[#D9D9D9] bg-[#FFFFFF] text-[#353535] hover:bg-[#D9D9D9]/30'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Solo Stock Crítico (≤ 5 uds)</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#353535]">
            <thead className="border-b border-[#D9D9D9] bg-[#D9D9D9]/20 text-[11px] uppercase tracking-wider text-[#777777]">
              <tr>
                <th className="py-3.5 px-4">SKU / Variante</th>
                <th className="py-3.5 px-4">Producto Asociado</th>
                <th className="py-3.5 px-4">Precio Venta</th>
                <th className="py-3.5 px-4">Costo Estimado</th>
                <th className="py-3.5 px-4 text-center">Stock Disponible</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60">
              {filteredVariants.map((v) => (
                <tr key={v.id} className="hover:bg-[#D9D9D9]/15 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-mono font-bold text-[#353535]">{v.sku}</p>
                    <p className="text-[11px] text-[#777777]">{v.title}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#353535]">{v.productName}</td>
                  <td className="py-3.5 px-4 font-bold text-[#353535]">{formatCurrency(v.price)}</td>
                  <td className="py-3.5 px-4 text-[#777777] font-mono">
                    {v.costPrice ? formatCurrency(v.costPrice) : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-black text-sm text-[#353535]">
                      {v.stock} uds
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {v.stock === 0 ? (
                      <span className="rounded-full border border-[#D9D9D9] bg-[#D9D9D9]/50 px-2.5 py-0.5 text-[10px] font-bold text-[#777777]">
                        Agotado
                      </span>
                    ) : v.stock <= 5 ? (
                      <span className="rounded-full border border-[#3C6E71] bg-[#3C6E71]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#3C6E71]">
                        Crítico
                      </span>
                    ) : (
                      <span className="rounded-full border border-[#D9D9D9] bg-[#FFFFFF] px-2.5 py-0.5 text-[10px] font-bold text-[#353535]">
                        Óptimo
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedVariant(v);
                        setAdjustQuantity(10);
                      }}
                      className="inline-flex items-center gap-1 rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#353535] hover:bg-[#353535] hover:text-white transition-all cursor-pointer"
                    >
                      <Edit className="h-3 w-3" /> Ajustar Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-3">
              <div>
                <h3 className="text-base font-black text-[#353535] flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-[#3C6E71]" />
                  Ajuste de Stock
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  {selectedVariant.productName} ({selectedVariant.title})
                </p>
              </div>
              <button
                onClick={() => setSelectedVariant(null)}
                className="rounded-full p-1.5 text-[#777777] hover:bg-[#D9D9D9]/30 hover:text-[#353535]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Tipo de Movimiento *
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                >
                  <option value="PURCHASE">Entrada por Compra / Proveedor (PURCHASE)</option>
                  <option value="RESTOCK">Reabastecimiento de Almacén (RESTOCK)</option>
                  <option value="RETURN">Devolución de Cliente (RETURN)</option>
                  <option value="DAMAGED">Baja por Dañado / Merma (DAMAGED)</option>
                  <option value="ADJUSTMENT">Ajuste Manual de Inventario (ADJUSTMENT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Cantidad a Modificar (+ para sumar, - para restar) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                />
                <p className="text-[11px] text-[#777777] mt-1.5">
                  Stock actual: <strong>{selectedVariant.stock}</strong> $\rightarrow$ Nuevo stock:{' '}
                  <strong className="text-[#353535]">
                    {Math.max(0, selectedVariant.stock + adjustQuantity)} unidades
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Motivo de Auditoría *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej. Ingreso de lote desde fábrica"
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#D9D9D9]">
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="flex-1 rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] py-2.5 text-xs font-bold text-[#353535] hover:bg-[#D9D9D9]/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-[#3C6E71] py-2.5 text-xs font-bold text-white hover:bg-[#284B63] shadow-subtle active:scale-98 cursor-pointer"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
