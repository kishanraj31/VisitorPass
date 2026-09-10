const passService = require("../services/passService");
const appointmentService = require("../services/appointmentService");
const pdfService = require("../services/pdfService");
const { sendEmail } = require("../utils/sendNotification");
const Visitor = require("../models/Visitor");
const Pass = require("../models/Pass");
const Appointment = require("../models/Appointment");

const issuePass = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await appointmentService.getAppointmentById(appointmentId);

    if (!appointment) return res.status(404).json({ message: "Appointment not found." });
    if (appointment.status !== "approved") {
      return res.status(400).json({ message: "Appointment must be approved by the host first." });
    }

    const pass = await passService.issuePass(appointmentId);

    // Send email to visitor
    const visitor = appointment.visitorId;
    const scheduledStr = new Date(appointment.scheduledTime).toLocaleString("en-IN");
    await sendEmail(
      visitor.email,
      "Your Visitor Pass",
      `<p>Hello ${visitor.name},</p>
       <p>Your pass for your appointment on <strong>${scheduledStr}</strong> has been issued.</p>
       <p>Please find your digital pass QR code below.</p>
       <img src="${pass.qrCodeImage}" alt="QR Code" />`
    );

    res.status(201).json(pass);
  } catch (error) {
    next(error);
  }
};

const getPass = async (req, res, next) => {
  try {
    const pass = await passService.getPassById(req.params.id);
    if (!pass) return res.status(404).json({ message: "Pass not found." });
    res.json(pass);
  } catch (error) {
    next(error);
  }
};

const downloadBadgePDF = async (req, res, next) => {
  try {
    const pass = await passService.getPassById(req.params.id);
    if (!pass) return res.status(404).json({ message: "Pass not found." });

    const appointment = pass.appointmentId;
    const visitor = appointment.visitorId;
    const host = appointment.hostId;

    pdfService.generateBadgePDF(res, {
      visitorName: visitor.name,
      hostName: host.name,
      validUntil: pass.validUntil,
      qrCodeImage: pass.qrCodeImage,
      company: visitor.company,
    });
  } catch (error) {
    next(error);
  }
};

const revokePass = async (req, res, next) => {
  try {
    const pass = await passService.revokePass(req.params.id);
    if (!pass) return res.status(404).json({ message: "Pass not found." });
    res.json({ message: "Pass revoked.", pass });
  } catch (error) {
    next(error);
  }
};

module.exports = { issuePass, getPass, downloadBadgePDF, revokePass };
