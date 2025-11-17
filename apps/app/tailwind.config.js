/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Charter', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        'display': 'clamp(2.5rem, 5vw, 4rem)',
        'h1': 'clamp(2rem, 4vw, 3rem)',
        'h2': 'clamp(1.5rem, 3vw, 2.25rem)',
        'h3': 'clamp(1.25rem, 2.5vw, 1.75rem)',
        'body-lg': 'clamp(1.125rem, 1.5vw, 1.3125rem)',
        'body': 'clamp(0.9375rem, 1.2vw, 1rem)',
        'body-sm': 'clamp(0.8125rem, 1vw, 0.875rem)',
        'caption': '0.75rem',
      },
      lineHeight: {
        'display': '1.1',
        'h1': '1.2',
        'h2': '1.3',
        'h3': '1.4',
        'body-lg': '1.7',
        'body': '1.6',
        'body-sm': '1.5',
        'caption': '1.4',
      },
      letterSpacing: {
        'display': '-0.02em',
        'h1': '-0.015em',
        'h2': '-0.01em',
        'h3': '-0.005em',
        'body-sm': '0.01em',
        'caption': '0.02em',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
      maxWidth: {
        'reading': '680px',
        'narrow': '540px',
      },
      colors: {
        'bg-base': '#0a0a0a',
        'bg-elevated': '#121212',
        'bg-overlay': '#1a1a1a',
        'bg-hover': '#1f1f1f',
        'bg-active': '#252525',
        'text-primary': '#e8e8e8',
        'text-secondary': '#b3b3b3',
        'text-tertiary': '#808080',
        'text-disabled': '#4d4d4d',
        'text-inverse': '#0a0a0a',
      },
      backdropBlur: {
        '20': '20px',
        '24': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'accent': '0 4px 16px rgba(26, 115, 232, 0.1)',
        'accent-lg': '0 8px 24px rgba(26, 115, 232, 0.12)',
        'accent-hover': '0 6px 20px rgba(26, 115, 232, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
}
