import api from "./axiosInstance";

export const createAppointment = (data) => api.post("/appointments", data);
export const getAppointments = (params) => api.get("/appointments", { params });
export const approveAppointment = (id) => api.patch(`/appointments/${id}/approve`);
export const rejectAppointment = (id) => api.patch(`/appointments/${id}/reject`);
