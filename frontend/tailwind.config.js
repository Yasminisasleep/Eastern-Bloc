/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0d1117',
        surface: '#15202d',
        'surface-low': '#162230',
        'surface-high': '#253445',
        'surface-white': 'rgba(17, 26, 37, 0.82)',
        primary: '#f1b44c',
        'primary-mid': '#f4ce89',
        'primary-light': 'rgba(244, 206, 137, 0.16)',
        'on-primary': '#1a1308',
        'on-surface': '#f7f1e3',
        'on-surface-muted': '#cdbfa8',
        'on-surface-disabled': '#8f8473',
        outline: '#f4ce89',
        'outline-soft': 'rgba(244, 206, 137, 0.16)',

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
        sans: ['Manrope', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        card:   '24px',
        btn:    '999px',
        pill:   '9999px',
        modal:  '28px',
      },
      boxShadow: {
        card:  '0 14px 40px rgba(0,0,0,0.28)',
        float: '0 24px 80px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}
