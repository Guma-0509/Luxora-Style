/** @type {import('tailwindcss').Config} */
module.exports = {
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
          carbon: '#353535',       // Carbón principal: textos, botones primarios, estructura
          teal: '#3C6E71',         // Verde petróleo / Teal: acentos, CTAs, activos, badges
          white: '#FFFFFF',        // Blanco puro: fondos principales, tarjetas
          gray: '#D9D9D9',         // Gris claro: bordes, separadores, fondos auxiliares
          petroleum: '#284B63',    // Azul petróleo oscuro: hover, contraste profundo
        },
        // Compatibilidad semántica
        carbon: '#353535',
        teal: {
          DEFAULT: '#3C6E71',
          hover: '#284B63',
          light: '#EBF2F2',
        },
        petroleum: {
          DEFAULT: '#284B63',
          dark: '#1C3547',
        },
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(53, 53, 53, 0.06), 0 1px 2px -1px rgba(53, 53, 53, 0.04)',
        card: '0 4px 6px -1px rgba(53, 53, 53, 0.07), 0 2px 4px -2px rgba(53, 53, 53, 0.05)',
        dropdown: '0 10px 15px -3px rgba(53, 53, 53, 0.1), 0 4px 6px -4px rgba(53, 53, 53, 0.06)',
      },
    },
  },
  plugins: [],
};
