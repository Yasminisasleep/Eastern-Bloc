/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark theme surfaces
        background:  '#0f1419',
        surface:     '#1a0f2e',
        'surface-low':    '#1a0f2e',
        'surface-high':   '#2a1f3e',
        'surface-white':  'rgba(26, 15, 46, 0.8)',

        // Primary — Gold
        primary:          '#c9a227',
        'primary-mid':    '#d4af37',
        'primary-light':  'rgba(212, 175, 55, 0.15)',
        'on-primary':     '#0f1419',

        // Text
        'on-surface':         '#e8e6e1',
        'on-surface-muted':   '#b8956a',
        'on-surface-disabled':'#5a5a5a',

        // Outline
        outline:         '#d4af37',
        'outline-soft':  'rgba(212, 175, 55, 0.2)',

        // Semantic
        success: '#38a169',
        error:   '#ff6b6b',

        // Category chips
        cinema:     { bg: 'rgba(212, 175, 55, 0.15)', text: '#d4af37' },
        concert:    { bg: 'rgba(107, 20, 35, 0.4)', text: '#e8c547' },
        exhibition: { bg: 'rgba(56, 161, 105, 0.15)', text: '#68d391' },
        theatre:    { bg: 'rgba(99, 102, 241, 0.15)', text: '#a5b4fc' },
        festival:   { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' },
      },
      fontFamily: {
        sans: ['Georgia', 'serif'],
        serif: ['Georgia', 'serif'],
      },
      borderRadius: {
        card:   '8px',
        btn:    '5px',
        pill:   '9999px',
        modal:  '10px',
      },
      boxShadow: {
        card:  '0 5px 15px rgba(0,0,0,0.4)',
        float: '0 10px 30px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
