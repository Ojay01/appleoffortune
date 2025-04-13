import axios from "axios";

const urlParams = new URLSearchParams(window.location.search);
const authToken = urlParams.get("authToken");

const api = axios.create({
  baseURL: "https://betpool.online/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${authToken}`,
  },
});

export default api;
