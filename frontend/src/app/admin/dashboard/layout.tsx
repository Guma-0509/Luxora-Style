'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Tag,
  ShieldCheck,
  LogOut,
  FolderTree,
  Store,
  Menu,
  X,
  Bell,
  User,
} from 'lucide-react';

const NAVIGATION_ITEMS = [
  { name: 'Métricas & Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Productos & Catálogo', href: '/admin/dashboard/products', icon: Package },
  { name: 'Categorías', href: '/admin/dashboard/categories', icon: FolderTree },
  { name: 'Inventario & Almacén', href: '/admin/dashboard/inventory', icon: Boxes },
  { name: 'Pedidos & Ventas', href: '/admin/dashboard/orders', icon: ShoppingCart },
  { name: 'Cupones & Promos', href: '/admin/dashboard/coupons', icon: Tag },
  { name: 'Auditoría & Seguridad', href: '/admin/dashboard/audit-logs', icon: ShieldCheck },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex text-[#353535]">
      {/* 1. Sidebar - CARBÓN #353535 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#353535] border-r border-[#353535] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3C6E71] text-white font-black text-sm shadow-subtle">
              W
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-white">
                WALLY ADMIN
              </span>
              <span className="text-[9px] font-bold text-[#D9D9D9] uppercase tracking-widest">
                Enterprise Portal
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="rounded-lg p-1.5 text-[#D9D9D9] hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#3C6E71] text-white shadow-subtle'
                    : 'text-[#D9D9D9] hover:bg-[#284B63] hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#D9D9D9]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions in Sidebar */}
        <div className="p-3 border-t border-white/10 space-y-1.5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#D9D9D9] hover:bg-[#284B63] hover:text-white transition-colors"
          >
            <Store className="h-4 w-4" />
            <span>Ver Tienda en Vivo</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#D9D9D9] hover:bg-[#284B63] hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <div className="flex flex-1 flex-col min-w-0 bg-[#FFFFFF]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#D9D9D9] bg-[#FFFFFF] px-4 sm:px-8 shadow-subtle">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="rounded-xl p-2 text-[#353535] hover:bg-[#D9D9D9]/30 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-bold text-[#777777] hidden sm:inline">
              Panel Administrativo Enterprise
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#353535] hover:bg-[#D9D9D9]/30 hover:border-[#353535] transition-all shadow-subtle"
            >
              <Store className="h-3.5 w-3.5 text-[#3C6E71]" />
              <span>Ir a Catálogo</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-[#D9D9D9]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#353535] text-white font-bold text-xs">
                {user ? user.firstName?.[0] : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-[#353535] leading-none">
                  {user ? `${user.firstName} ${user.lastName}` : 'Administrador'}
                </p>
                <span className="text-[10px] font-bold text-[#3C6E71] uppercase">
                  {user?.role || 'SUPER_ADMIN'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
