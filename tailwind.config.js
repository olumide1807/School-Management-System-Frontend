/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      width: {
        "max-content": "max-content",
      },
      height: {
        "max-content": "max-content",
      },
      colors: {
        primary: "#43A6CA",
        secondary: "#001C26",
        tertiary: "#0E7094",
        buttonInactive: "#7E969F",
        asteriskRed: "#FE3030",
        lightGreen: "#CEF8DA",
        bgLightGreen: "rgba(206, 248, 218, 0.33)",
        inActive: "#F480A1",
        removeRed: "#E72245",
        dropdownColor: "#757575",
        bgRemoveRed: "rgba(231, 34, 69, 0.13)",
        borderRight: "rgba(218, 200, 209, 1)",
        "tertiary-2": "#8DABB7",
        placeholder: "#969696",
        "text-pry": "#0F0F0F",
        "text-sec": "#323232",
        "text-ter": "#8C8C8C",
        "text-active": "#015338",
        "text-inactive": "#9E143C",

        gray: {
          1: "#5A5A5A",
          2: "#777777",
        },
        bg: {
          1: "#CCE9F4",
          2: "#E4F5FC",
          3: "#304966",
          4: "#07284F",
          5: "#005574",
          6: "#1F2122",
          7: "#F7F7F7",
          8: "#DBF0F8",
          active: "#7DE0BF",
          inactive: "#F480A1",
        },
      },
      fontFamily: {
        roboto: ['"Roboto"', "sans-serif"],
      },
      letterSpacing: {
        widest: ".25em", // Custom letter spacing
        wider: ".15em",
        normal: "0em", // Default letter spacing
      },
    },
  },
  plugins: [],
};
