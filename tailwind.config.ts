import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171412",
        petal: "#e8cfd0",
        fern: "#4e4540",
        linen: "#fffdfb",
        gold: "#8c7a70",
      },
      boxShadow: {
        soft: "0 14px 42px rgba(23, 20, 18, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
