module.exports = {
  darkMode: ['class', '[class~="theme-dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        card: {
          DEFAULT: 'var(--card)',
          2: 'var(--card-2)'
        },
        border: 'var(--border)',
        muted: 'var(--muted)',

        primary: {
          DEFAULT: 'var(--primary)',
          a10: 'var(--primary-a10)',
          a20: 'var(--primary-a20)',
          a30: 'var(--primary-a30)',
          a40: 'var(--primary-a40)',
          a50: 'var(--primary-a50)',
          a60: 'var(--primary-a60)'
        },

        success: { a10: 'var(--success-a10)', a20: 'var(--success-a20)', a30: 'var(--success-a30)' },
        warning: { a10: 'var(--warning-a10)', a20: 'var(--warning-a20)', a30: 'var(--warning-a30)' },
        danger:  { a10: 'var(--danger-a10)',  a20: 'var(--danger-a20)',  a30: 'var(--danger-a30)' },
        info:    { a10: 'var(--info-a10)',    a20: 'var(--info-a20)',    a30: 'var(--info-a30)' }
      },
      borderColor: { DEFAULT: 'var(--border)' },
      textColor:   { DEFAULT: 'var(--fg)' },
      backgroundColor: { DEFAULT: 'var(--bg)' },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px'
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.04)',
        md: '0 6px 18px rgba(0,0,0,0.25)',
        lg: '0 10px 30px rgba(0,0,0,0.35)'
      },
      spacing: {
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
      },
      transitionProperty: {
        DEFAULT: 'background-color, border-color, color, fill, stroke, box-shadow, transform'
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms'
      }
    }
  },
  plugins: []
}
