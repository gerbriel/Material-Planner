module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        panel: 'var(--panel)',
        border: 'var(--border)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        muted: 'var(--muted)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)'
      },
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
