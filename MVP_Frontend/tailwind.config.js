import { type Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4C3AFE",
          100: "#f3f0ff",
          500: "#4C3AFE",
          600: "#3a2cd3"
        },
        danger: {
          DEFAULT: "#DC2626"
        },
        warning: {
          DEFAULT: "#F59E0B"
        },
        info: {
          DEFAULT: "#1D4ED8"
        },
        success: {
          DEFAULT: "#16A34A"
        },
        background: {
          DEFAULT: "#F5F6FB"
        },
        surface: {
          DEFAULT: "#FFFFFF"
        }
      },
      boxShadow: {
        card: "0 10px 25px -15px rgba(15, 23, 42, 0.25)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
