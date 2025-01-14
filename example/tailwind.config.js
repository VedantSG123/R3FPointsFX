/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        subtle: '0 4px 2.6875em',
      },
    },
  },
  plugins: [],
  darkMode: ['selector', '.dark-theme'],
}
