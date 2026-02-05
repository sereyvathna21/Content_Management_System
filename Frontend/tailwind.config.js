/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Mobile-first breakpoints (default Tailwind)
    screens: {
      sm: "640px", // Small devices (landscape phones)
      md: "768px", // Medium devices (tablets)
      lg: "1024px", // Large devices (laptops/desktops)
      xl: "1280px", // Extra large devices (large desktops)
      "2xl": "1536px", // 2X Extra large devices
    },
    extend: {
      colors: {
        primary: "#4CAF4F",
        secondary: "var(--secondary-color)",
      },
      fontSize: {
        // Mobile-first responsive typography
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        base: ["1rem", { lineHeight: "1.5rem" }], // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        "5xl": ["3rem", { lineHeight: "1" }], // 48px
        "6xl": ["3.75rem", { lineHeight: "1" }], // 60px
        "7xl": ["4.5rem", { lineHeight: "1" }], // 72px
        "8xl": ["6rem", { lineHeight: "1" }], // 96px
        "9xl": ["8rem", { lineHeight: "1" }], // 128px

        // Keep fluid typography for special use cases
        "fluid-xs": "clamp(0.75rem, 1.5vw + 0.5rem, 0.875rem)",
        "fluid-sm": "clamp(0.875rem, 2vw + 0.5rem, 1rem)",
        "fluid-base": "clamp(0.875rem, 2vw + 0.5rem, 1.125rem)",
        "fluid-lg": "clamp(1rem, 2.5vw + 0.5rem, 1.25rem)",
        "fluid-xl": "clamp(1.125rem, 3vw + 0.75rem, 1.5rem)",
        "fluid-2xl": "clamp(1.25rem, 3.5vw + 0.75rem, 2rem)",
        "fluid-3xl": "clamp(1.5rem, 4vw + 1rem, 2.5rem)",
        "fluid-4xl": "clamp(1.875rem, 5vw + 1rem, 3rem)",
        "fluid-5xl": "clamp(2rem, 6vw + 1rem, 3.75rem)",
        "fluid-6xl": "clamp(2.25rem, 7vw + 1.25rem, 4.5rem)",
      },
      spacing: {
        // Additional mobile-first spacing
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
    },
  },
  plugins: [],
};
