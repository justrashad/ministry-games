/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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
      },
      fontFamily: {
        display: ['"Fredoka Variable"', 'Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['"Nunito Variable"', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
