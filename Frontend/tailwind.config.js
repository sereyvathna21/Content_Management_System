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
    extend: {
      colors: {
        primary: "#4CAF4F",
        secondary: "var(--secondary-color)",
      },
      fontSize: {
        // Fluid typography using clamp()
        "fluid-xs": "clamp(0.75rem, 1.5vw + 0.5rem, 0.875rem)", // 12px -> 14px
        "fluid-sm": "clamp(0.875rem, 2vw + 0.5rem, 1rem)", // 14px -> 16px
        "fluid-base": "clamp(0.875rem, 2vw + 0.5rem, 1.125rem)", // 14px -> 18px
        "fluid-lg": "clamp(1rem, 2.5vw + 0.5rem, 1.25rem)", // 16px -> 20px
        "fluid-xl": "clamp(1.125rem, 3vw + 0.75rem, 1.5rem)", // 18px -> 24px
        "fluid-2xl": "clamp(1.25rem, 3.5vw + 0.75rem, 2rem)", // 20px -> 32px
        "fluid-3xl": "clamp(1.5rem, 4vw + 1rem, 2.5rem)", // 24px -> 40px
        "fluid-4xl": "clamp(1.875rem, 5vw + 1rem, 3rem)", // 30px -> 48px
        "fluid-5xl": "clamp(2rem, 6vw + 1rem, 3.75rem)", // 32px -> 60px
        "fluid-6xl": "clamp(2.25rem, 7vw + 1.25rem, 4.5rem)", // 36px -> 72px
      },
    },
  },
  plugins: [],
};
