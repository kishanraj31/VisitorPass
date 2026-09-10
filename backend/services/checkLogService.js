const CheckLog = require("../models/CheckLog");

const createCheckIn = async ({ passId, scannedBy }) => {
  return CheckLog.create({ passId, scannedBy, checkInTime: new Date() });
};

const recordCheckOut = async (logId) => {
  return CheckLog.findByIdAndUpdate(
    logId,
    { checkOutTime: new Date() },
    { new: true }
  );
};

const getLogByPassId = async (passId) => {
  return CheckLog.findOne({ passId, checkOutTime: null })
    .populate("passId")
    .populate("scannedBy", "name");
};

const getAllLogs = async (filter = {}) => {
  return CheckLog.find(filter)
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
    .populate("scannedBy", "name email")
    .sort({ checkInTime: -1 });
};

const buildLogFilter = ({ startDate, endDate, passId }) => {
  const filter = {};
  if (passId) filter.passId = passId;
  if (startDate || endDate) {
    filter.checkInTime = {};
    if (startDate) filter.checkInTime.$gte = new Date(startDate);
    if (endDate) filter.checkInTime.$lte = new Date(endDate);
  }
  return filter;
};

module.exports = {
  createCheckIn,
  recordCheckOut,
  getLogByPassId,
  getAllLogs,
  buildLogFilter,
};
