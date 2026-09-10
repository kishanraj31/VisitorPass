const express = require("express");
const router = express.Router();
const { issuePass, getPass, downloadBadgePDF, revokePass } = require("../controllers/passController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/:appointmentId/issue", verifyToken, requireRole("frontdesk", "admin"), issuePass);
router.get("/:id", verifyToken, getPass);
router.get("/:id/badge-pdf", verifyToken, downloadBadgePDF);
router.patch("/:id/revoke", verifyToken, requireRole("frontdesk", "admin"), revokePass);

module.exports = router;
