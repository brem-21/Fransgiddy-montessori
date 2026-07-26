import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#000d10",
        ash: "#8e8e95",
        pebble: "#d5d3d4",
        midnight: "#0f0f1c",
        charcoal: "#151623",
        clay: "#bc7155",
        primary: {
          DEFAULT: "#bc7155",
          50: "#faf3ef",
          100: "#f3e2d8",
          200: "#e6c5b1",
          300: "#d8a98a",
          400: "#ca8d68",
          500: "#bc7155",
          600: "#a35d43",
          700: "#7f4834",
          800: "#5c3425",
          900: "#3a2017",
          950: "#000d10",
        },
      },
      fontFamily: {
        sans: ["var(--font-helveticanowdisplay)", "Helvetica Neue", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        caption: ["17px", { lineHeight: "17px" }],
        nav: ["20px", { lineHeight: "20px" }],
        subheading: ["23px", { lineHeight: "23px", letterSpacing: "-0.23px" }],
        "heading-sm": ["30px", { lineHeight: "30px" }],
        heading: ["37px", { lineHeight: "37px", letterSpacing: "-0.37px" }],
        "heading-lg": ["52px", { lineHeight: "52px", letterSpacing: "-0.52px" }],
        display: ["63px", { lineHeight: "63px", letterSpacing: "-1.26px" }],
        "display-xl": ["131px", { lineHeight: "131px", letterSpacing: "-2.62px" }],
        hero: ["187px", { lineHeight: "150px", letterSpacing: "-3.74px" }],
      },
      spacing: {
        11: "11px",
        13: "13px",
        15: "15px",
        16: "16px",
        17: "17px",
        21: "21px",
        22: "22px",
        23: "23px",
        31: "31px",
        34: "34px",
        38: "38px",
        52: "52px",
        53: "53px",
        59: "59px",
        68: "68px",
        119: "119px",
      },
      borderRadius: {
        none: "0px",
        pill: "1000px",
        decorative: "45px",
      },
      maxWidth: {
        page: "1200px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
