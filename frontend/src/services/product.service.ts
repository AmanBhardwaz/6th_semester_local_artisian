import axios from "axios";

const API = "http://localhost:5000/api/products";

export const createProduct = async (
    formData: FormData,
    token: string
) => {
    const res = await axios.post(`${API}/create`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};
