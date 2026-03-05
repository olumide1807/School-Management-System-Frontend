import axios from "axios";
import { API_URL } from "./apiRoute";
import { jwtDecode } from "jwt-decode";
import { store } from "../redux/store";
import { logout } from "../redux/slice/userSlice";

const SERVER = axios.create({
  baseURL: API_URL,
});

SERVER.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token" || "");
    if (token) {
      const decodedToken = jwtDecode(token) as { exp: number };
      const expirationTime = decodedToken.exp * 1000;
      if (Date.now() >= expirationTime) {
        store.dispatch(logout());
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired"));
      }
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default SERVER;
