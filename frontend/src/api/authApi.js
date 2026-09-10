import api from "./axiosInstance";

export const createStaff = (data) => api.post("/auth/create-staff", data);
export const login = ({ email, password, role }) => api.post("/auth/login", { email, password, role });
export const getMe = () => api.get("/auth/me");
export const getHosts = () => api.get("/auth/hosts");
export const getStaff = () => api.get("/auth/staff");
