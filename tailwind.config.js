/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*.{html,js,css}", "./views/*.ejs", "./views/layout/*.ejs", "./views/component/*.ejs"],
  theme: {
    extend: {
      // screens: {
      //   xs: "320px",
      // },
      fontFamily: {
        "open-sans": ['"Open Sans"', "sans-serif"],
      },
      // colors: {
      //   biruTua: "#1E3135",
      // },
      // fontSize: {
      //   xxs: "0.65rem",
      // },
    },
  },
  plugins: [
    {
      tailwindcss: {},
      autoprefixer: {},
    },
  ],
};
