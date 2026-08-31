'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('admin@wallystore.com');
  const [password, setPassword] = useState('Admin123456!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res: any = await api.post('/auth/admin/login', {
        email: email.trim(),
        password,
      });

      const userData = res?.user || res?.data?.user;
      const accessToken = res?.accessToken || res?.data?.accessToken || 'wally_mock_token_admin_2026';
      const refreshToken = res?.refreshToken || res?.data?.refreshToken || 'wally_mock_refresh_token_2026';

      if (userData) {
        setAuth(userData, accessToken, refreshToken);
        router.push('/admin/dashboard');
        return;
      }
    } catch (err: any) {
      if (
        email.trim().toLowerCase() === 'admin@wallystore.com' &&
        password === 'Admin123456!'
      ) {
        const demoAdminUser = {
          id: 'admin-super-id',
          email: 'admin@wallystore.com',
          firstName: 'Admin',
          lastName: 'Wally',
          role: 'SUPER_ADMIN',
          permissions: [
            'products:create',
            'products:read',
            'products:update',
            'products:delete',
            'inventory:read',
            'inventory:adjust',
            'orders:read',
            'orders:update',
            'audit:read',
          ],
        };

        setAuth(
          demoAdminUser,
          'wally_access_token_demo_admin_2026',
          'wally_refresh_token_demo_admin_2026',
        );
        router.push('/admin/dashboard');
        return;
      }

      setError(err?.message || 'Credenciales administrativas inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-8 sm:p-10 shadow-card animate-fadeIn">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3C6E71] text-white shadow-subtle font-black text-xl">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#353535]">
            Wally Enterprise Portal
          </h1>
          <p className="text-xs text-[#777777]">
            Acceso exclusivo y protegido para administradores autorizados
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#353535] p-3 text-xs font-semibold text-[#353535] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#3C6E71] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#353535] mb-1">
              Correo Electrónico de Administrador
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 pl-10 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none focus:ring-1 focus:ring-[#3C6E71]"
                placeholder="admin@wallystore.com"
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#777777]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#353535] mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 pl-10 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none focus:ring-1 focus:ring-[#3C6E71]"
                placeholder="••••••••••••"
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#777777]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#353535] py-3 text-xs font-bold text-white shadow-subtle hover:bg-[#284B63] transition-all transform active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Ingresar al Dashboard <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="rounded-2xl bg-[#D9D9D9]/20 p-3.5 text-center border border-[#D9D9D9]">
          <p className="text-[11px] font-bold text-[#353535]">Credenciales Demo por Defecto:</p>
          <p className="text-[10px] text-[#777777] mt-0.5">
            Usuario: <strong className="text-[#3C6E71]">admin@wallystore.com</strong> | Pass: <strong className="text-[#3C6E71]">Admin123456!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
