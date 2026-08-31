import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wally Commerce | Catálogo & POS de Moda',
  description:
    'Catálogo exclusivo de moda, tenis, perfumes, relojes, t-shirts, pantalones y gorras.',
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
