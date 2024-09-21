import React from 'react'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Header.css"
import { Link } from 'react-router-dom';

function Header() {
  return (
      <div className='header'>
          <Navbar expand="lg" className="bg-body-tertiary">
              <Container fluid>
                  <Link to ="/" className='tech'>
                    <img src = "https://media.licdn.com/dms/image/D560BAQF6CchqkqZEEQ/company-logo_200_200/0/1704887637105/techjyot___india_logo?e=2147483647&v=beta&t=S1jLov5GABl39n8XPksGcm8GIQsmvMTLl84RwYZNL-8"></img>
                      <Navbar.Brand href="/home" >TechJyot</Navbar.Brand>
                      </Link>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
            <Nav
                className="me-auto my-2 my-lg-0"
                style={{ maxHeight: '100px' }}
                navbarScroll
            >
            
                <Nav.Link href="/supplier">Supplier</Nav.Link>
                <Nav.Link href="/item">Item</Nav.Link>
                <Nav.Link href="/bom">BOM</Nav.Link>
                <Nav.Link href="/bomItem">Bom Item</Nav.Link>
                <Nav.Link href="/itemportalmapping">Item Portal Mapping</Nav.Link>
                <Nav.Link href="/importorderform">Order Form</Nav.Link>
                <Nav.Link href="/stockinward">Stock Inward</Nav.Link>
                <Nav.Link href="/storage">Storage</Nav.Link>
                <Nav.Link href="/picklist">PickList</Nav.Link>
                <Nav.Link href="/packinglist">PackingList</Nav.Link>
                

                {/* <Nav.Link href="/packScan">Scan Packed Orders</Nav.Link>
                <Nav.Link href="/dispatchScan">Scan Dispatched Orders</Nav.Link> */}
                <Nav.Link href="/stock">Stock</Nav.Link>
                
                {/* <Nav.Link href="/dispatch">Dispatch</Nav.Link> */}
                <Nav.Link href="/returns">Returns</Nav.Link>

                <NavDropdown title="Scans" id="basic-nav-dropdown">
                <NavDropdown.Item href="/picklistScan">
                    Scan PickList Orders
                    </NavDropdown.Item>
                    <NavDropdown.Item href="/packScan">Scan Packed Orders</NavDropdown.Item>
                    <NavDropdown.Item href="/dispatchScan">
                    Scan Dispatched Orders
                    </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href="/stockCount">Stock Count</Nav.Link>
                <Nav.Link href="/barcodelabel">Print Labels</Nav.Link>
                <Nav.Link href="/location">Location</Nav.Link>

            </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
    </div>
  )
}

export default Header