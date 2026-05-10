/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          black: '#000000',
          dark: '#121212',
          darkGray: '#181818',
          gray: '#282828',
          lightGray: '#B3B3B3',
          white: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}
