import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f1715",
        petal: "#ef7f9a",
        fern: "#7a5c4f",
        linen: "#fff7f8",
        gold: "#b98d74",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(31, 23, 21, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
