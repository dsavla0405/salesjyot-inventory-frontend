import React from 'react'
import Header from './Header'
import "./Home.css"
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImportOrderForm from './ImportOrderForm';
import PackingList from './PackingList';
import PickList from './PickList';
import Stock from './Stock';
import Bom from './Bom';
import Item from './Item';
import ItemPortalMapping from './ItemPortalMapping';
import Returns from './Returns';
import StockInward from './StockInward';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className='home'>
    <div className='container'>
      <div className='content'>
        <h1 className='animated-text'>Welcome to the inventory genius</h1>
        <h3 className='animated-text'>Stay ahead of demand with precision and control. Manage your inventory, master your success.</h3>
      </div> 
      <div className='background-image'>
        <img src="https://www.godfrey.com/application/files/2416/5817/5706/godfrey-je-blog-mrkt-p1.gif" alt="Inventory Management"/>
      </div>
    </div>
  </div>
  
  
  )
}

export default Home