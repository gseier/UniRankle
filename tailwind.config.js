module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Define the keyframes for the gradient movement (Same as before)
      keyframes: {
        'gradient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      // 2. Define the custom animation utility (Same as before)
      animation: {
        'gradient-flow': 'gradient-flow 10s ease infinite',
      },
      // 3. Define custom background sizes for the animation (Same as before)
      backgroundSize: {
        '400%': '400% 400%',
      },
      // 4. Custom Academic Colors (Optional but helpful for consistency)
      colors: {
        'academic-indigo': '#2c3e50',
        'academic-cream': '#fcf4d9',
        'academic-orange': '#e89e6c',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Add this line
  ],
}