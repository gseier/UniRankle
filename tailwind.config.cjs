/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Define the keyframes for the gradient movement
      keyframes: {
        'gradient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      // 2. Define the custom animation utility
      animation: {
        'gradient-flow': 'gradient-flow 10s ease infinite',
      },
      // 3. Define custom background sizes for the animation
      backgroundSize: {
        '400%': '400% 400%',
      },
    },
  },
  plugins: [],
}