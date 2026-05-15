/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandYellow: '#fbbf24',
        brandBlue: '#0f172a',
      },
    },
  },
  plugins: [],
}