/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#f43f5e',
        'accent-soft': 'rgba(244, 63, 94, 0.12)',
        panel: '#fafafa',
        muted: '#6b7280',
        border: '#ececec',
        danger: '#dc2626',
        warning: '#ea580c',
        success: '#16a34a',
      }
    },
  },
  plugins: [],
}