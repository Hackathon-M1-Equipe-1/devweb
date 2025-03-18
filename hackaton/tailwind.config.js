/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        customGray: "#F3F4F4", // Ta couleur personnalisée
      },
    },
  },
  plugins: [],
};
