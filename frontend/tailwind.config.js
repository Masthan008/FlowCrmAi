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
          50: '#f0fdf4',   // mint green tint
          100: '#dcfce7',  // mint green light
          200: '#e0f2fe',  // sky blue tint
          300: '#bae6fd',  // sky blue light
          400: '#38bdf8',  // sky blue medium
          550: '#0d9488',  // teal green-blue primary accent
          600: '#0f766e',  // teal deep accent
          700: '#115e59',  // teal dark
          800: '#075985',  // ocean blue
          900: '#0c4a6e',  // deep navy
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
