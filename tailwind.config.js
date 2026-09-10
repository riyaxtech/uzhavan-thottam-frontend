/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0D2A1A',    // Dark Forest Green (deeper)
          olive: '#1A4A2E',   // Deep Olive Green
          cream: '#F5E8CF',   // Cream / Beige
          gold: '#C8A96B',    // Gold Accent
          saffron: '#D4891A', // Saffron / Warm Gold
          maroon: '#5C1A1A',  // Dark Maroon
          brown: '#8B5E3C',   // Soft Brown
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        inter: ['Inter', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
}
