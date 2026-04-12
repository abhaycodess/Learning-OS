/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--brand-rgb) / <alpha-value>)',
        'primary-light': 'rgb(var(--brand-light-rgb) / <alpha-value>)',
        'primary-lighter': 'rgb(var(--brand-lighter-rgb) / <alpha-value>)',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        blue: '#3b82f6',
        pink: '#ec4899',
        green: '#10b981',
        amber: '#d97706',
        emerald: '#10b981',
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        heading: ['DM Sans', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      spacing: {
        s1: '8px',
        s2: '16px',
        s3: '24px',
        s4: '32px',
        s5: '40px',
        s6: '48px',
        s8: '64px',
        s10: '80px',
      },
      borderRadius: {
        ui: '14px',
      },
      boxShadow: {
        panel: '0 6px 24px rgba(17, 22, 29, 0.08)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        floatSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-up-1': 'fadeUp 0.5s ease-out 0.05s both',
        'fade-up-2': 'fadeUp 0.5s ease-out 0.1s both',
        'fade-up-3': 'fadeUp 0.5s ease-out 0.15s both',
        'fade-up-4': 'fadeUp 0.5s ease-out 0.2s both',
        'float-soft': 'floatSoft 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}

