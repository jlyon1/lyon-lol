module.exports = {
  purge: ["./templates/**/*.html", "./theme/**/*.html", "./templates/*.html"],
  theme: {},
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
