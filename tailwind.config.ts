import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — do not introduce colors outside this set.
        sage: {
          50: "#f4f6f2",
          100: "#e6ebe1",
          200: "#cdd8c3",
          300: "#adbf9d",
          400: "#8ba377",
          500: "#6f8a5c", // primary
          600: "#587047",
          700: "#465939",
          800: "#3a4830",
          900: "#313c29",
        },
        cream: {
          DEFAULT: "#faf8f3", // very light cream / off-white background
          100: "#fdfcfa",
        },
        charcoal: {
          DEFAULT: "#2b2b28", // primary text
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
