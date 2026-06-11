import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#F7F4EF",
          card: "#FFFFFF",
          tertiary: "#EDE8DF",
          toscaTint: "#E8F5F2",
        },
        tosca: {
          DEFAULT: "#2A9D8F",
          light: "#3DCFBF",
          dark: "#1F7A6F",
          muted: "#2A9D8F33",
        },
        text: {
          primary: "#1A2E2A",
          secondary: "#3D5C55",
          muted: "#6B8F87",
          disabled: "#A8C4BC",
          onTosca: "#FFFFFF",
        },
        semantic: {
          danger: "#E05252",
          warning: "#E5A100",
          success: "#2A9D8F",
          info: "#3B82F6",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        pixelBody: ['"VT323"', "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "pixel-sm": "2px 2px 0 #1F7A6F",
        "pixel-md": "4px 4px 0 #1F7A6F",
        "pixel-lg": "6px 6px 0 #1F7A6F",
        "pixel-glow": "0 0 12px #2A9D8F50",
        card: "4px 4px 0 #2A9D8F33",
      },
      borderRadius: {
        pixel: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
