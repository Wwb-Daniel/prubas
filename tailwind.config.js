/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#FF3366',
          pink: '#FF33CC', 
          purple: '#9933FF',
          blue: '#3366FF',
        },
        gray: {
          850: '#1a1a1a',
          950: '#0a0a0a',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(45deg, #FF3366, #FF33CC, #9933FF, #3366FF)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 51, 102, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};