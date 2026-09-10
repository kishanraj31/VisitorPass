const express = require("express");
const router = express.Router();
const {
  createAppointment,
  approveAppointment,
  rejectAppointment,
  getAppointments,
} = require("../controllers/appointmentController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/", verifyToken, requireRole("host", "admin", "frontdesk"), createAppointment);
router.patch("/:id/approve", verifyToken, requireRole("host", "admin"), approveAppointment);
router.patch("/:id/reject", verifyToken, requireRole("host", "admin"), rejectAppointment);
router.get("/", verifyToken, requireRole("admin", "frontdesk", "host"), getAppointments);

module.exports = router;
