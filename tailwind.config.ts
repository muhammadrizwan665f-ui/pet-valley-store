import type { Config } from "tailwindcss";

function shade(name: string) {
  return `rgb(var(--${name}) / <alpha-value>)`;
}

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand accent palette — driven by CSS variables (see globals.css)
        // so the whole site can switch themes at runtime from the admin
        // panel without a rebuild.
        sage: {
          50: shade("sage-50"),
          100: shade("sage-100"),
          200: shade("sage-200"),
          300: shade("sage-300"),
          400: shade("sage-400"),
          500: shade("sage-500"),
          600: shade("sage-600"),
          700: shade("sage-700"),
          800: shade("sage-800"),
          900: shade("sage-900"),
        },
        cream: {
          DEFAULT: "#faf8f3",
          100: "#fdfcfa",
        },
        charcoal: {
          DEFAULT: "#2b2b28",
          light: "#54544f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
