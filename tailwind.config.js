/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'yellow': {
          DEFAULT: '#FFB400',
          50: '#FFF3D6',
          100: '#FFEDBF',
          200: '#FFE299',
          300: '#FFD673',
          400: '#FFCA4D',
          500: '#FFB400',
          600: '#D69700',
          700: '#B37D00',
          800: '#8F6400',
          900: '#6B4B00'
        },
        'dark': {
          100: '#1a1a1a',
          200: '#2d2d2d',
          300: '#3d3d3d',
          400: '#525252',
          500: '#737373',
          600: '#969696',
          700: '#d4d4d4',
          800: '#f5f5f5',
          900: '#000000'
        }
      },
      boxShadow: {
        'glow': '0 0 10px currentColor',
        'glow-lg': '0 0 20px currentColor',
        'chrome': '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'tech-gradient': 'linear-gradient(135deg, var(--color-yellow-400), var(--color-yellow-600))',
        'chrome-gradient': 'linear-gradient(135deg, rgba(255, 180, 0, 0.1), rgba(255, 180, 0, 0.05))',
      },
    },
  },
  plugins: [],
};