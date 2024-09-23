import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <div className='header'>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <Link to="/" className='tech'>
            <img src="https://media.licdn.com/dms/image/D560BAQF6CchqkqZEEQ/company-logo_200_200/0/1704887637105/techjyot___india_logo?e=2147483647&v=beta&t=S1jLov5GABl39n8XPksGcm8GIQsmvMTLl84RwYZNL-8" alt="TechJyot Logo" />
            <Navbar.Brand>TechJyot</Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="ms-auto my-2 my-lg-0" navbarScroll>
              
              <NavDropdown title="Masters" id="navbarScrollingDropdown">
                <NavDropdown.Item href="/item">Item</NavDropdown.Item>
                <NavDropdown.Item href="/supplier">Supplier</NavDropdown.Item>
                <NavDropdown.Item href="/bom">Bom</NavDropdown.Item>
                <NavDropdown.Item href="/bomItem">Bom Item</NavDropdown.Item>
                <NavDropdown.Item href="/itemportalmapping">Item Portal Mapping</NavDropdown.Item>
                <NavDropdown.Item href="/stockinward">Stock Inward</NavDropdown.Item>
                <NavDropdown.Item href="/stock">Stock</NavDropdown.Item>
                <NavDropdown.Item href="/location">Location</NavDropdown.Item>
                <NavDropdown.Item href="/create-combo">Create Combo</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Transactions" id="navbarScrollingDropdown">
                <NavDropdown.Item href="/stockCount">Stock Count</NavDropdown.Item>
                <NavDropdown.Item href="/barcodelabel">Print Labels</NavDropdown.Item>
                <NavDropdown.Item href="/picklist">PickList</NavDropdown.Item>
                <NavDropdown.Item href="/packingList">Packing List</NavDropdown.Item>
                <NavDropdown.Item href="/importorderform">Order</NavDropdown.Item>
                <NavDropdown.Item href="/returns">Returns</NavDropdown.Item>
                <NavDropdown.Item href="/storage">Storage</NavDropdown.Item>
                <NavDropdown.Item href="/stocktransfer">Stock Transfer</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Scans" id="navbarScrollingDropdown">
                <NavDropdown.Item href="/picklistScan">Scan PickList Orders</NavDropdown.Item>
                <NavDropdown.Item href="/packScan">Scan Packed Orders</NavDropdown.Item>
                <NavDropdown.Item href="/dispatchScan">Scan Dispatched Orders</NavDropdown.Item>
              </NavDropdown>
              
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;
