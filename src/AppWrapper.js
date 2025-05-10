import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import axios from "axios";
import { Navigate } from "react-router-dom";

function AppWrapper({ children }) {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/logout", null, {
        withCredentials: true,
      });

      dispatch(clearUser());
      localStorage.removeItem("access_token");
      // Navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };
  useEffect(() => {
    axios
      .get("http://localhost:8080/getClientInfo", { withCredentials: true })
      .then((response) => {
        const { email, name } = response.data;
        // console.log("response:::" + response.data.login);
        // console.log("name:::" + name);

        if (response.data?.email) {
          dispatch(setUser(response.data));
          // console.log("Inside AppWrapper:", response.data);
        } else if (response.data?.login) {
          if (window.confirm("Git Hub Error Click OK to go to Login Page.")) {
            // <Navigate to="/" />;
            window.location.href = "https://github.com/settings/profile";
            handleLogout();
          }

          // <Navigate to="/git-error" />;
        } else {
          dispatch(clearUser());
        }
      })
      .catch((error) => {
        dispatch(clearUser());
        console.error("Error fetching user:", error);
      });
  }, [dispatch]);

  return <>{children}</>;
}

export default AppWrapper;
