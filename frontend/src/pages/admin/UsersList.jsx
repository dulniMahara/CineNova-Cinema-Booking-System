import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaCalendar, FaUserShield } from 'react-icons/fa';
import './UsersList.css';
import API from '../../services/api';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/auth/users');
      setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading-message">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1><FaUserShield /> Registered Users</h1>
        <div className="users-count">Total Users: {users.length}</div>
      </div>

      <div className="users-grid">
        {users.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-info">
              <h3 className="user-name">{user.name}</h3>
              <div className="user-detail">
                <FaEnvelope className="detail-icon" />
                <span>{user.email}</span>
              </div>
              <div className="user-detail">
                <FaUserShield className="detail-icon" />
                <span className={`user-role ${user.role}`}>{user.role}</span>
              </div>
              <div className="user-detail">
                <FaCalendar className="detail-icon" />
                <span>Joined: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="no-users">No users found</div>
      )}
    </div>
  );
};

export default UsersList;
