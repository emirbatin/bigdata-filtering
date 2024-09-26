// tailwind.config.js
module.exports = {
  content: ['./src/renderer/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        shrink: 'shrink 5s linear forwards'
      },
      keyframes: {
        shrink: {
          '0%': { width: '100%' },
          '100%': { width: '0%' }
        }
      }
    }
  },
  plugins: []
}
