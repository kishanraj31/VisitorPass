const checkLogService = require("../services/checkLogService");
const passService = require("../services/passService");

const checkIn = async (req, res, next) => {
  try {
    const { qrCodeData, passId } = req.body;
    if (!qrCodeData && !passId) {
      return res.status(400).json({ message: "qrCodeData or passId is required." });
    }

    let pass;
    if (qrCodeData) pass = await passService.getPassByQRCode(qrCodeData);
    else if (passId) pass = await passService.getPassById(passId);

    if (!pass) return res.status(404).json({ message: "Invalid pass." });
    if (pass.status !== "active") {
      return res.status(400).json({ message: `Pass is ${pass.status}. Cannot check in.` });
    }
    if (new Date() > new Date(pass.validUntil)) {
      await passService.updatePassStatus(pass._id, "expired");
      return res.status(400).json({ message: "Pass has expired." });
    }

    const apptDate = new Date(pass.appointmentId.scheduledTime);
    const today = new Date();
    // Validate the appointment date is today (same year, month, date)
    if (
      apptDate.getFullYear() !== today.getFullYear() ||
      apptDate.getMonth() !== today.getMonth() ||
      apptDate.getDate() !== today.getDate()
    ) {
      return res.status(400).json({ message: "Pass is not valid for today's date." });
    }

    const log = await checkLogService.createCheckIn({
      passId: pass._id,
      scannedBy: req.user.id,
    });

    await passService.updatePassStatus(pass._id, "used");

    res.status(201).json({ message: "Check-in successful.", log });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const { passId, qrCodeData } = req.body;
    if (!passId && !qrCodeData) {
      return res.status(400).json({ message: "passId or qrCodeData is required." });
    }

    let pass;
    if (qrCodeData) pass = await passService.getPassByQRCode(qrCodeData);
    else if (passId) pass = await passService.getPassById(passId);

    if (!pass) return res.status(404).json({ message: "Invalid pass." });

    const existingLog = await checkLogService.getLogByPassId(pass._id);
    if (!existingLog) {
      return res.status(404).json({ message: "No active check-in found for this pass." });
    }

    const log = await checkLogService.recordCheckOut(existingLog._id);
    res.json({ message: "Check-out successful.", log });
  } catch (error) {
    next(error);
  }
};

const getLogs = async (req, res, next) => {
  try {
    const { startDate, endDate, passId } = req.query;
    const filter = checkLogService.buildLogFilter({ startDate, endDate, passId });
    const logs = await checkLogService.getAllLogs(filter);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = { checkIn, checkOut, getLogs };
