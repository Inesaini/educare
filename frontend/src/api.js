import axios from "axios";

// URL du backend : VITE_API_URL (voir .env.example), sinon le backend local.
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

axios.defaults.baseURL = API_URL;

const isApiRequest = (url) =>
  typeof url === "string" && (url.startsWith(API_URL) || url.startsWith("/"));

// Ajoute le jeton de connexion aux appels vers le backend qui ne l'envoient pas
// déjà (statistiques, photos, graphiques...), le backend l'exige partout.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && isApiRequest(config.url) && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : input?.url;
  const token = localStorage.getItem("token");
  if (token && url && url.startsWith(API_URL)) {
    const headers = new Headers(init.headers || {});
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return nativeFetch(input, { ...init, headers });
  }
  return nativeFetch(input, init);
};
