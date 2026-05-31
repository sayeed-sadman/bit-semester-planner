module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          light: "#EAEEFC",
          dark: "#1A45A5",
        },
        dark: {
          DEFAULT: "#0C1229",
          secondary: "#333D52",
          muted: "#616B82",
          subtle: "#808B9E",
        },
        surface: {
          page: "#F8FAFD",
          section: "#F3F5FB",
          card: "#FFFFFF",
          border: "#E4E7ED",
          divider: "#EAF0F2",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#E6F8F0",
          dark: "#0B815A",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
          border: "#FEE2E2",
        },
        orange: {
          DEFAULT: "#AA6D0D",
          light: "#FEF3E1",
        },
        footer: {
          bg: "#0F172A",
          text: "#B2BFD1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        button: "10px",
        input: "8px",
        badge: "10px",
        modal: "16px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(12, 18, 41, 0.06)",
        navbar: "0 2px 8px rgba(15, 23, 42, 0.06)",
        modal: "0 12px 40px rgba(12, 18, 41, 0.2)",
      },
    },
  },
  plugins: [],
};
