const Appointment = require("../models/Appointment");
const CheckLog = require("../models/CheckLog");
const Pass = require("../models/Pass");
const Visitor = require("../models/Visitor");

const getStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalVisitorsToday,
      currentlyCheckedIn,
      pendingAppointments,
      passesIssued,
    ] = await Promise.all([
      Visitor.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      CheckLog.countDocuments({ checkOutTime: null, checkInTime: { $gte: todayStart } }),
      Appointment.countDocuments({ status: "pending" }),
      Pass.countDocuments({ issuedAt: { $gte: todayStart, $lte: todayEnd } }),
    ]);

    res.json({ totalVisitorsToday, currentlyCheckedIn, pendingAppointments, passesIssued });
  } catch (error) {
    next(error);
  }
};

const exportCSV = async (req, res, next) => {
  try {
    const logs = await CheckLog.find()
      .populate({
        path: "passId",
        populate: {
          path: "appointmentId",
          populate: [
            { path: "visitorId", select: "name email company" },
            { path: "hostId", select: "name" },
          ],
        },
      })
      .populate("scannedBy", "name")
      .sort({ checkInTime: -1 });

    const header = "Visitor Name,Visitor Email,Company,Host,Check In,Check Out,Scanned By\n";
    const rows = logs.map((log) => {
      const appt = log.passId?.appointmentId;
      const visitor = appt?.visitorId;
      const host = appt?.hostId;
      return [
        visitor?.name || "",
        visitor?.email || "",
        visitor?.company || "",
        host?.name || "",
        log.checkInTime ? new Date(log.checkInTime).toISOString() : "",
        log.checkOutTime ? new Date(log.checkOutTime).toISOString() : "",
        log.scannedBy?.name || "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=checklogs.csv");
    res.send(header + rows.join("\n"));
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, exportCSV };
