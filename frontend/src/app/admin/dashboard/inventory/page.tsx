'use client';

import React, { useState, useMemo } from 'react';
import { api } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/utils';
import { useCatalog, getStoredProducts, saveProductsCatalog } from '../../../../lib/catalogStore';
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
  CheckCircle2,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const { products, refreshCatalog } = useCatalog();
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<string>('PURCHASE');
  const [adjustReason, setAdjustReason] = useState<string>('Reabastecimiento de proveedor');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Derive inventory items from all catalog products and their variants
  const inventoryItems = useMemo(() => {
    return products.flatMap((p) => {
      const variants = p.variants || [];
      if (variants.length === 0) {
        return [
          {
            id: `v-${p.id}`,
            productId: p.id,
            sku: p.sku,
            title: 'Estándar',
            productName: p.name,
            price: p.basePrice,
            costPrice: Math.round(p.basePrice * 0.5),
            stock: 30,
          },
        ];
      }
      return variants.map((v) => ({
        id: v.id,
        productId: p.id,
        sku: v.sku || `${p.sku}-${v.id}`,
        title: v.title || 'Opción',
        productName: p.name,
        price: v.price || p.basePrice,
        costPrice: Math.round((v.price || p.basePrice) * 0.5),
        stock: typeof v.stock === 'number' ? v.stock : 25,
      }));
    });
  }, [products]);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    const qty = Number(adjustQuantity);
    const newStock = Math.max(0, selectedVariant.stock + qty);

    const allProducts = getStoredProducts();
    const updatedProducts = allProducts.map((p) => {
      if (p.id === selectedVariant.productId) {
        const updatedVariants = (p.variants || []).map((v) =>
          v.id === selectedVariant.id ? { ...v, stock: newStock } : v
        );
        return { ...p, variants: updatedVariants };
      }
      return p;
    });

    saveProductsCatalog(updatedProducts);
    refreshCatalog();

    setNotification({
      message: `Stock de ${selectedVariant.sku} (${selectedVariant.title}) actualizado a ${newStock} unidades`,
      type: 'success',
    });
    setSelectedVariant(null);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredVariants = inventoryItems.filter((v) => {
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
          <h1 className="text-2xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight flex items-center gap-2.5">
            <Boxes className="h-6 w-6 text-[#3C6E71] dark:text-[#4D8B8E]" />
            Control de Inventario & Almacén
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1">
            Supervisa niveles de stock por variante (talla, color) de todos los productos
          </p>
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
            placeholder="Buscar por SKU, producto o variante..."
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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              lowStockOnly
                ? 'border-[#3C6E71] dark:border-[#4D8B8E] bg-[#3C6E71]/15 dark:bg-[#4D8B8E]/20 text-[#3C6E71] dark:text-[#4D8B8E]'
                : 'border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Solo Bajo Stock (&le; 5)</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">SKU / Identificador</th>
                <th className="px-6 py-3.5">Producto & Opción</th>
                <th className="px-6 py-3.5">Precio Venta</th>
                <th className="px-6 py-3.5">Costo Aprox.</th>
                <th className="px-6 py-3.5">Stock Físico</th>
                <th className="px-6 py-3.5 text-right">Ajuste Rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60 text-[#353535] dark:text-[#F5F6F8]">
              {filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#777777] dark:text-[#A8ABB2]">
                    No se encontraron variantes en el inventario.
                  </td>
                </tr>
              ) : (
                filteredVariants.map((item) => {
                  const isLow = item.stock <= 5;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-[#D9D9D9]/15 dark:hover:bg-[#2E3236]/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#353535] dark:text-[#F5F6F8]">{item.sku}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#353535] dark:text-[#F5F6F8]">{item.productName}</p>
                        <span className="text-[10px] font-semibold text-[#777777] dark:text-[#A8ABB2]">{item.title}</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-black text-[#353535] dark:text-[#F5F6F8]">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 font-mono text-[#777777] dark:text-[#A8ABB2]">
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full ${
                              isOut
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                                : isLow
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-[#3C6E71]/10 text-[#3C6E71] dark:text-[#4D8B8E] border border-[#3C6E71]/30'
                            }`}
                          >
                            {item.stock} uds
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedVariant(item);
                            setAdjustQuantity(10);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3 py-1.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-colors cursor-pointer shadow-subtle"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Ajustar Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div>
                <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">Ajuste Manual de Inventario</h3>
                <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2] mt-0.5 font-mono">{selectedVariant.sku}</p>
              </div>
              <button
                onClick={() => setSelectedVariant(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] p-3 text-xs border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <p className="font-bold text-[#353535] dark:text-[#F5F6F8]">{selectedVariant.productName}</p>
                <p className="text-[#777777] dark:text-[#A8ABB2] text-[10px]">{selectedVariant.title}</p>
                <p className="text-xs font-black text-[#3C6E71] dark:text-[#4D8B8E] mt-1">Stock Actual: {selectedVariant.stock} unidades</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">
                  Cantidad a Ajustar (+ o -)
                </label>
                <input
                  type="number"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  placeholder="Ej. +10 o -5"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] font-mono focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
                <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] mt-1 block">
                  Nuevo stock resultante:{' '}
                  <strong className="text-[#353535] dark:text-[#F5F6F8]">
                    {Math.max(0, selectedVariant.stock + Number(adjustQuantity))} unidades
                  </strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">
                  Motivo / Observación
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej. Compra de inventario nuevo"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-4 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#3C6E71] dark:bg-[#4D8B8E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] shadow-subtle active:scale-98 cursor-pointer"
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
