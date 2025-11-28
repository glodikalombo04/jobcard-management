// src/config.ts
let apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Hard fallback for production
if (!apiBaseUrl || apiBaseUrl === "") {
  apiBaseUrl = "https://backend.aftech.co.za/api";
}

export const API_BASE_URL = apiBaseUrl;
