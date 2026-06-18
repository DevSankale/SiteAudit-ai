import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const runAudit = async (url) => {
  try {
    const response = await axios.post(`${API_URL}/audit`, { url });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(error.response?.data?.error || error.message || "Failed to connect to backend");
  }
};  