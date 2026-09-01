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
  AlertTriangle,
} from 'lucide-react';

import { getStoredAuditLogs, saveAuditLogsStore, deleteAllAuditLogsStore } from '../../../../lib/catalogStore';

const INITIAL_AUDIT_LOGS: any[] = [];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [viewingLog, setViewingLog] = useState<any | null>(null);
  const [logToDelete, setLogToDelete] = useState<any | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const local = getStoredAuditLogs();
    if (typeof window !== 'undefined' && localStorage.getItem('luxora_logs_initialized')) {
      setLogs(local);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxora_logs_initialized', 'true');
        saveAuditLogsStore(INITIAL_AUDIT_LOGS);
      }
      setLogs(INITIAL_AUDIT_LOGS);
    }
  }, []);

  const handleOpenView = (log: any) => {
    setViewingLog(log);
  };

  const handleConfirmDeleteLog = () => {
    if (!logToDelete) return;
    const updated = logs.filter((l) => l.id !== logToDelete.id);
    setLogs(updated);
    saveAuditLogsStore(updated);
    setLogToDelete(null);
    setNotification('Registro de auditoría eliminado');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleConfirmClearAllLogs = () => {
    deleteAllAuditLogsStore();
    setLogs([]);
    setIsClearAllModalOpen(false);
    setNotification('Se ha limpiado todo el historial de auditoría');
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      (l.user?.email && l.user.email.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || l.entity === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-[#3C6E71] dark:text-[#4D8B8E]" />
            Auditoría del Sistema & Logs
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1">
            Registro inmutable de seguridad y trazabilidad de acciones operativas
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {logs.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-3.5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vaciar Todo ({logs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="flex items-center gap-2 rounded-2xl bg-[#FFFFFF] dark:bg-[#242526] border border-[#3C6E71] dark:border-[#4D8B8E] text-[#3C6E71] dark:text-[#4D8B8E] p-4 text-xs font-bold shadow-subtle animate-fadeIn">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Buscar por acción, usuario o descripción..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3 py-2 text-xs text-[#353535] dark:text-[#F5F6F8] font-bold focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
          >
            <option value="ALL">Todas las Entidades</option>
            <option value="Product">Productos</option>
            <option value="InventoryVariant">Inventario</option>
            <option value="Order">Pedidos</option>
            <option value="AuthSession">Seguridad & Sesiones</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Acción & Entidad</th>
                <th className="py-3.5 px-4">Descripción del Evento</th>
                <th className="py-3.5 px-4">Usuario Responsable</th>
                <th className="py-3.5 px-4">Fecha & Hora</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60 text-[#353535] dark:text-[#F5F6F8]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#777777] dark:text-[#A8ABB2]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldCheck className="h-8 w-8 text-[#777777] opacity-40" />
                      <p className="font-bold text-[#353535] dark:text-[#F5F6F8]">No hay registros de auditoría</p>
                      <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Los eventos y cambios en el sistema se registrarán aquí.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#D9D9D9]/15 dark:hover:bg-[#2E3236]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#3C6E71] dark:text-[#4D8B8E] block text-[11px]">
                        {l.action}
                      </span>
                      <span className="text-[10px] font-semibold text-[#777777] dark:text-[#A8ABB2]">{l.entity}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-xs text-[#353535] dark:text-[#F5F6F8] font-medium line-clamp-2">{l.description}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#353535] dark:text-[#F5F6F8]">
                        {l.user?.firstName} {l.user?.lastName}
                      </p>
                      <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] font-mono">{l.user?.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#777777] dark:text-[#A8ABB2] font-mono text-[11px]">
                      {formatDate(l.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* VER */}
                        <button
                          onClick={() => handleOpenView(l)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-2.5 py-1.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-all shadow-subtle cursor-pointer"
                          title="Ver Detalle JSON"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                          <span>Ver</span>
                        </button>

                        {/* BORRAR */}
                        <button
                          onClick={() => setLogToDelete(l)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                          title="Eliminar Registro"
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

      {/* DELETE SINGLE LOG MODAL */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 dark:border-red-500/40 bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">¿Eliminar Registro de Log?</h3>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button
                onClick={() => setLogToDelete(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
              <span className="font-mono font-bold text-xs text-[#3C6E71] dark:text-[#4D8B8E]">{logToDelete.action}</span>
              <p className="text-xs text-[#353535] dark:text-[#F5F6F8] mt-1">{logToDelete.description}</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-4 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLog}
                className="rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-subtle active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sí, Eliminar Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL LOGS MODAL */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 dark:border-red-500/40 bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">¿Limpiar Todo el Historial?</h3>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Se borrarán {logs.length} eventos de auditoría</p>
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
              ¿Estás seguro de que deseas vaciar <strong>todos los logs de auditoría</strong> ({logs.length} registros)?
              El historial de actividades del sistema quedará completamente limpio.
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
                onClick={handleConfirmClearAllLogs}
                className="rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-subtle active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sí, Vaciar Todo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW LOG DETAILS MODAL */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div>
                <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                  Detalle del Evento de Auditoría
                </h3>
                <p className="text-xs font-mono text-[#3C6E71] dark:text-[#4D8B8E] mt-0.5">{viewingLog.action}</p>
              </div>
              <button
                onClick={() => setViewingLog(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <strong className="text-[#353535] dark:text-[#F5F6F8] block font-bold">Descripción</strong>
                <p className="text-[#777777] dark:text-[#A8ABB2] mt-0.5">{viewingLog.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Usuario</span>
                  <strong className="text-[#353535] dark:text-[#F5F6F8]">{viewingLog.user?.firstName} {viewingLog.user?.lastName}</strong>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2] font-mono">{viewingLog.user?.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Dirección IP & Origen</span>
                  <strong className="text-[#353535] dark:text-[#F5F6F8] font-mono">{viewingLog.ipAddress}</strong>
                  <p className="text-[10px] text-[#777777] dark:text-[#A8ABB2]">{viewingLog.userAgent}</p>
                </div>
              </div>

              {viewingLog.previousData && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] block mb-1">
                    Estado Anterior (Previous Data)
                  </span>
                  <pre className="rounded-2xl bg-[#1E1F20] p-3 text-[11px] font-mono text-amber-400 overflow-x-auto border border-[#3A3B3C]">
                    {JSON.stringify(viewingLog.previousData, null, 2)}
                  </pre>
                </div>
              )}

              {viewingLog.newData && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] block mb-1">
                    Nuevo Estado (New Data)
                  </span>
                  <pre className="rounded-2xl bg-[#1E1F20] p-3 text-[11px] font-mono text-[#4D8B8E] overflow-x-auto border border-[#3A3B3C]">
                    {JSON.stringify(viewingLog.newData, null, 2)}
                  </pre>
                </div>
              )}
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
