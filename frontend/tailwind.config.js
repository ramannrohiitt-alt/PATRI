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
        accent: {
          pale: '#FEFCE8',
          'pale-light': '#FFFDF0',
          'pale-warm': '#FAF5E4',
          brown: '#9C7B4F',
          'brown-light': '#B39264',
          'brown-dark': '#82653D',
          'brown-soft': '#F5EFE6',
        },
        railway: {
          canvas: '#FAF8F5',
          subtle: '#F5F1E8',
          card: 'rgba(255, 255, 255, 0.88)',
          'card-elevated': 'rgba(255, 255, 255, 0.96)',
          border: '#E7E0D2',
          'border-subtle': '#EFE9DC',
          dark: '#1C1917',
          muted: '#78716C',
          // Theme-adapted scale
          950: '#FAF8F5', // Canvas warm ivory
          900: '#FFFFFF', // Translucent card surface
          850: '#F5F1E8', // Elevated card / row
          800: '#E7E0D2', // Borders & separators
          750: '#DFD8C8', // Secondary borders
          700: '#D5CDBE', // Subdued borders
          600: '#78716C', // Tertiary text
          500: '#57534E', // Secondary text
          400: '#44403C', // Body text
          300: '#292524', // Headings
          200: '#1C1917', // High-contrast text
          100: '#0F172A', // Deepest text
          50: '#000000',
        },
        signal: {
          green: '#15803d',  // Safe / Available
          yellow: '#b45309', // Planned / Caution
          orange: '#c2410c', // Active Block
          red: '#b91c1c',    // Critical / Conflict
          blue: '#2563eb',   // Train Movement
          cyan: '#0891b2',   // Telemetry / Sensor
          purple: '#6d28d9', // S&T
          amber: '#b45309',  // Engineering
          indigo: '#4338ca'  // Traction
        }
      },
      boxShadow: {
        'warm-xs': '0 1px 2px 0 rgba(28, 25, 23, 0.04)',
        'warm-sm': '0 2px 4px -1px rgba(28, 25, 23, 0.05), 0 1px 2px -1px rgba(28, 25, 23, 0.03)',
        'warm-md': '0 4px 12px -2px rgba(28, 25, 23, 0.06), 0 2px 4px -1px rgba(28, 25, 23, 0.03)',
        'warm-lg': '0 12px 28px -4px rgba(28, 25, 23, 0.08), 0 4px 10px -2px rgba(28, 25, 23, 0.04)',
        'warm-xl': '0 20px 35px -6px rgba(28, 25, 23, 0.1), 0 8px 16px -4px rgba(28, 25, 23, 0.05)',
        'glow-pale': '0 0 25px rgba(254, 252, 232, 0.65)',
        'glow-brown': '0 0 20px rgba(156, 123, 79, 0.22)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
