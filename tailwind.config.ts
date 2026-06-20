import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        unze: {
          green: {
            DEFAULT: "#1DB872",
            light: "#2DD484",
            dark: "#159660",
            muted: "#E8F8F0",
          },
          surface: {
            DEFAULT: "#FFFFFF",
            muted: "#F5F5F7",
            elevated: "#FFFFFF",
          },
          ink: {
            DEFAULT: "#1C1C1E",
            secondary: "#6B6B70",
            muted: "#AEAEB2",
          },
          border: "#E5E5EA",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(28, 28, 30, 0.08)",
        "card-hover": "0 8px 32px -6px rgba(28, 28, 30, 0.12)",
        nav: "0 -4px 24px -4px rgba(28, 28, 30, 0.06)",
        fab: "0 8px 24px -4px rgba(29, 184, 114, 0.45)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      spacing: {
        "nav-height": "4.5rem",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-left": "slideLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
