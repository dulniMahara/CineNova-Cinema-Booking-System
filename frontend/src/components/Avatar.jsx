import React from 'react';
import './Avatar.css';

const getInitials = (name = "") => {
  if (!name || typeof name !== 'string') return "CN";
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "CN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const Avatar = ({ name, size = 'medium', className = '' }) => {
  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {getInitials(name)}
      <span className="online-status-dot" title="Online" />
    </div>
  );
};

export default Avatar;