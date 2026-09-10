const appointmentService = require("../services/appointmentService");
const passService = require("../services/passService");
const { sendEmail, sendSms } = require("../utils/sendNotification");

const createAppointment = async (req, res, next) => {
  try {
    const { visitorId, scheduledTime, purpose } = req.body;
    if (!visitorId || !scheduledTime) {
      return res.status(400).json({ message: "visitorId and scheduledTime are required." });
    }
    const hostId = req.user.id;
    const appointment = await appointmentService.createAppointment({
      visitorId, hostId, scheduledTime, purpose, status: "pending",
    });
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

const approveAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found." });
    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be approved." });
    }

    const updated = await appointmentService.updateAppointmentStatus(req.params.id, "approved");

    // Notify visitor via email and SMS
    const visitor = updated.visitorId;
    const scheduledStr = new Date(updated.scheduledTime).toLocaleString("en-IN");
    await sendEmail(
      visitor.email,
      "Your visit has been approved",
      `<p>Hello ${visitor.name},</p>
       <p>Your appointment scheduled for <strong>${scheduledStr}</strong> has been <strong>approved</strong>.</p>
       <p>Please check-in at the front desk upon arrival to collect your visitor pass.</p>`
    );
    sendSms(visitor.phone, `Your visit on ${scheduledStr} is approved. Please collect your pass at the front desk.`);

    res.json({ appointment: updated });
  } catch (error) {
    next(error);
  }
};

const rejectAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found." });
    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be rejected." });
    }

    const updated = await appointmentService.updateAppointmentStatus(req.params.id, "rejected");

    const visitor = updated.visitorId;
    await sendEmail(
      visitor.email,
      "Your visit request has been declined",
      `<p>Hello ${visitor.name},</p><p>Unfortunately, your appointment has been <strong>rejected</strong>. Please contact your host for more information.</p>`
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const { status, hostId, startDate, endDate } = req.query;

    // Hosts can only see their own appointments
    const effectiveHostId = req.user.role === "host" ? req.user.id : hostId;

    const filter = appointmentService.buildFilter({
      status,
      hostId: effectiveHostId,
      startDate,
      endDate,
    });
    const appointments = await appointmentService.getAppointments(filter);
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

module.exports = { createAppointment, approveAppointment, rejectAppointment, getAppointments };
