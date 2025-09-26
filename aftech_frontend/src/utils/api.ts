// src/utils/api.ts
import { API_BASE_URL } from "../config";

export const fetchWithAuth = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = localStorage.getItem("access");
  const refreshToken = localStorage.getItem("refresh");

  // Build full URL
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  // Force headers into a mutable string map
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(url, { ...options, headers });

  // Refresh token if needed
  if (response.status === 401 && refreshToken) {
    const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("access", data.access);

      headers["Authorization"] = `Bearer ${data.access}`;
      response = await fetch(url, { ...options, headers });
    } else {
      localStorage.clear();
      window.location.href = "/";
    }
  }

  return response;
};
