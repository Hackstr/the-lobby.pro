/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cs2-orange': '#FF6B00',
        'cs2-blue': '#4A90E2',
        'solana-purple': '#9945FF',
        'solana-green': '#14F195',
      },
      fontFamily: {
        'gaming': ['Orbitron', 'monospace'],
      },
    },
  },
  plugins: [],
}
