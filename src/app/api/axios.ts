import axios from "axios";

const api = axios.create({
    baseURL: "http://159.203.13.162:8000/api/v1",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers = config.headers ?? {};

        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;