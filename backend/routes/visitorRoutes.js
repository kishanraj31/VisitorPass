const express = require("express");
const router = express.Router();
const { createVisitor, getVisitors, getVisitor, getVisitorStatus } = require("../controllers/visitorController");
const { verifyToken, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public: visitors can pre-register themselves without logging in
router.post("/", upload.single("photo"), createVisitor);

// Public: visitors can check their status using their email
router.get("/status", getVisitorStatus);

router.get("/", verifyToken, requireRole("admin", "frontdesk", "host"), getVisitors);
router.get("/:id", verifyToken, requireRole("admin", "frontdesk", "host"), getVisitor);

module.exports = router;
