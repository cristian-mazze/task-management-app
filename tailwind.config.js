/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 esto es clave para que el toggle funcione
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
