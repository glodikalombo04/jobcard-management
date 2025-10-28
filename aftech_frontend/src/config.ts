// src/config.ts
let apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Hard fallback for production
if (!apiBaseUrl || apiBaseUrl === "") {
  apiBaseUrl = "http://127.0.0.1:8000/api";
}

export const API_BASE_URL = apiBaseUrl;