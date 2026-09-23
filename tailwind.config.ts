import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EDEFE4",
        ink: "#1C1B17",
        rack: "#2F4538",
        rack2: "#3F5A48",
        rust: "#B5533C",
        gold: "#C99A2E",
        cream: "#F7F5EC",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        tag: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
