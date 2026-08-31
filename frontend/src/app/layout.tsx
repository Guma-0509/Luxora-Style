import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

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
  // Anti-flicker script executed synchronously before hydration
  const themeInitScript = `
    (function() {
      try {
        var savedTheme = localStorage.getItem('luxora_theme');
        var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = 'light';
        if (savedTheme === 'dark' || (!savedTheme && systemDark) || (savedTheme === 'system' && systemDark)) {
          theme = 'dark';
        }
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased font-sans transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
