import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        // ZedIdeaArena Light Mode Palette
        zed: {
          background: '#F8F8FC',
          'background-light': '#FFFFFF',
          foreground: '#0F172A',
          'foreground-secondary': '#64748B',
          primary: '#4F46E5', // Indigo
          'primary-dark': '#3730A3',
          accent: '#9333EA', // Purple
          'accent-dark': '#6B21A8',
          success: '#10B981', // Green
          surface: 'rgba(15, 23, 42, 0.05)',
          'surface-hover': 'rgba(15, 23, 42, 0.08)',
          border: 'rgba(15, 23, 42, 0.1)',
          'border-hover': 'rgba(15, 23, 42, 0.15)',
        },
      },
      backgroundColor: {
        zed: {
          background: '#F8F8FC',
          'background-light': '#FFFFFF',
          surface: 'rgba(15, 23, 42, 0.05)',
          'surface-hover': 'rgba(15, 23, 42, 0.08)',
        },
      },
      textColor: {
        zed: {
          foreground: '#0F172A',
          'foreground-secondary': '#64748B',
        },
      },
      borderColor: {
        zed: {
          border: 'rgba(15, 23, 42, 0.1)',
          'border-hover': 'rgba(15, 23, 42, 0.15)',
        },
      },
      borderRadius: {
        'zed-sm': '12px',
        'zed-md': '16px',
        'zed-lg': '24px',
        'zed-xl': '32px',
        'zed-pill': '9999px',
      },
      boxShadow: {
        'zed-glow-primary': '0 10px 25px -5px rgba(79, 70, 229, 0.3)',
        'zed-glow-accent': '0 10px 25px -5px rgba(147, 51, 234, 0.3)',
        'zed-glow-success': '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
        'zed-glow-sm': '0 5px 15px -3px rgba(79, 70, 229, 0.15)',
      },
      backdropBlur: {
        'zed-xl': 'blur(40px)',
        'zed-2xl': 'blur(60px)',
      },
      backgroundImage: {
        'zed-gradient-primary': 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
        'zed-gradient-primary-hover': 'linear-gradient(135deg, #3730A3 0%, #6B21A8 100%)',
      },
      animation: {
        'zed-fade-up': 'fadeUp 0.4s ease-out',
        'zed-glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
export default config
