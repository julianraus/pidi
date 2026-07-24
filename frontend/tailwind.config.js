/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e1f',
        },
        deck: {
          800: '#0b3b2e',
          900: '#07291f',
          950: '#041b14',
        },
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Barlow', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.05), 0 1px 3px rgba(16, 24, 40, 0.04)',
        'card-hover': '0 12px 28px -10px rgba(6, 78, 59, 0.18), 0 4px 10px -4px rgba(16, 24, 40, 0.08)',
        glow: '0 0 0 1px rgba(52, 211, 153, 0.25), 0 0 18px rgba(52, 211, 153, 0.18)',
      },
    },
  },
  plugins: [],
};
