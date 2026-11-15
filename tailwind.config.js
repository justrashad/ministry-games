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
        // Theopardy!: blue and white only
        sea: {
          950: '#0A2152',
          900: '#0D2A66',
          800: '#12357A',
          700: '#24479A',
          600: '#2F58B8',
          500: '#1668E3',
          400: '#4C8DF0',
          300: '#B5CBF5',
          200: '#D3E1FA',
          100: '#F4F8FF',
        },
        ice: { 300: '#9CC4FF', 400: '#7FB2FF', 900: '#06235E' },
      },
      fontFamily: {
        display: ['"Fredoka Variable"', 'Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['"Nunito Variable"', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
