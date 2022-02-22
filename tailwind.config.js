module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      gridTemplateRows: {
        home: "50px 1fr 1fr 1fr 25px",
        works: "50px 0.65fr 50px 1.35fr 25px",
      },
    },
  },
  plugins: [],
};
