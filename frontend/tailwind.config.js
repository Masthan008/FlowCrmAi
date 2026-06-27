/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#c2dbff',
          300: '#94beff',
          400: '#5e99ff',
          550: '#2563eb', // Core blue accent
          600: '#1d4ed8',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        slate: {
          25: '#fcfdfd',
        }
      },
      boxShadow: {
        'glossy': '0 8px 32px 0 rgba(31, 38, 135, 0.03), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'glossy-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.02), 0 1px 1px 0 rgba(0, 0, 0, 0.01)',
        'glossy-md': '0 12px 40px 0 rgba(31, 38, 135, 0.05), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        'glossy-lg': '0 20px 50px 0 rgba(31, 38, 135, 0.08), 0 4px 8px 0 rgba(0, 0, 0, 0.03)',
        'glossy-inset': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.9)',
      },
      backgroundImage: {
        'glossy-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
        'radial-shine': 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.8) 0%, transparent 60%)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
