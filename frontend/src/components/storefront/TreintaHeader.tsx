'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  ShieldCheck,
  PackageCheck,
  ChevronDown,
} from 'lucide-react';

interface TreintaHeaderProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const TreintaHeader: React.FC<TreintaHeaderProps> = ({
  searchTerm: controlledSearch,
  onSearchChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const searchQuery = controlledSearch !== undefined ? controlledSearch : localQuery;
  const setSearchQuery = onSearchChange || setLocalQuery;

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCartItems = mounted ? getItemCount() : 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D9D9D9] bg-[#FFFFFF] shadow-subtle transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* 1. Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-xl p-2 text-[#353535] hover:bg-[#D9D9D9]/30 lg:hidden"
            aria-label="Abrir menú de navegación"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 overflow-hidden rounded-xl bg-black border border-[#353535] shadow-subtle p-0.5 group-hover:border-[#3C6E71] transition-all flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Luxora Style"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#353535] leading-none">
                LUXORA STYLE
              </span>
              <span className="text-[9px] font-bold text-[#3C6E71] tracking-widest uppercase mt-0.5">
                Official Store
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Search Bar with Instant Accessibility */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden md:flex flex-1 max-w-lg items-center"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tenis, ropa, perfumes, relojes..."
            className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] py-2 pl-10 pr-10 text-xs font-medium text-[#353535] placeholder:text-[#777777] shadow-inner focus:border-[#3C6E71] focus:ring-1 focus:ring-[#3C6E71] focus:outline-none transition-all"
          />
          <Search className="absolute left-3.5 h-4 w-4 text-[#777777]" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs font-bold text-[#777777] hover:text-[#353535]"
            >
              ×
            </button>
          )}
        </form>

        {/* 3. Action Navigation (Admin, Account, Cart) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Panel Direct Link */}
          <Link
            href="/admin/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] px-3 py-2 text-xs font-bold text-[#353535] hover:bg-[#D9D9D9]/30 hover:text-[#284B63] transition-all shadow-subtle"
          >
            <ShieldCheck className="h-4 w-4 text-[#3C6E71]" />
            <span>Admin</span>
          </Link>

          {/* Account / User Menu */}
          <div className="relative">
            {mounted && isAuthenticated && user ? (
              <div>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] p-2 sm:px-3 sm:py-2 text-xs font-bold text-[#353535] hover:bg-[#D9D9D9]/30 transition-all shadow-subtle cursor-pointer"
                >
                  <User className="h-4 w-4 text-[#3C6E71]" />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.firstName}</span>
                  <ChevronDown className="h-3 w-3 text-[#777777]" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2 shadow-dropdown z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-[#D9D9D9]">
                      <p className="text-xs font-bold text-[#353535] truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] text-[#777777] truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/account/orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#353535] hover:bg-[#D9D9D9]/30 transition-colors mt-1"
                    >
                      <PackageCheck className="h-4 w-4 text-[#3C6E71]" />
                      <span>Mis Pedidos</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#353535] hover:bg-[#D9D9D9]/40 transition-colors"
                    >
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] p-2 sm:px-3 sm:py-2 text-xs font-bold text-[#353535] hover:bg-[#D9D9D9]/30 transition-all shadow-subtle"
                title="Iniciar Sesión"
              >
                <User className="h-4 w-4 text-[#353535]" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
            )}
          </div>

          {/* Cart Icon & Counter */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-xl bg-[#353535] p-2.5 text-white hover:bg-[#284B63] transition-all shadow-subtle active:scale-95 cursor-pointer"
            aria-label="Ver Carrito de Compras"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#3C6E71] text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-fadeIn">
                {totalCartItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos en Luxora Style..."
            className="w-full rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] py-2 pl-9 pr-8 text-xs font-medium text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:ring-1 focus:ring-[#3C6E71] focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#777777]" />
        </form>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="border-t border-[#D9D9D9] bg-[#FFFFFF] p-4 lg:hidden space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-xl bg-[#3C6E71] p-3 text-white"
            >
              Catálogo
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] p-3 text-[#353535]"
            >
              Panel Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
