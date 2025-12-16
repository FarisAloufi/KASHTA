/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
"main-bg": "var(--main-bg)",
        "second-bg": "var(--second-bg)",
        "main-accent": "var(--main-accent)",
        "main-text": "var(--main-text)",
        "second-text": "var(--second-text)",

      },
      fontFamily: {
        sans: ["Kumbh Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}