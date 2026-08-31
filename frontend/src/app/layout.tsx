import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Luxora Style | Catálogo Oficial & Moda Exclusiva',
  description:
    'Descubre las últimas tendencias en moda, calzado, tenis, perfumes, relojes y accesorios exclusivos en Luxora Style.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
