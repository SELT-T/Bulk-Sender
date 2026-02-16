/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#d946ef', // Fuchsia / Stylish Pink-Purple (No Blue)
        darkBg: '#1f1228', // Deep Violet/Plum background
        cardBg: '#2a1124', // Stylish dark cards
      }
    },
  },
  plugins: [],
}