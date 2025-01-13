module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // New app directory
    './styles/**/*.css', // Corrected: added missing comma
    './components/**/*.{js,ts,jsx,tsx}', // Include components
  ],
  theme: {
    extend: {
      backgroundImage: {
        'black-gradient': 'linear-gradient(to bottom, #000, #333)', // Add custom gradient
      },
    },
  },
  plugins: [],
};
