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
        surface: {
          board: "var(--surface-board)",
          column: "var(--surface-column)",
          card: "var(--surface-card)",
        },
        primary: {
          DEFAULT: "#5B6CFF",
          hover: "#4A5AE6",
        },
        status: {
          todo: "#9AA4B2",
          progress: "#4C82F7",
          review: "#F5A524",
          blocked: "#E5484D",
          done: "#2FBF71",
        },
      },
      spacing: {
        px: '1px',
        0: '0',
        0.5: '2px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
      },
      borderRadius: {
        'card': '10px',
        'column': '12px',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'medium': 'var(--shadow-medium)',
        'card': 'var(--shadow-card)',
      }
    },
  },
  plugins: [],
};
export default config;
