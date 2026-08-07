const express = require("express");
const router = express.Router();
const { getAdminDashboard } = require("../controllers/adminController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

// GET /api/admin/dashboard - Requires Admin Authentication
router.get("/dashboard", protect, isAdmin, getAdminDashboard);

module.exports = router;
