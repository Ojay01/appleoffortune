import axios from "axios";
import { useSearchParams } from "next/navigation";

const api = axios.create({
  baseURL: "https://betpool.online/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export function useAuthenticatedApi() {
  const searchParams = useSearchParams();
  const authToken = searchParams?.get("authToken") || null;

  // Add auth header if token exists
  if (authToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  }

  return api;
}
export default api;
