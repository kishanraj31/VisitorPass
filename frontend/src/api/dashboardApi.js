import api from "./axiosInstance";

export const getStats = () => api.get("/dashboard/stats");

// Triggers a CSV file download via a link click
export const exportCSV = () =>
  api.get("/dashboard/export", { responseType: "blob" });
