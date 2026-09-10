const Appointment = require("../models/Appointment");

const createAppointment = async (data) => {
  return Appointment.create(data);
};

const getAppointments = async (filter = {}) => {
  return Appointment.find(filter)
    .populate("visitorId", "name email phone company")
    .populate("hostId", "name email")
    .sort({ scheduledTime: -1 });
};

const getAppointmentById = async (id) => {
  return Appointment.findById(id)
    .populate("visitorId", "name email phone company photoUrl")
    .populate("hostId", "name email phone");
};

const updateAppointmentStatus = async (id, status) => {
  return Appointment.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("visitorId", "name email phone company")
    .populate("hostId", "name email");
};

const buildFilter = ({ status, hostId, startDate, endDate }) => {
  const filter = {};
  if (status) filter.status = status;
  if (hostId) filter.hostId = hostId;
  if (startDate || endDate) {
    filter.scheduledTime = {};
    if (startDate) filter.scheduledTime.$gte = new Date(startDate);
    if (endDate) filter.scheduledTime.$lte = new Date(endDate);
  }
  return filter;
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  buildFilter,
};
