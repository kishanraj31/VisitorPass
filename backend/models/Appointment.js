const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", required: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    purpose: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
