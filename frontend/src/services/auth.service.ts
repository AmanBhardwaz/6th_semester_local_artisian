import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth`;

export const registerUser = async (name: string, email: string, password: string, phone: string, role: string) => {
    const res = await axios.post(`${API}/signup`, { name, email, password, phone, role });
    return res.data;
};

export const loginUser = async (email: string, password: string) => {
    const res = await axios.post(`${API}/login`, { email, password });
    return res.data;
};

export const googleLogin = async (token: string, role?: string) => {
    const res = await axios.post(`${API}/google`, { token, role });
    return res.data;
};
