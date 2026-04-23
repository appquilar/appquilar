import { ApiClient } from "@/infrastructure/http/ApiClient";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const apiClient = new ApiClient({ baseUrl: API_BASE_URL });
