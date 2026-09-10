const crypto = require("crypto");
const QRCode = require("qrcode");
const Pass = require("../models/Pass");

const generateQRToken = () => crypto.randomBytes(32).toString("hex");

const generateQRImage = async (data) => {
  // Returns a base64 data URL (data:image/png;base64,...)
  return QRCode.toDataURL(data, { width: 300, margin: 2 });
};

const issuePass = async (appointmentId) => {
  const qrCodeData = generateQRToken();
  const qrCodeImage = await generateQRImage(qrCodeData);

  const issuedAt = new Date();
  const validUntil = new Date(issuedAt.getTime() + 24 * 60 * 60 * 1000); // valid 24 hours

  const pass = await Pass.create({
    appointmentId,
    qrCodeData,
    qrCodeImage,
    issuedAt,
    validUntil,
    status: "active",
  });

  return pass;
};

const getPassById = async (id) => {
  return Pass.findById(id).populate({
    path: "appointmentId",
    populate: [
      { path: "visitorId", select: "name email phone company photoUrl" },
      { path: "hostId", select: "name email" },
    ],
  });
};

const getPassByQRCode = async (qrCodeData) => {
  return Pass.findOne({ qrCodeData }).populate({
    path: "appointmentId",
    populate: [
      { path: "visitorId", select: "name email phone company" },
      { path: "hostId", select: "name email" },
    ],
  });
};

const revokePass = async (id) => {
  return Pass.findByIdAndUpdate(id, { status: "revoked" }, { new: true });
};

const updatePassStatus = async (id, status) => {
  return Pass.findByIdAndUpdate(id, { status }, { new: true });
};

module.exports = {
  issuePass,
  getPassById,
  getPassByQRCode,
  revokePass,
  updatePassStatus,
  generateQRImage,
};
