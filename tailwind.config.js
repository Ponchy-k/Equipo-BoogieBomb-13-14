/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: { 50: '#FDFBF7', 100: '#F8F4EC', 200: '#EFE7D8', 300: '#DFD1B8', 400: '#C7B18E', 500: '#AC9066', 600: '#8E734D', 700: '#6E5638', 800: '#4D3A24', 900: '#2C2014' },
        noir: { DEFAULT: '#141210', soft: '#211E1B', muted: '#3B3632' },
        champagne: '#E5C492', roseaccent: '#E8D5CE',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(28, 25, 23, 0.05)',
        'elevated': '0 20px 40px -10px rgba(44, 32, 20, 0.10)',
        'glow': '0 0 25px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}
