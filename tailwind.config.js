// Only the title being built is scanned, so one game's styles never ship with another.
const title = (process.env.TITLE || 'showdown').trim();

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/core/**/*.{ts,tsx}', `./src/games/${title}/**/*.{ts,tsx,html}`],
  // Button variants and sizes are composed dynamically (btn-${variant}), so keep them in the build.
  safelist: [{ pattern: /^btn-(sm|md|lg|xl|primary|gold|success|danger|ghost|subtle)$/ }],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#0b0828',
          900: '#130d3d',
          800: '#1c1456',
          700: '#271c73',
          600: '#32268f',
          500: '#4033b0',
          400: '#5a4fd0',
          300: '#8279e6',
          200: '#b3adf3',
          100: '#e1defc',
        },
        gold: {
          50: '#fffaeb',
          100: '#fff0c4',
          200: '#ffe08a',
          300: '#ffcf4d',
          400: '#f6ba25',
          500: '#dd9c0c',
          600: '#b27808',
        },
        cream: '#fff7e6',
        ink: '#1b1446',
        // Theopardy!
        sea: {
          950: '#061A2E',
          900: '#0A2239',
          800: '#0D2A47',
          700: '#17385C',
          600: '#1F4C7A',
          500: '#1668E3',
          400: '#4C8DF0',
          300: '#9DB8D9',
          200: '#C9DBF2',
          100: '#EAF3FF',
        },
        coral: { 300: '#FFD3B8', 400: '#FF8A5B', 500: '#F26A3D', 900: '#3B1503' },
        mint: { 300: '#8EF0D0', 900: '#053527' },
      },
      fontFamily: {
        display: ['"Fredoka Variable"', 'Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['"Nunito Variable"', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
