/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          tint: 'var(--color-primary-tint)',
        },
        warm: 'var(--color-warm-contrast)',
        textDark: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        border: 'rgba(26, 92, 56, 0.08)',
      },
      fontFamily: {
        heading: ['"Instrument Serif"', 'Lora', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'btn': '9999px',
      },
      boxShadow: {
        'glow': '0 12px 40px rgba(26, 92, 56, 0.12)',
      }
    },
  },
  plugins: [],
}
