/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9F7AEA', // More vibrant purple for dark mode
          hover: '#805AD5',
        },
        // Premium Dark Palette
        dark: {
          900: '#0A0A0B', // Deep black
          800: '#141416', // Card background
          700: '#1C1C1F', // Border / Input
          600: '#28282C', // Hover
          500: '#3F3F46', // Muted text
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
    },
  },
  plugins: [],
}
