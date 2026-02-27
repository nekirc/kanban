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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        neumorphic: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
        "neumorphic-inset": "inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff",
        "neumorphic-dark": "8px 8px 16px #101010, -8px -8px 16px #202020",
        "neumorphic-inset-dark": "inset 8px 8px 16px #101010, inset -8px -8px 16px #202020",
      },
    },
  },
  plugins: [],
};
export default config;
