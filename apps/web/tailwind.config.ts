import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        poke: {
          ink: "#0F172A",
          bg: "#E6F1FF",
          card: "#FFFFFF",
          primary: "#1D4ED8",
          secondary: "#3B82F6",
          accent: "#0EA5E9",
          mint: "#38BDF8",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        clay: "0 10px 0 #bfdcff, 0 14px 28px rgba(15,23,42,0.18)",
        claySoft: "inset 0 2px 4px rgba(255,255,255,.72), 0 8px 16px rgba(30,64,175,.14)",
      },
      transitionTimingFunction: {
        poke: "cubic-bezier(0.2, 0.9, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
