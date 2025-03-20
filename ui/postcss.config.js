module.exports = {
  plugins: [
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
    require('@ale-run/postcss-optimizer'),
    require('cssnano')
  ]
};
