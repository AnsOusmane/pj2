/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      screens: {
        '2xl': '1536px',   // Tailwind natif
        '3xl': '1800px',
        '4xl': '2200px',
        '5xl': '2560px',
        'uw': '3440px'     // ultrawide 21:9
      },
      maxWidth: {
        '3xl': '1600px',
        '4xl': '1800px',
        '5xl': '2100px',
        'uw': '3200px'
      },
      spacing: {
        'section': '7rem',
        'section-lg': '10rem'
      },
           fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
        ubuntu: ['Ubuntu', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        sharetech: ['"Share Tech"', 'sans-serif'],
        exo2: ['"Exo 2"', 'sans-serif'],
        teko: ['Teko', 'sans-serif'],
        play: ['Play', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        sciencegothic: ['"Science Gothic"', 'sans-serif'],
      },
    }
  },
  plugins: [],
};
