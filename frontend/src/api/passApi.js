import api from "./axiosInstance";

export const issuePass = (appointmentId) => api.post(`/passes/${appointmentId}/issue`);
export const getPass = (id) => api.get(`/passes/${id}`);
export const revokePass = (id) => api.patch(`/passes/${id}/revoke`);

// Returns a blob for the PDF download
export const downloadBadgePDF = (id) =>
  api.get(`/passes/${id}/badge-pdf`, { responseType: "blob" });
