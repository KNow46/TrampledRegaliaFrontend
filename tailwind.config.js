const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#1a1a2e',
        'game-text': '#e0e0e0',
        'game-link': '#8d99ae',
        'game-input-bg': '#2e2e4a',
        'game-input-border': '#4a4a6a',
        'game-button-bg': '#4a4e69',
        'game-button-hover': '#6a6f8f',
        'form-bg': '#232946',
        'label-text': '#b8c1ec',
        'button-strong': '#5e548e',
        'button-strong-hover': '#7c72a6',
        'error': '#ff6b6b',
      },
      fontFamily: {
        sans: ['"Press Start 2P"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}

