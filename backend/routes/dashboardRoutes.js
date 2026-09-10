const express = require("express");
const router = express.Router();
const { getStats, exportCSV } = require("../controllers/dashboardController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/stats", verifyToken, requireRole("admin", "frontdesk"), getStats);
router.get("/export", verifyToken, requireRole("admin"), exportCSV);

module.exports = router;
