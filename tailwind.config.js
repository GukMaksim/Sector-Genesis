/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sci-fi-blue': '#00f2ff',
        'sci-fi-red': '#ff003c',
        'sci-fi-green': '#00ff41',
      },
      backgroundImage: {
        'noise': "url('/assets/noise.png')",
      }
    },
  },
  plugins: [],
}
