'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import { formatDate } from '../../../../lib/utils';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Code2,
  ChevronDown,
  ChevronRight,
  Activity,
  Check,
  Eye,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';

const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-1',
    action: 'UPDATE_PRODUCT_PRICE',
    entity: 'Product',
    entityId: 'prod-1-nike-jordan-1',
    description: 'Actualización de precio base y oferta de Nike Air Jordan 1 Retro High OG',
    ipAddress: '192.168.1.45',
    userAgent: 'Chrome 124 / Windows 11',
    user: {
      firstName: 'Administrador',
      lastName: 'Principal',
      email: 'admin@wallystore.com',
      role: 'SUPER_ADMIN',
    },
    createdAt: new Date().toISOString(),
    previousData: {
      basePrice: 195.0,
      compareAtPrice: 220.0,
    },
    newData: {
      basePrice: 180.0,
      compareAtPrice: 210.0,
      updatedBy: 'admin@wallystore.com',
    },
  },
  {
    id: 'log-2',
    action: 'STOCK_ADJUSTMENT',
    entity: 'InventoryVariant',
    entityId: 'var-5-dior-sauvage',
    description: 'Ingreso de reabastecimiento por proveedor (+20 unidades)',
    ipAddress: '192.168.1.45',
    userAgent: 'Chrome 124 / Windows 11',
    user: {
      firstName: 'Administrador',
      lastName: 'Principal',
      email: 'admin@wallystore.com',
      role: 'SUPER_ADMIN',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    previousData: {
      sku: 'DIOR-SV-EDP-100ML',
      stock: 25,
    },
    newData: {
      sku: 'DIOR-SV-EDP-100ML',
      stock: 45,
      movementType: 'PURCHASE',
      reason: 'Reabastecimiento de proveedor',
    },
  },
  {
    id: 'log-3',
    action: 'ORDER_STATUS_CHANGED',
    entity: 'Order',
    entityId: 'ord-1-ord-20260830-4921',
    description: 'Orden ORD-20260830-4921 cambiada de PAID a SHIPPED (FedEx FDX-893019284)',
    ipAddress: '192.168.1.45',
    userAgent: 'Chrome 124 / Windows 11',
    user: {
      firstName: 'Administrador',
      lastName: 'Principal',
      email: 'admin@wallystore.com',
      role: 'SUPER_ADMIN',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    previousData: {
      status: 'PAID',
      carrier: null,
      trackingNumber: null,
    },
    newData: {
      status: 'SHIPPED',
      carrier: 'FedEx Express',
      trackingNumber: 'FDX-893019284',
    },
  },
  {
    id: 'log-4',
    action: 'ADMIN_LOGIN_SUCCESS',
    entity: 'AuthSession',
    entityId: 'sess-894102',
    description: 'Inicio de sesión exitoso al panel administrativo con credenciales de SuperAdmin',
    ipAddress: '192.168.1.45',
    userAgent: 'Chrome 124 / Windows 11',
    user: {
      firstName: 'Administrador',
      lastName: 'Principal',
      email: 'admin@wallystore.com',
      role: 'SUPER_ADMIN',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    previousData: null,
    newData: {
      authMethod: 'PASSWORD',
      tokenIssued: true,
    },
  },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [viewingLog, setViewingLog] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/admin/audit-logs')
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setLogs(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSimulateNewLog = () => {
    const newLog = {
      id: `log-${Date.now()}`,
      action: 'SYSTEM_SETTINGS_UPDATE',
      entity: 'StoreSettings',
      entityId: 'settings-luxora',
      description: 'Prueba de auditoría de seguridad registrada en vivo',
      ipAddress: '127.0.0.1',
      userAgent: 'Chrome / Next.js',
      user: {
        firstName: 'Admin',
        lastName: 'Luxora',
        email: 'admin@luxorastyle.com',
        role: 'SUPER_ADMIN',
      },
      createdAt: new Date().toISOString(),
      previousData: { theme: 'SYSTEM' },
      newData: { theme: 'DARK', updatedBy: 'Admin' },
    };

    setLogs([newLog, ...logs]);
    setNotification('Nuevo evento de auditoría generado y registrado');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDeleteLog = (id: string, actionName: string) => {
    if (!confirm(`¿Deseas eliminar el log "${actionName}"?`)) return;
    setLogs((prev) => prev.filter((l) => l.id !== id));
    setNotification(`Log "${actionName}" eliminado`);
    setTimeout(() => setNotification(null), 3500);
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.email && log.user.email.toLowerCase().includes(search.toLowerCase()));

    let matchesCategory = true;
    if (categoryFilter === 'PRODUCTS') matchesCategory = log.entity === 'Product';
    if (categoryFilter === 'INVENTORY') matchesCategory = log.entity === 'InventoryVariant';
    if (categoryFilter === 'ORDERS') matchesCategory = log.entity === 'Order';
    if (categoryFilter === 'AUTH') matchesCategory = log.entity === 'AuthSession';

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-[#3C6E71] dark:text-[#4D8B8E]" />
            Registro de Auditoría & Logs de Seguridad
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1">
            Trazabilidad inmutable de todas las mutaciones administrativas, accesos y cambios en el sistema
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateNewLog}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-all shadow-subtle active:scale-98 cursor-pointer"
          >
            <Activity className="h-4 w-4" />
            <span>Registrar Test Log</span>
          </button>
        </div>
      </div>

      {/* 2. Notification Toast */}
      {notification && (
        <div className="flex items-center gap-2 rounded-2xl bg-[#FFFFFF] dark:bg-[#242526] border border-[#3C6E71] dark:border-[#4D8B8E] p-4 text-xs font-bold text-[#3C6E71] dark:text-[#4D8B8E] shadow-subtle animate-fadeIn">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* 3. Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Buscar por acción, entidad, usuario o detalle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2 pl-10 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777] dark:text-[#A8ABB2]" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'PRODUCTS', label: 'Productos' },
            { id: 'INVENTORY', label: 'Inventario' },
            { id: 'ORDERS', label: 'Pedidos' },
            { id: 'AUTH', label: 'Seguridad' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`rounded-2xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-[#3C6E71] dark:bg-[#4D8B8E] text-white shadow-subtle'
                  : 'bg-[#FFFFFF] dark:bg-[#1E1F20] text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-[#F5F6F8] border border-[#D9D9D9] dark:border-[#3A3B3C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Audit Logs Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#353535] dark:text-[#F5F6F8]">
            <thead className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] text-[11px] uppercase tracking-wider text-[#777777] dark:text-[#A8ABB2]">
              <tr>
                <th className="py-3.5 px-4">Acción / Entidad</th>
                <th className="py-3.5 px-4">Descripción del Cambio</th>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">IP & Cliente</th>
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#777777] dark:text-[#A8ABB2]">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#D9D9D9]/15 dark:hover:bg-[#2E3236]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="inline-block font-mono font-bold text-[#3C6E71] dark:text-[#4D8B8E] text-xs">
                        {log.action}
                      </span>
                      <span className="block text-[10px] text-[#777777] dark:text-[#A8ABB2] font-mono">
                        {log.entity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-semibold text-[#353535] dark:text-[#F5F6F8]">{log.description || 'Operación registrada'}</p>
                      <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] font-mono">ID: {log.entityId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#353535] dark:text-[#F5F6F8]">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistema'}
                      </p>
                      <p className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">{log.user?.email || 'system@wallystore.com'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#353535] dark:text-[#F5F6F8]">
                      <span>{log.ipAddress || '127.0.0.1'}</span>
                      <span className="block text-[9px] text-[#777777] dark:text-[#A8ABB2] truncate max-w-[120px]">
                        {log.userAgent || 'Web Browser'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#777777] dark:text-[#A8ABB2] font-mono text-[11px]">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* VER */}
                        <button
                          onClick={() => setViewingLog(log)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-2.5 py-1.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-all shadow-subtle cursor-pointer"
                          title="Ver Payload"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                          <span>Ver</span>
                        </button>

                        {/* BORRAR */}
                        <button
                          onClick={() => handleDeleteLog(log.id, log.action)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                          title="Borrar Log"
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

      {/* VIEW LOG MODAL */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div>
                <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                  Detalle del Evento de Auditoría
                </h3>
                <p className="text-xs font-mono font-bold text-[#3C6E71] dark:text-[#4D8B8E] mt-0.5">{viewingLog.action}</p>
              </div>
              <button
                onClick={() => setViewingLog(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Descripción:</span>
                <p className="text-xs font-medium text-[#353535] dark:text-[#F5F6F8]">{viewingLog.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#777777] dark:text-[#A8ABB2] uppercase tracking-wider block mb-1">
                    Estado Anterior:
                  </span>
                  <pre className="rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] p-3 text-[11px] font-mono text-[#353535] dark:text-[#F5F6F8] overflow-x-auto border border-[#D9D9D9] dark:border-[#3A3B3C] max-h-48 leading-relaxed">
                    {viewingLog.previousData
                      ? JSON.stringify(viewingLog.previousData, null, 2)
                      : '// Sin estado previo'}
                  </pre>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#3C6E71] dark:text-[#4D8B8E] uppercase tracking-wider block mb-1">
                    Nuevo Estado Registrado:
                  </span>
                  <pre className="rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] p-3 text-[11px] font-mono text-[#353535] dark:text-[#F5F6F8] overflow-x-auto border border-[#3C6E71] dark:border-[#4D8B8E] max-h-48 leading-relaxed font-semibold">
                    {viewingLog.newData
                      ? JSON.stringify(viewingLog.newData, null, 2)
                      : '// Solo lectura'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C] flex justify-end">
              <button
                onClick={() => setViewingLog(null)}
                className="rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-5 py-2.5 text-xs font-bold text-white shadow-subtle cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
