import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getAuditHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/audits`);
    return response.data;
  } catch (error) {
    console.error("History API Error:", error);
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch audit history"
    );
  }
};