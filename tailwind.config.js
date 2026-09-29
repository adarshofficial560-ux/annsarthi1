/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#0B1329',
          sidebar: '#070C1E',
          card: '#111C3A',
          border: '#1E2D58',
          accent: '#2563EB',
        },
        restaurant: {
          bg: '#052317',
          sidebar: '#03170F',
          card: '#083322',
          border: '#0F4D35',
          accent: '#10B981',
        },
        ngo: {
          bg: '#171033',
          sidebar: '#100B24',
          card: '#22184A',
          border: '#35276E',
          accent: '#8B5CF6',
        },
      },
    },
  },
  plugins: [],
};
