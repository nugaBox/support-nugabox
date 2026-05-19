/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-pretendard)'],
        mono: ['var(--font-pretendard)'],
      },
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        'canvas-subtle': 'rgb(var(--canvas-subtle) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        'elevated-hover': 'rgb(var(--elevated-hover) / <alpha-value>)',
        line: 'rgb(var(--border) / <alpha-value>)',
        'line-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--text) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',
        },
        'accent-soft': 'rgb(var(--accent-soft) / <alpha-value>)',
      },
      boxShadow: {
        card: 'var(--shadow-sm)',
        float: 'var(--shadow-md)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
