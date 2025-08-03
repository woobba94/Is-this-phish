/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        phishing: {
          'A': '#ef4444', // red-500
          'B': '#f97316', // orange-500
          'C': '#eab308', // yellow-500
          'D': '#22c55e', // green-500
          'E': '#06b6d4', // cyan-500
          'F': '#3b82f6', // blue-500
        }
      }
    },
  },
  plugins: [],
} 