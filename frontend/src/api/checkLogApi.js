import api from "./axiosInstance";

export const checkIn = (payload) => api.post("/checklogs/checkin", payload);
export const checkOut = (payload) => api.post("/checklogs/checkout", payload);
export const getLogs = (params) => api.get("/checklogs", { params });
