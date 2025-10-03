import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{vue,ts,tsx,js,jsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        // 诗画传情 custom colors
        "ink-wash": "hsl(210 8% 25%)",
        "silk-white": "hsl(45 30% 96%)",
        "bamboo-green": "hsl(140 25% 45%)",
        "plum-blossom": "hsl(330 45% 65%)",
        "mountain-mist": "hsl(210 15% 75%)",
        "golden-seal": "hsl(35 80% 60%)",
        // Base colors
        background: "hsl(45 15% 98%)",
        foreground: "hsl(20 8% 15%)",
        card: "hsl(45 20% 97%)",
        "card-foreground": "hsl(20 8% 15%)",
        muted: "hsl(40 10% 90%)",
        "muted-foreground": "hsl(25 8% 45%)",
        accent: "hsl(12 65% 68%)",
        "accent-foreground": "hsl(45 25% 95%)",
        border: "hsl(35 15% 85%)",
        ring: "hsl(12 65% 68%)",
      },
      backgroundImage: {
        "gradient-ink": "linear-gradient(135deg, hsl(210 8% 25%), hsl(25 8% 45%))",
        "gradient-paper": "linear-gradient(180deg, hsl(45 25% 95%), hsl(40 20% 92%))",
        "gradient-mist": "linear-gradient(90deg, hsl(210 15% 75%), hsl(35 15% 85%))",
      },
      boxShadow: {
        "paper": "0 2px 16px -4px hsl(35 15% 75% / 0.3)",
        "floating": "0 16px 64px -12px hsl(12 65% 68% / 0.25)",
      },
      transitionTimingFunction: {
        "ink": "cubic-bezier(0.23, 1, 0.32, 1)",
        "brush": "cubic-bezier(0.165, 0.84, 0.44, 1)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
