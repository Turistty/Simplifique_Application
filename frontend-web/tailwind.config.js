/** @type {import('tailwindcss').Config} */
export const darkMode = "class";
export const content = [
  "./app/**/*.{js,ts,jsx,tsx}",
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    colors:{
      mahleBlue: '#1e2a63',
      darkBlue: '#00205b',
      oceanBlue: '#41b6e6',
      frostBlue: '#c6d6e3',
      cotton: '#ededed',
      gray: '#c8c9c7',
      olive: '#b7ce95',
      electrifyingGreen: '#43b02a',
      forest: '#007749',
      yellow: '#f3d03e',
      ruby: 'ce0058',
      red:'#ba0c2f',
      violet: '#8e3a80',
      stellGray: '#75787b',
      black: '#000000',
    }
  },
};
export const plugins = [];
