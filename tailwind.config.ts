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
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
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
        // Start and end frames are identical, so these loop with no visible seam.
        orbitA: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(6%,-8%,0) scale(1.15)" },
        },
        orbitB: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1.1)" },
          "50%": { transform: "translate3d(-8%,6%,0) scale(0.95)" },
        },
      },
      animation: {
        drift: "drift 8s ease-in-out infinite",
        pulseGlow: "pulseGlow 3.5s ease-in-out infinite",
        sweep: "sweep 6s linear infinite",
        orbitA: "orbitA 22s ease-in-out infinite",
        orbitB: "orbitB 28s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
