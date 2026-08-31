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
      loginMethod: 'EMAIL_PASSWORD',
      tokenIssued: true,
      authLevel: 'LEVEL_3',
    },
  },
  {
    id: 'log-5',
    action: 'CREATE_COUPON',
    entity: 'Coupon',
    entityId: 'coup-1-bienvenido10',
    description: 'Creación del código de descuento BIENVENIDO10 (10% OFF)',
    ipAddress: '192.168.1.45',
    userAgent: 'Chrome 124 / Windows 11',
    user: {
      firstName: 'Administrador',
      lastName: 'Principal',
      email: 'admin@wallystore.com',
      role: 'SUPER_ADMIN',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    previousData: null,
    newData: {
      code: 'BIENVENIDO10',
      type: 'PERCENTAGE',
      value: 10,
      usageLimit: 500,
    },
  },
  {
    id: 'log-6',
    action: 'CREATE_CATEGORY',
    entity: 'Category',
    entityId: 'cat-1-tenis-sneakers',
    description: 'Registro de la categoría Tenis & Sneakers en el catálogo',
    ipAddress: '192.168.1.45',
    userAgent: 'Chrome 124 / Windows 11',
    user: {
      firstName: 'Administrador',
      lastName: 'Principal',
      email: 'admin@wallystore.com',
      role: 'SUPER_ADMIN',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    previousData: null,
    newData: {
      name: 'Tenis & Sneakers',
      slug: 'tenis-sneakers',
      isActive: true,
    },
  },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
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

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const handleSimulateNewLog = () => {
    const actions = [
      {
        action: 'UPDATE_INVENTORY_SECURITY',
        entity: 'InventoryVariant',
        entityId: `var-${Date.now()}`,
        description: 'Auditoría automática: Verificación de niveles de stock en almacén central',
        newData: { status: 'VERIFIED', itemsScanned: 48, discrepancy: 0 },
      },
      {
        action: 'SECURITY_TOKEN_REFRESH',
        entity: 'AuthToken',
        entityId: `tok-${Date.now()}`,
        description: 'Rotación de token de sesión segura de administrador',
        newData: { refreshed: true, validUntil: new Date(Date.now() + 86400000).toISOString() },
      },
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    const newEntry = {
      id: `log-${Date.now()}`,
      action: randomAction.action,
      entity: randomAction.entity,
      entityId: randomAction.entityId,
      description: randomAction.description,
      ipAddress: '192.168.1.45',
      userAgent: 'Chrome 124 / Windows 11',
      user: {
        firstName: 'Administrador',
        lastName: 'Principal',
        email: 'admin@wallystore.com',
        role: 'SUPER_ADMIN',
      },
      createdAt: new Date().toISOString(),
      previousData: null,
      newData: randomAction.newData,
    };

    setLogs([newEntry, ...logs]);
    setNotification(`Nuevo registro de auditoría capturado: ${newEntry.action}`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      (log.description && log.description.toLowerCase().includes(search.toLowerCase())) ||
      (log.user?.email && log.user.email.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'PRODUCTS' && log.action.includes('PRODUCT')) ||
      (categoryFilter === 'INVENTORY' && log.action.includes('STOCK')) ||
      (categoryFilter === 'ORDERS' && log.action.includes('ORDER')) ||
      (categoryFilter === 'AUTH' && (log.action.includes('AUTH') || log.action.includes('LOGIN')));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-[#3C6E71]" />
            Registro de Auditoría & Logs de Seguridad
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Trazabilidad inmutable de todas las mutaciones administrativas, accesos y cambios en el sistema
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateNewLog}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] transition-all shadow-subtle active:scale-98 cursor-pointer"
          >
            <Activity className="h-4 w-4" />
            <span>Registrar Test Log</span>
          </button>
        </div>
      </div>

      {/* 2. Notification Toast */}
      {notification && (
        <div className="flex items-center gap-2 rounded-2xl bg-[#FFFFFF] border border-[#3C6E71] p-4 text-xs font-bold text-[#3C6E71] shadow-subtle animate-fadeIn">
          <Check className="h-4 w-4 text-[#3C6E71]" />
          <span>{notification}</span>
        </div>
      )}

      {/* 3. Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Buscar por acción, entidad, usuario o detalle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2 pl-10 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777]" />
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
                  ? 'bg-[#3C6E71] text-white shadow-subtle'
                  : 'bg-[#FFFFFF] text-[#777777] hover:text-[#353535] border border-[#D9D9D9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Audit Logs Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#353535]">
            <thead className="border-b border-[#D9D9D9] bg-[#D9D9D9]/20 text-[11px] uppercase tracking-wider text-[#777777]">
              <tr>
                <th className="py-3.5 px-4 w-8"></th>
                <th className="py-3.5 px-4">Acción / Operación</th>
                <th className="py-3.5 px-4">Descripción del Cambio</th>
                <th className="py-3.5 px-4">Usuario Responsable</th>
                <th className="py-3.5 px-4">IP & Cliente</th>
                <th className="py-3.5 px-4 text-right">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60">
              {filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    onClick={() => toggleExpand(log.id)}
                    className="hover:bg-[#D9D9D9]/15 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-[#777777]">
                      {expandedLogId === log.id ? (
                        <ChevronDown className="h-4 w-4 text-[#3C6E71]" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block font-mono font-bold text-[#3C6E71] text-xs">
                        {log.action}
                      </span>
                      <span className="block text-[10px] text-[#777777] font-mono">
                        {log.entity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#353535] max-w-sm">
                      <p className="font-semibold text-[#353535]">{log.description || 'Operación registrada'}</p>
                      <span className="text-[10px] text-[#777777] font-mono">ID: {log.entityId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#353535]">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistema'}
                      </p>
                      <p className="text-[10px] text-[#777777]">{log.user?.email || 'system@wallystore.com'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#353535]">
                      <span>{log.ipAddress || '127.0.0.1'}</span>
                      <span className="block text-[9px] text-[#777777] truncate max-w-[120px]">
                        {log.userAgent || 'Web Browser'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#777777] font-mono text-[11px]">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>

                  {/* Expanded JSON Diff View */}
                  {expandedLogId === log.id && (
                    <tr className="bg-[#D9D9D9]/20 border-b border-[#D9D9D9]">
                      <td colSpan={6} className="p-4 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#353535]">
                          <Code2 className="h-4 w-4 text-[#3C6E71]" />
                          <span>Detalle de la Carga Útil (Payload de Mutación):</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block mb-1">
                              Estado Anterior:
                            </span>
                            <pre className="rounded-2xl bg-[#FFFFFF] p-3.5 text-[11px] font-mono text-[#353535] overflow-x-auto border border-[#D9D9D9] leading-relaxed">
                              {log.previousData
                                ? JSON.stringify(log.previousData, null, 2)
                                : '// Sin estado previo (Registro Nuevo)'}
                            </pre>
                          </div>

                          <div>
                            <span className="text-[11px] font-bold text-[#3C6E71] uppercase tracking-wider block mb-1">
                              Nuevo Estado Registrado:
                            </span>
                            <pre className="rounded-2xl bg-[#FFFFFF] p-3.5 text-[11px] font-mono text-[#353535] overflow-x-auto border border-[#3C6E71] leading-relaxed font-semibold">
                              {log.newData
                                ? JSON.stringify(log.newData, null, 2)
                                : '// Operación de solo lectura'}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
