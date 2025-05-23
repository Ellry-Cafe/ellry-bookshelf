/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        tealbrand: '#d06e3f',
        coffeebrown: '#000000',
        creamwhite: '#F8F8F5',
      },
    },
  },
  plugins: [],
}

