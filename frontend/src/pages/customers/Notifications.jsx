import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";
import { 
  MdCheckCircle, 
  MdCancel, 
  MdInfo, 
  MdDelete, 
  MdDrafts, 
  MdMarkEmailRead 
} from "react-icons/md";
import { toast } from "react-toastify";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Determine Type based on message content
  const getNotificationType = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes("cancel") || text.includes("failed") || text.includes("refund")) return "error";
    if (text.includes("success") || text.includes("confirmed")) return "success";
    return "info";
  };

  // 2. Get Icon based on type
  const getIcon = (type) => {
    switch (type) {
      case "error": return <MdCancel className="notif-icon error" />;
      case "success": return <MdCheckCircle className="notif-icon success" />;
      default: return <MdInfo className="notif-icon info" />;
    }
  };

  // Fetch Logic
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark as Read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success("Notification removed");
    } catch (err) {
      console.error(err);
    }
  };

  // Format Date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="notif-loading">Loading updates...</div>;

  return (
    <div className="notif-page">
      <div className="notif-container">
        <div className="notif-header">
          <h1>Your Notifications</h1>
          {/* Unread Badge */}
          <span className="notif-count-badge">
            {notifications.filter(n => !n.isRead).length} Unread
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="notif-empty">
            <MdDrafts size={60} color="#444" />
            <p>No new notifications.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((notif) => {
              const type = getNotificationType(notif.message);
              return (
                <div 
                  key={notif._id} 
                  className={`notif-card ${type} ${notif.isRead ? "read" : "unread"}`}
                >
                  <div className="notif-left">
                    {getIcon(type)}
                  </div>
                  
                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-date">{formatDate(notif.createdAt)}</span>
                  </div>

                  <div className="notif-actions">
                    {!notif.isRead && (
                      <button 
                        className="action-btn read-btn" 
                        onClick={() => markAsRead(notif._id)}
                        title="Mark as Read"
                      >
                        <MdMarkEmailRead size={22} />
                      </button>
                    )}
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => deleteNotification(notif._id)}
                      title="Delete"
                    >
                      <MdDelete size={22} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;