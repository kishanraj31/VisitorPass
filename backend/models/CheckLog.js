const mongoose = require("mongoose");

const checkLogSchema = new mongoose.Schema(
  {
    passId: { type: mongoose.Schema.Types.ObjectId, ref: "Pass", required: true },
    checkInTime: { type: Date, default: Date.now },
    checkOutTime: { type: Date, default: null },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckLog", checkLogSchema);
