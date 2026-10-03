import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: "#100D0B",
        charcoal: "#161210",
        softblack: "#1C1612",
        gold: {
          DEFAULT: "#E0C48A",
          deep: "#C39B52",
        },
        ice: "#F4EFE7",
        champagne: "#F2E6C9",
        violet: "#8B7CFF",
        // The homepage design: olive-charcoal, sand, cream, and the tan and sage concept cards.
        pc: {
          bg: "#141412",
          panel: "#1D1F1A",
          raised: "#25271F",
          line: "#34362E",
          sand: "#DBB77E",
          "sand-deep": "#C9A266",
          cream: "#ECEBE4",
          mute: "#A3A39A",
          tan: "#D6BA8E",
          sage: "#B9C6A2",
          forest: "#1D2826",
          ink: "#1A1A16",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        accent: ["var(--font-accent)", "serif"],
      },
      backgroundImage: {
        "studio-radial":
          "radial-gradient(circle at 50% 20%, rgba(224,196,138,0.10), transparent 60%)",
        "glass-panel":
          "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))",
      },
      boxShadow: {
        "gold-glow": "0 0 40px rgba(224,196,138,0.25)",
        "champagne-glow": "0 0 40px rgba(242,230,201,0.2)",
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
