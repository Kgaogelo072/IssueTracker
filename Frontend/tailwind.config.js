/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        linear: {
          "primary": "#7C3AED", // violet-600
          "primary-content": "#ffffff",
          "secondary": "#22D3EE", // cyan-400
          "accent": "#9b87f5", // slightly softer violet
          "neutral": "#1C1F26",
          "base-100": "#0B0F14",
          "base-200": "#0F141A",
          "base-300": "#151A21",
          "info": "#7C3AED", // align info buttons to violet
          "success": "#22C55E",
          "warning": "#F59E0B",
          "error": "#EF4444",
          "link": "#A78BFA",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.6rem",
          "--rounded-badge": "0.4rem"
        }
      },
      "dark",
      "light"
    ],
  },
}
