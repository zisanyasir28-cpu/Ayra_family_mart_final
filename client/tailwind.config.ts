import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        /* Semantic */
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* Brand palette — direct */
        bg:         'hsl(var(--bg))',
        surface:    'hsl(var(--surface))',
        'surface-2': 'hsl(var(--surface-2))',
        line:       'hsl(var(--line))',
        cream:      'hsl(var(--foreground))',
        saffron:    'hsl(var(--saffron))',
        coral:      'hsl(var(--coral))',
        sage:       'hsl(var(--sage))',
        blush:      'hsl(var(--blush))',
        plum:       'hsl(var(--plum))',
      },

      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        bangla:  ['Hind Siliguri', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        lg:    'var(--radius)',
        md:    'calc(var(--radius) - 4px)',
        sm:    'calc(var(--radius) - 6px)',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2rem',
      },

      boxShadow: {
        'soft':       '0 4px 24px -8px hsl(33 20% 4% / 0.5)',
        'lift':       '0 18px 40px -16px hsl(33 20% 2% / 0.6)',
        'saffron':    '0 0 32px -8px hsl(35 100% 66% / 0.45)',
        'coral':      '0 0 32px -8px hsl(12 100% 64% / 0.45)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },

      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring':    'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
