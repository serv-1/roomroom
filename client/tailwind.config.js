/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["Roboto", "sans-serif"],
    },
    boxShadow: {
      none: "0 0 #000000",
      1: "0px 1px 1px rgba(0, 0, 0, 0.25)",
      2: "0px 2px 2px rgba(0, 0, 0, 0.25)",
      3: "0px 3px 3px rgba(0, 0, 0, 0.25)",
      4: "0px 4px 4px rgba(0, 0, 0, 0.25)",
      6: "0px 6px 6px rgba(0, 0, 0, 0.25)",
      8: "0px 8px 8px rgba(0, 0, 0, 0.25)",
      12: "0px 12px 12px rgba(0, 0, 0, 0.25)",
      16: "0px 16px 16px rgba(0, 0, 0, 0.25)",
      24: "0px 24px 24px rgba(0, 0, 0, 0.25)",
    },
    fontSize: {
      btn: [
        "14px",
        { lineHeight: "20px", fontWeight: "500", letterSpacing: "1px" },
      ],
      xs: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      sm: ["14px", { lineHeight: "20px", fontWeight: "400" }],
      base: ["16px", { lineHeight: "24px", fontWeight: "400" }],
      6: ["18px", { lineHeight: "24px", fontWeight: "500" }],
      5: ["20px", { lineHeight: "28px", fontWeight: "500" }],
      4: ["24px", { lineHeight: "32px", fontWeight: "400" }],
      3: ["28px", { lineHeight: "36px", fontWeight: "400" }],
      2: ["32px", { lineHeight: "40px", fontWeight: "400" }],
      1: ["36px", { lineHeight: "44px", fontWeight: "400" }],
    },
    screens: {
      md: "744px",
      lg: "1440px",
    },
    extend: {
      colors: {
        dark: "#161B25",
        "dark-1": "#222730",
        "dark-2": "#262B34",
        "dark-3": "#282D36",
        "dark-4": "#2B3039",
        "dark-6": "#30343D",
        "dark-8": "#323740",
        "dark-12": "#373B44",
        "dark-16": "#393D45",
        "dark-24": "#3B4048",
      },
    },
  },
  plugins: [],
};
