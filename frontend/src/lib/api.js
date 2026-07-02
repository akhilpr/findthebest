import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 60000 });

export const fetchTrending = () => api.get("/trending").then((r) => r.data);
export const fetchPlaces = (params = {}) => api.get("/places", { params }).then((r) => r.data);
export const fetchPlace = (id) => api.get(`/places/${id}`).then((r) => r.data);
export const analyzePlace = (payload) => api.post("/analyze", payload).then((r) => r.data);
