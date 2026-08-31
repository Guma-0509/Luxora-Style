/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Principal Exacta de Referencia
        brand: {
          carbon: '#353535',       // Carbón principal
          teal: '#3C6E71',         // Verde petróleo / Teal
          white: '#FFFFFF',        // Blanco puro
          gray: '#D9D9D9',         // Gris claro
          petroleum: '#284B63',    // Azul petróleo oscuro
        },
        // Compatibilidad semántica
        carbon: '#353535',
        teal: {
          DEFAULT: '#3C6E71',
          hover: '#284B63',
          light: '#EBF2F2',
          dark: '#4D8B8E',
        },
        petroleum: {
          DEFAULT: '#284B63',
          dark: '#1C3547',
          light: '#325E7C',
        },
        // Modo oscuro semántico
        dark: {
          bg: '#18191A',
          surface: '#242526',
          elevated: '#2E3236',
          border: '#3A3B3C',
          text: '#F5F6F8',
          muted: '#A8ABB2',
        },
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        dropdown: 'var(--shadow-dropdown)',
      },
    },
  },
  plugins: [],
};
