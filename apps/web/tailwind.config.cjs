const questitPreset = require('@questit/config/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [questitPreset]
};
