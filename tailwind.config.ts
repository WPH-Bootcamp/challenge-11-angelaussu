import type { Config } from "tailwindcss";

const PX_MAX = 600;

// spacing 1:1 px + dukung .5 (mt-6.5)
const spacing: Record<string, string> = {
  "0": "0px",
  "0.5": "0.5px",
};
for (let i = 1; i <= PX_MAX; i++) {
  spacing[String(i)] = `${i}px`;
  spacing[`${i}.5`] = `${i}.5px`;
}

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    spacing,

    extend: {
      // max-w-500 kamu pakai
      maxWidth: {
        "500": "500px",
        "125": "125px",
      },

      // rounded-6 & rounded-14 kamu pakai
      borderRadius: {
        "6": "6px",
        "14": "14px",
        "16": "16px",
      },

      // gradient album
      backgroundImage: {
        "album-gradient":
          "linear-gradient(135deg, var(--color-purple-500), #ff2d96)",
      },

      // warna RGBA yang berulang (biar jadi class)
      colors: {
        // buat teks / track
        "white-55": "rgba(255,255,255,0.55)",
        "white-35": "rgba(255,255,255,0.35)",
        "white-30": "rgba(255,255,255,0.30)",
        "white-22": "rgba(255,255,255,0.22)",
        "white-12": "rgba(255,255,255,0.12)",
        "white-10": "rgba(255,255,255,0.10)",

        // disk center
        "disc-bg": "rgba(0,0,0,0.22)",

        // container base (yang kamu set di variants)
        "player-bg": "rgba(12,12,14,0.90)",
      },

      // border color yang kamu pakai berulang
      borderColor: {
        "white-12": "rgba(255,255,255,0.12)",
      },

      // box shadow yang kamu pakai
      boxShadow: {
        // container
        "player-base": "0px 24px 70px rgba(0,0,0,0.55)",
        "player-playing":
          "0px 24px 70px rgba(0,0,0,0.55), 0px 0px 80px rgba(168, 85, 247, 0.28)",

        // album artwork glow (dari #8B5CF64D)
        album: "0px 0px 40px 0px rgba(139, 92, 246, 0.30)",
      },

      typography: {
        "display-2xl-bold": {
          fontSize: "4.5rem",
          fontWeight: "700",
          lineHeight: "1.1",
        },
      },
    },
  },

  plugins: [],
};

export default config;
