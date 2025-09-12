// src/utils/api.ts

export const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    let accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");
  
    const authOptions: RequestInit = {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };
  
    let response = await fetch(url, authOptions);
  
    // If token is expired
    if (response.status === 401 && refreshToken) {
      const refreshResponse = await fetch("http://127.0.0.1:9200/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem("access", data.access);
        authOptions.headers = {
          ...authOptions.headers,
          Authorization: `Bearer ${data.access}`,
        };
        // Retry original request
        response = await fetch(url, authOptions);
      } else {
        // If refresh also fails, optionally redirect to login
        localStorage.clear();
        window.location.href = "/";
      }
    }
  
    return response;
  };
  