const express = require("express");
const router = express.Router();
const { createStaff, login, getMe, getHosts, getStaff } = require("../controllers/authController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/create-staff", verifyToken, requireRole("admin"), createStaff);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.get("/hosts", getHosts);
router.get("/staff", verifyToken, requireRole("admin"), getStaff);

module.exports = router;
