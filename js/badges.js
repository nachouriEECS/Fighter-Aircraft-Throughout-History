export const ROLE_COLORS = {
  "Fighter": "#c0392b",
  "Interceptor": "#8e44ad",
  "Multirole": "#2980b9",
  "Air Superiority": "#16a085",
  "Attack": "#d35400",
  "Ground Attack": "#7f8c8d",
  "Bomber": "#34495e",
  "Reconnaissance": "#27ae60",
  "default": "#95a5a6"
};

export const COUNTRY_META = {
  "USA": { flag: "🇺🇸", color: "#3c3b6e" },
  "UK": { flag: "🇬🇧", color: "#012169" },
  "Germany": { flag: "🇩🇪", color: "#000000" },
  "USSR/Russia": { flag: "🇷🇺", color: "#d52b1e" },
  "Japan": { flag: "🇯🇵", color: "#bc002d" },
  "France": { flag: "🇫🇷", color: "#0055a4" }
};

export const roleColor = (role) => ROLE_COLORS[role] || ROLE_COLORS.default;
export const countryMeta = (c) => COUNTRY_META[c] || { flag: "🏳️", color: "#777" };
