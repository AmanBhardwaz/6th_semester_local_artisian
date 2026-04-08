// Central API base URL — reads from .env.local (local) or .env (production/Vercel)
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
