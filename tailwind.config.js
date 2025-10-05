/** @type {import('tailwindcss/config').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // KEEP ONLY THE CUSTOM COLORS HERE
      colors: {
        'academic-indigo': '#2c3e50', 
        'academic-cream': '#fcf4d9', 
        'academic-orange': '#e89e6c', 
      }
    },
  },
  plugins: [],
}