const Notification = require('../models/Notification');

/**
 * Get all notifications for the logged-in user
 */
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id
    }).sort({ createdAt: -1 }); // Newest first

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    // Find notification and check ownership
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to the logged-in user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this notification' });
    }
    
    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create notification (DB + real-time)
 */
const createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;

    // 1️⃣ Save to DB
    const notification = await Notification.create({
      userId,
      message
    });

    // 2️⃣ REAL-TIME SOCKET EMIT
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');

    if (io && onlineUsers) {
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit('receive_notification', notification);
      }
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a notification
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to the logged-in user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get unread notification count (Topbar badge)
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  createNotification,
  deleteNotification,
  getUnreadCount
};
