/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   "#1e3a5f",
        secondary: "#2563eb",
        accent:    "#0ea5e9",
        surface:   "#f0f4f8",
        success:   "#22c55e",
        warning:   "#f59e0b",
        danger:    "#ef4444",
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}