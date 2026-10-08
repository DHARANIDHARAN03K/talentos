import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Design tokens from 04_DESIGN.md ─────────────────────────
        'navy-900': '#0B1B3A',
        'navy-700': '#16305F',
        ink: '#0F172A',
        muted: '#64748B',
        surface: '#F7F8FA',
        card: '#FFFFFF',
        border: '#E2E8F0',
        'gold-500': '#C9A227',
        'trust-green': '#16A34A',
        'review-amber': '#D97706',
        'risk-red': '#DC2626',
        'info-blue': '#2563EB',
        // shadcn/ui semantic aliases
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#0B1B3A',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F7F8FA',
          foreground: '#0F172A',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#C9A227',
          foreground: '#0B1B3A',
        },
        ring: '#0B1B3A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1rem' }],
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
        sm: ['0.875rem', { lineHeight: '1.5rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.25rem', { lineHeight: '1.75rem' }],
        xl: ['1.75rem', { lineHeight: '2.25rem' }],
        '2xl': ['2.25rem', { lineHeight: '2.75rem' }],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        sm: '0.5rem',
        lg: '1rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
