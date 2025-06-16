import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const getTransactions = () => api.get("/transactions");
export const addTransaction = (transaction) =>
  api.post("/transactions", transaction);
export const getNotes = () => api.get("/notes");
export const addNote = (note) => api.post("/notes", note);

export default api;
