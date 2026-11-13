/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FAF7F2',
          100: '#F4EFE6',
          200: '#EAE2D3',
          300: '#DCD0BC',
        },
        espresso: {
          900: '#191715',
          800: '#2C2825',
          600: '#5C554E',
          400: '#8C837A',
        },
        botanical: {
          900: '#162A22',
          800: '#1E3A2F',
          700: '#2A5243',
          100: '#E3ECE8',
        },
        terracotta: {
          600: '#C86D51',
          500: '#D97F63',
          100: '#F9EBE6',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}