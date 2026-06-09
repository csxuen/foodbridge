/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#1C2B1E',
        lime: '#C8F04A',
        parchment: '#F5F2EC',
        terracotta: '#E8431A',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'btn': '9999px',
      },
      boxShadow: {
        'glow': '0 12px 40px rgba(28, 43, 30, 0.12)',
      }
    },
  },
  plugins: [],
}
