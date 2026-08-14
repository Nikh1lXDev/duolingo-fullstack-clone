export const APP_NAME = "Duolingo Clone";
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_URL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
