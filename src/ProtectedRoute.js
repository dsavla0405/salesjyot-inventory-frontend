import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    axios
      .get("http://localhost:8080/loginSuccess", { withCredentials: true })
      .then((response) => {
        const accessToken = response.data.accessToken;
        console.log("response =", response.data);
        console.log("access token =", accessToken);
        localStorage.setItem("access_token", accessToken);
        setIsAuthenticated(true);
        console.log("is authenticated is true");
      })
      .catch(() => {
        setIsAuthenticated(false);
        console.log("is authenticated is false");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
