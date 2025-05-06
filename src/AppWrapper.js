import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/userSlice';
import axios from 'axios';

function AppWrapper({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get('http://localhost:8080/getClientInfo', { withCredentials: true })
      .then((response) => {
        dispatch(setUser(response.data)); // Store user data in Redux
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
      });
  }, [dispatch]);

  return <>{children}</>;
}

export default AppWrapper;
