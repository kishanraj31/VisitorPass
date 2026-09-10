const mongoose = require("mongoose");

const passSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    qrCodeData: { type: String, required: true, unique: true },
    qrCodeImage: { type: String, required: true }, // base64 data URL
    issuedAt: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "used", "expired", "revoked"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pass", passSchema);
