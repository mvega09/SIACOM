import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // Backend FastAPI
});

// Interceptor para tokens administrativos
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// API específica para familiares
const FamilyAPI = axios.create({
  baseURL: "http://localhost:8000",
});

FamilyAPI.interceptors.request.use((req) => {
  const familyToken = localStorage.getItem("family_token");
  if (familyToken) {
    req.headers.Authorization = `Bearer ${familyToken}`;
  }
  return req;
});

export default API;
export { FamilyAPI };
