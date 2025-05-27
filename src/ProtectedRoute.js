import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import "./Spinner.css"; // custom CSS file for spinner

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user);

  if (!user.name && !isAuthenticated) {
    if (!user.isLoading) {
      return <Navigate to="/" />;
    }
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
