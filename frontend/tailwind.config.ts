import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./utils/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 211, 238, 0.18), 0 20px 60px rgba(8, 47, 73, 0.45)",
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(circle at top, rgba(34, 211, 238, 0.18), transparent 36%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.16), transparent 24%)",
      },
    },
  },
  plugins: [],
};

export default config;
