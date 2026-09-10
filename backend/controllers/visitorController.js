const visitorService = require("../services/visitorService");
const appointmentService = require("../services/appointmentService");
const authService = require("../services/authService");
const { sendEmail } = require("../utils/sendNotification");
const Visitor = require("../models/Visitor");
const Appointment = require("../models/Appointment");
const Pass = require("../models/Pass");

const createVisitor = async (req, res, next) => {
  try {
    const { name, email, phone, company, purpose, hostId, scheduledTime } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "name and email are required." });
    }
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const visitor = await visitorService.createVisitor({
      name, email, phone, company, purpose, hostId, photoUrl,
    });

    if (hostId) {
      const time = scheduledTime || new Date();
      await appointmentService.createAppointment({
        visitorId: visitor._id,
        hostId,
        scheduledTime: time,
        purpose,
        status: "pending",
      });

      const host = await authService.getUserById(hostId);
      if (host) {
        // Send email to visitor
        await sendEmail(
          email,
          "Visit Request Received",
          `<p>Hello ${name},</p><p>Your request has been sent to ${host.name}. You'll be notified once approved.</p>`
        );
        // Send internal notification to host
        await sendEmail(
          host.email,
          "New Visit Request",
          `<p>Hello ${host.name},</p><p>${name} has requested a visit. Please check your dashboard.</p>`
        );
      }
    }

    res.status(201).json(visitor);
  } catch (error) {
    next(error);
  }
};

const getVisitors = async (req, res, next) => {
  try {
    const visitors = await visitorService.getAllVisitors();
    res.json(visitors);
  } catch (error) {
    next(error);
  }
};

const getVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.getVisitorById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found." });
    res.json(visitor);
  } catch (error) {
    next(error);
  }
};

const getVisitorStatus = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "email is required." });
    }

    // Find the visitor by email
    const visitor = await Visitor.findOne({ email }).sort({ createdAt: -1 });
    if (!visitor) {
      return res.status(404).json({ message: "No visitor record found for this email." });
    }

    // Find their most recent appointment
    const appointment = await Appointment.findOne({ visitorId: visitor._id })
      .sort({ createdAt: -1 })
      .populate("hostId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "No appointment found for this visitor." });
    }

    let pass = null;
    if (appointment.status === "approved" || appointment.status === "completed") {
      pass = await Pass.findOne({ appointmentId: appointment._id }).populate({
        path: "appointmentId",
        populate: [
          { path: "visitorId", select: "name email phone company" },
          { path: "hostId", select: "name email" },
        ],
      });
    }

    res.json({
      visitor,
      appointment,
      pass
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createVisitor, getVisitors, getVisitor, getVisitorStatus };
