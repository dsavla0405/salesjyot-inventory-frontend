// Home.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './redux/userSlice';
import axios from 'axios';
import "./Home.css";

function Home() {
  const user = useSelector((state) => state.user);
  console.log("User from Redux:", user);

  return (
    <div className="home">
      <div className="container">
        <div className="content">
          <h1 className="animated-text">
            Welcome to the inventory genius {user?.name}
          </h1>
          <h3 className="animated-text">
            Stay ahead of demand with precision and control. Manage your
            inventory, master your success.
          </h3>
        </div>
        <div className="background-image">
          <img
            src="https://www.godfrey.com/application/files/2416/5817/5706/godfrey-je-blog-mrkt-p1.gif"
            alt="Inventory Management"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
