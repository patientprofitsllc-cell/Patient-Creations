import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Earthy colorway: deep forest backgrounds, cream text, leather brown and olive, and the logo's gold for accents.
        obsidian: "#172015",
        charcoal: "#1D2919",
        softblack: "#24311F",
        gold: {
          DEFAULT: "#EFCB8C",
          deep: "#C9A15E",
        },
        ice: "#F4EEE2",
        champagne: "#F6E4B8",
        violet: "#8B7CFF",
        leather: {
          DEFAULT: "#7B4F33",
          deep: "#5A3925",
        },
        olive: "#5F6F3F",
        pc: {
          bg: "#172015",
          panel: "#1F2B1B",
          raised: "#283623",
          line: "#364630",
          sand: "#EFCB8C",
          "sand-deep": "#C9A15E",
          cream: "#F1ECE0",
          mute: "#AEB09F",
          tan: "#D9BF95",
          sage: "#B9C6A2",
          forest: "#2C3822",
          ink: "#1B2216",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        accent: ["var(--font-accent)", "serif"],
      },
      backgroundImage: {
        "studio-radial":
          "radial-gradient(circle at 50% 20%, rgba(239,203,140,0.10), transparent 60%)",
        "glass-panel":
          "linear-gradient(135deg, rgba(123,79,51,0.20), rgba(255,255,255,0.015))",
      },
      boxShadow: {
        "gold-glow": "0 0 40px rgba(239,203,140,0.25)",
        "champagne-glow": "0 0 40px rgba(246,228,184,0.2)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        sweep: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        drift: "drift 8s ease-in-out infinite",
        pulseGlow: "pulseGlow 3.5s ease-in-out infinite",
        sweep: "sweep 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
