import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        petal: "#f43f5e",
        fern: "#0f766e",
        linen: "#f8fafc",
        gold: "#b7791f",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(17, 24, 39, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
