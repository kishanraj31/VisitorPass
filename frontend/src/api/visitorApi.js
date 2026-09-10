import api from "./axiosInstance";

export const preRegisterVisitor = (formData) =>
  api.post("/visitors", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const getVisitors = () => api.get("/visitors");
export const getVisitor = (id) => api.get(`/visitors/${id}`);
export const checkPassStatus = (email) => api.get(`/visitors/status?email=${encodeURIComponent(email)}`);
