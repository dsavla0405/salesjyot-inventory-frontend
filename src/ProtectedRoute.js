import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Login from "./Login.js";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user);
  // console.log("User from Redux in Protectedddddd Route:", user);

  // console.log("in protected route !!isAuthenticated::", !isAuthenticated);
  // console.log("in protected route !!!user.name::", isLoading);

  // Optional: wait for auth check to complete if needed (e.g., show loader if no user name/email and not authenticated)
  if (!user.name && !isAuthenticated) {
    if (!user.isLoading) {
      return <Navigate to="/" />;
    }
    return <div>Loading......</div>; // Avoid flicker or premature redirect
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
