/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f8f5f0',
          100: '#f3efe7',
          200: '#e7dfd3',
          300: '#d8cbb7',
          400: '#a98d60',
          500: '#6d5843',
          700: '#2d3748',
          800: '#1d2a3a',
          900: '#172033',
        },
        stone: {
          50: '#f9f5f0',
          100: '#f6f1e8',
          200: '#efe7dd',
          300: '#e6ded1',
          400: '#d7c7b4',
          500: '#bca98b',
        },
        amber: {
          50: '#fdf8ee',
          100: '#f9edd1',
          200: '#f3d79d',
          300: '#e8c56d',
          400: '#d9a746',
          500: '#b7791f',
          600: '#9b6717',
          700: '#7c5114',
          800: '#5d3d11',
        },
        success: {
          100: '#eaf5ee',
          500: '#2f5d3a',
        },
        warn: {
          100: '#f9efe9',
          500: '#b15a3c',
        },
        line: {
          100: '#e8e0d6',
          200: '#d9d0c5',
        }
      },
      fontFamily: {
        heading: ['Sora', 'Manrope', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'Source Sans 3', 'sans-serif'],
        sans: ['Inter', 'Source Sans 3', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 0 rgba(23, 32, 51, 0.04), 0 10px 20px rgba(23, 32, 51, 0.03)',
        subtle: '0 0 0 1px rgba(23, 32, 51, 0.05)',
      },
      borderRadius: {
        panel: '14px',
        card: '16px',
        pill: '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
