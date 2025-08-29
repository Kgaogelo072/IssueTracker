/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        }
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        "dark-elegant": {
          "primary": "#ffffff",
          "primary-content": "#000000",
          "secondary": "#9ca3af",
          "secondary-content": "#000000",
          "accent": "#6b7280",
          "accent-content": "#ffffff",
          "neutral": "#111827",
          "neutral-content": "#ffffff",
          "base-100": "#000000",
          "base-200": "#111827",
          "base-300": "#1f2937",
          "base-content": "#ffffff",
          "info": "#6b7280",
          "info-content": "#ffffff",
          "success": "#10b981",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#000000",
          "error": "#ef4444",
          "error-content": "#ffffff",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.375rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem"
        }
      },
      "dark",
      "light"
    ],
  },
}
