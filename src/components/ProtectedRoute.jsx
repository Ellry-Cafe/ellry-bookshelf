import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('ellryUser'));

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If no specific roles are required, or user is admin, allow access
  if (!allowedRoles || user.role === 'admin') {
    return children;
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles.includes(user.role)) {
    return children;
  }

  // If user's role is not allowed, redirect to home
  return <Navigate to="/home" replace />;
} 