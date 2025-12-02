/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
theme: {
  extend: {
    screens: {
      'xxl': '1600px',
      'xxxl': '1920px',
      'xxxxl': '2560px',
      'uw': '3440px', // ultrawide
    },
    maxWidth: {
      'xxl': '1600px',
      'xxxl': '1920px',
      'xxxxl': '2560px',
      'uw': '3200px',
    },
    spacing: {
      'section': '7rem',   // Pour py-section
      'section-lg': '10rem'
    }
  }
}
,
  plugins: [],
};
