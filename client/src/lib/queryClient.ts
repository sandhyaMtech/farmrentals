import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get the base URL from environment variables or default to empty string
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || '';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      // Try to parse response as JSON first
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } else {
        // Fallback to text if not JSON
        errorMessage = await res.text() || res.statusText;
      }
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    
    console.error(`API Error: ${res.status} ${res.statusText}`, { 
      url: res.url, 
      errorMessage 
    });
    
    throw new Error(errorMessage || `Request failed with status ${res.status}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Prepend the base URL to the request URL if it doesn't start with http
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  console.log(`API request: ${method} ${fullUrl}`, { data });
  
  try {
    const headers: Record<string, string> = {};
    if (data) {
      headers["Content-Type"] = "application/json";
    }
    
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`API response from ${method} ${fullUrl}:`, { 
      status: res.status, 
      statusText: res.statusText
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request error for ${method} ${fullUrl}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Prepend the base URL to the request URL if it's a string and doesn't start with http
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    console.log(`Fetching data from: ${fullUrl}`, { unauthorizedBehavior });
    
    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        },
      });

      console.log(`Response from ${fullUrl}:`, { 
        status: res.status, 
        statusText: res.statusText
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log('Unauthorized request (401). Returning null as specified by options.');
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`Data from ${fullUrl}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching from ${fullUrl}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
