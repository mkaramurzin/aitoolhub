export const theme = {
  colors: {
    background: "#121721", // converted from hsl(220.00 29.41% 10%)
    foreground: "#E2E8F0", // converted from hsl(214.29 31.82% 91.37%)
    card: {
      DEFAULT: "#1E293B", // converted from hsl(217.24 32.58% 17.45%)
      foreground: "#E2E8F0", // converted from hsl(214.29 31.82% 91.37%)
    },
    popover: {
      DEFAULT: "#1E293B", // converted from hsl(217.24 32.58% 17.45%)
      foreground: "#E2E8F0", // converted from hsl(214.29 31.82% 91.37%)
    },
    primary: {
      DEFAULT: "#818CF8", // converted from hsl(234.45 89.47% 73.92%)
      foreground: "#0F172A", // converted from hsl(222.22 47.37% 11.18%)
    },
    secondary: {
      DEFAULT: "#33435B", // converted from hsl(216 28.17% 27.84%)
      foreground: "#D1D5DB", // converted from hsl(216.00 12.20% 83.92%)
    },
    muted: {
      DEFAULT: "#1E293B", // converted from hsl(217.24 32.58% 17.45%)
      foreground: "#9CA3AF", // converted from hsl(217.89 10.61% 64.90%)
    },
    accent: {
      DEFAULT: "#363E49", // converted from hsl(214.74 14.96% 24.90%)
      foreground: "#D1D5DB", // converted from hsl(216.00 12.20% 83.92%)
    },
    destructive: {
      DEFAULT: "#EF4444", // converted from hsl(0 84.24% 60.20%)
      foreground: "#0F172A", // converted from hsl(222.22 47.37% 11.18%)
    },
    border: "#2C323A", // converted from hsl(214.29 13.73% 20%)
    input: "#4B5563", // converted from hsl(215 13.79% 34.12%)
    ring: "#818CF8", // converted from hsl(234.45 89.47% 73.92%)
    chart: [
      "#818CF8", // converted from hsl(234.45 89.47% 73.92%)
      "#6366F1", // converted from hsl(238.73 83.53% 66.67%)
      "#E546DC", // converted from hsl(243.40 75.36% 58.63%)
      "#CA38BF", // converted from hsl(244.52 57.94% 50.59%)
      "#A3309C", // converted from hsl(243.65 54.50% 41.37%)
    ],
    sidebar: {
      DEFAULT: "#1E293B", // converted from hsl(217.24 32.58% 17.45%)
      foreground: "#E2E8F0", // converted from hsl(214.29 31.82% 91.37%)
      primary: "#818CF8", // converted from hsl(234.45 89.47% 73.92%)
      primaryForeground: "#0F172A", // converted from hsl(222.22 47.37% 11.18%)
      accent: "#374151", // converted from hsl(216.92 19.12% 26.67%)
      accentForeground: "#D1D5DB", // converted from hsl(216.00 12.20% 83.92%)
      border: "#4B5563", // converted from hsl(215 13.79% 34.12%)
      ring: "#818CF8", // converted from hsl(234.45 89.47% 73.92%)
    },
  },

  fontFamily: {
    sans: "Inter, sans-serif",
    serif: "Merriweather, serif",
    mono: "JetBrains Mono, monospace",
  },

  radius: {
    xl: "1rem",
    lg: ".75rem",
    md: "calc(.75rem - 2px)",
    sm: "calc(.75rem - 4px)",
  },
} as const;
