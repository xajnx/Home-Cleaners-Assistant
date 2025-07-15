// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        cobalt:"#0047AB",
        sunflower:"#FFC300",
        brand:{
          light:"#FFF3C4",
          DEFAULT:"#F4C430",
          dark:"#C9A700"
        }
      }
    }
  },
  plugins: []
}