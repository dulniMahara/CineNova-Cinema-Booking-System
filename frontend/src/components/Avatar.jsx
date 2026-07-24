import React from 'react';
import './Avatar.css';

const Avatar = ({ name, size = 'medium' }) => {
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  return (
    <div className={`avatar avatar-${size}`}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;