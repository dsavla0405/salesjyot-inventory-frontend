import React from 'react';
import { FaBoxOpen, FaTruck, FaClipboardList, FaCogs, FaBarcode, FaExchangeAlt, FaShoppingCart, FaUndo, FaWarehouse, FaTools, FaThList, FaBoxes, FaMapMarkerAlt, FaFileInvoice, FaShippingFast } from 'react-icons/fa';
import { MdOutlineStorage, MdOutlineCategory, MdOutlineLocalShipping } from 'react-icons/md';
import { RiScales3Fill } from 'react-icons/ri';
import { BsFillBox2Fill, BsBoxSeam } from 'react-icons/bs';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    axios.get('http://localhost:8080/logout')
      .then(response => {
        console.log(response.data);
        localStorage.removeItem('authToken');
        sessionStorage.clear(); 
        navigate('/'); 
      })
      .catch(error => {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
      });
  };
  
  return (
    <div className='header'>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <Link to="/home" className='tech'>
            <img
              src="https://media.licdn.com/dms/image/D560BAQF6CchqkqZEEQ/company-logo_200_200/0/1704887637105/techjyot___india_logo?e=2147483647&v=beta&t=S1jLov5GABl39n8XPksGcm8GIQsmvMTLl84RwYZNL-8"
              alt="TechJyot Logo"
            />
            <Navbar.Brand>TechJyot</Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="ms-auto my-2 my-lg-0" navbarScroll>

              {/* Masters Dropdown */}
              <NavDropdown title="Masters" id="navbarScrollingDropdown">
                <NavDropdown.Item href="/item"><FaBoxOpen /> Item</NavDropdown.Item>
                <NavDropdown.Item href="/supplier"><FaTruck /> Supplier</NavDropdown.Item>
                <NavDropdown.Item href="/bom"><FaCogs /> BOM</NavDropdown.Item>
                <NavDropdown.Item href="/bomItem"><FaTools /> BOM Item</NavDropdown.Item>
                <NavDropdown.Item href="/itemportalmapping"><FaThList /> Item Portal Mapping</NavDropdown.Item>
                <NavDropdown.Item href="/stockinward"><FaClipboardList /> Stock Inward</NavDropdown.Item>
                <NavDropdown.Item href="/stock"><BsBoxSeam /> Stock</NavDropdown.Item>
                <NavDropdown.Item href="/location"><FaMapMarkerAlt /> Location</NavDropdown.Item>
              </NavDropdown>

              {/* Transactions Dropdown */}
              <NavDropdown title="Transactions" id="navbarScrollingDropdown">
                <NavDropdown.Item href="/stockCount"><RiScales3Fill /> Stock Count</NavDropdown.Item>
                <NavDropdown.Item href="/barcodelabel"><FaBarcode /> Print Labels</NavDropdown.Item>
                <NavDropdown.Item href="/picklist"><FaClipboardList /> PickList</NavDropdown.Item>
                <NavDropdown.Item href="/packingList"><BsFillBox2Fill /> Packing List</NavDropdown.Item>
                <NavDropdown.Item href="/importorderform"><FaShoppingCart /> Order</NavDropdown.Item>
                <NavDropdown.Item href="/returns"><FaUndo /> Returns</NavDropdown.Item>
                <NavDropdown.Item href="/storage"><MdOutlineStorage /> Storage</NavDropdown.Item>
                <NavDropdown.Item href="/stocktransfer"><FaExchangeAlt /> Stock Transfer</NavDropdown.Item>
                <NavDropdown.Item href="/create-combo"><MdOutlineCategory /> Create Combo</NavDropdown.Item>
              </NavDropdown>

              {/* Scans Dropdown */}
              <NavDropdown title="Scans" id="navbarScrollingDropdown">
                <NavDropdown.Item href="/picklistScan"><FaBoxes /> Scan PickList Orders</NavDropdown.Item>
                <NavDropdown.Item href="/packScan"><FaShippingFast /> Scan Packed Orders</NavDropdown.Item>
                <NavDropdown.Item href="/dispatchScan"><MdOutlineLocalShipping /> Scan Dispatched Orders</NavDropdown.Item>
              </NavDropdown>

              {/* Logout Button */}
              <Nav.Item>
                <Button variant="outline-danger" className="ms-3" onClick={handleLogout}>
                  Logout
                </Button>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;
