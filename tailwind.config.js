/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./partials/**/*.{html,js}",
    "./assets/**/*.{js,css}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a1a1a", // Main background
        secondary: "#242424", // Secondary background
        accent: "#808080", // Accent color
        zinc: {
          700: "#3f3f46",
          800: "#27272a",
        },
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
      },
      typography: (theme) => ({
        invert: {
          css: {
            "--tw-prose-body": theme("colors.zinc.400"),
            "--tw-prose-headings": theme("colors.zinc.200"),
            "--tw-prose-links": theme("colors.blue.400"),
            "--tw-prose-code": theme("colors.zinc.200"),
            "--tw-prose-quotes": theme("colors.zinc.200"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
