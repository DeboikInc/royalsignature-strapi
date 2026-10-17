/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F1B2D',
        secondary: '#C9A961',
        accent: '#C9A961',
        light: '#F8F5F0',
        pale: '#E7D8B5',
      },
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
        'button': '8px'
      },
      fontFamily: {
        helvetica: ['Helvetica Neue', 'sans-serif'],
        georgia: ['Georgia', 'serif'],
        poppins: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      }
    }
  },
  plugins: [],
}