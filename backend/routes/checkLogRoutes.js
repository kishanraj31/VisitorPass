const express = require("express");
const router = express.Router();
const { checkIn, checkOut, getLogs } = require("../controllers/checkLogController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/checkin", verifyToken, requireRole("frontdesk", "admin"), checkIn);
router.post("/checkout", verifyToken, requireRole("frontdesk", "admin"), checkOut);
router.get("/", verifyToken, requireRole("admin", "frontdesk"), getLogs);

module.exports = router;
