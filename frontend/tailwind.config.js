/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fffaf1",
        blush: "#ffdfe8",
        mint: "#dff7ee",
        rosewood: "#8f5a68",
        pine: "#325f56",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 32px rgba(143, 90, 104, 0.14)",
      },
      backgroundImage: {
        "aesthetic-mesh":
          "radial-gradient(circle at 10% 10%, rgba(255, 223, 232, 0.52), transparent 42%), radial-gradient(circle at 90% 0%, rgba(223, 247, 238, 0.58), transparent 40%), radial-gradient(circle at 50% 100%, rgba(255, 250, 241, 0.95), rgba(255, 255, 255, 0.95))",
      },
    },
  },
  plugins: [],
};
