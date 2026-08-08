import React from "react";
import { Navigate } from "react-router-dom";

const getRoleFromToken = (token) => {
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded?.role || null;
  } catch (e) {
    return null;
  }
};

const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");
  const tokenRole = getRoleFromToken(token);

  const effectiveRole = tokenRole || storedRole;

  // 1. Unauthenticated Access Denial
  if (!token) {
    if (roleRequired === "admin") {
      return <Navigate to="/admin-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // 2. Customer Attempting Admin Route -> Redirect to Customer Home
  if (roleRequired === "admin" && effectiveRole !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;