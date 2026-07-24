const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  getUnreadCount,
  createNotification,
  deleteNotification
} = require("../controllers/notificationController");

const { protect } = require("../middlewares/authMiddleware");

/**
 * @route   GET /api/notifications/my
 * @desc    Get logged-in user's notifications
 * @access  Private
 */
router.get("/my", protect, getMyNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get("/unread-count", protect, getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put("/:id/read", protect, markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete("/:id", protect, deleteNotification);

/**
 * @route   POST /api/notifications
 * @desc    Create notification (TESTING / ADMIN / SYSTEM USE)
 * @access  Public (ONLY for testing)
 */
router.post("/", createNotification);

module.exports = router;
