const express = require("express");
const router = express.Router();
const { getAdminDashboard, getAdminNotifications } = require("../controllers/adminController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

// GET /api/admin/dashboard - Requires Admin Authentication
router.get("/dashboard", protect, isAdmin, getAdminDashboard);

// GET /api/admin/notifications - Requires Admin Authentication
router.get("/notifications", protect, isAdmin, getAdminNotifications);

module.exports = router;
