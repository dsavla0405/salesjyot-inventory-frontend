import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import "./Item.css"
import Header from "./Header"
import * as XLSX from 'xlsx';
import axios from 'axios';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from 'react-bootstrap/Pagination';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import apiClient from './apiClient';
import { useDispatch, useSelector } from 'react-redux';

function Supplier() {
  const user = useSelector((state) => state.user);  // Access user data from Redux store

  console.log("User from Redux in Supplier:", user); 
  const [validated, setValidated] = useState(false);
  const [phonel, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [supplierName, setName] = useState("");
  const [apiData, setApiData] = useState([]); 
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTermName, setSearchTermName] = useState('');
  const [searchTermAddress, setSearchTermAddress] = useState('');
  const [searchTermPhone, setSearchTermPhone] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const rowsPerPageOptions = [10, 20, 50];
  const apiUrl = process.env.REACT_APP_API_URL;
  // Function to handle change in items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // JSX for the dropdown menu to select rows per page
  const rowsPerPageDropdown = (
    <Form.Group controlId="itemsPerPageSelect">
      <Form.Select style={{marginLeft: "5px", width : "70px"}} value={itemsPerPage} onChange={handleItemsPerPageChange}>
        {rowsPerPageOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );

  useEffect(() => {
    axios.get(`${apiUrl}/supplier/user/email`, {
        params: { email: user.email }, // Pass the email as a query parameter
        withCredentials: true, // Include credentials if needed
      })
      .then((response) => setApiData(response.data))
      .catch((error) => console.error("Error fetching suppliers:", error));
  }, [user]);

  console.log('API URL:', process.env.REACT_APP_API_URL);
  const filteredData = apiData.filter(supplier => {
    return (
      (supplier.supplierName && supplier.supplierName.toLowerCase().includes(searchTermName.toLowerCase())) &&
      (supplier.address && supplier.address.toLowerCase().includes(searchTermAddress.toLowerCase())) &&
      (supplier.phonel && supplier.phonel.toLowerCase().includes(searchTermPhone.toLowerCase()))
    );
  });

  const sortedData = filteredData.sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    }
    return filteredData;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        jsonData.forEach(item => {
            const formattedData = {
                address: item.address,
                phonel: item.phone,
                supplierName: item.supplier_name,
                userEmail: user.email
            };
            console.log(formattedData);
            postData(formattedData);
        });
    };

    reader.readAsBinaryString(file);
};

const downloadTemplate = () => {
  const templateData = [
      { supplier_name: '', address: '',  phone: '' } // Add more fields if needed
  ];
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
  }

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'Template.xlsx');
};


const handleSubmit = (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  console.log("Submitting with email:", user?.email);

  if (!supplierName) {
    toast.error('Supplier Name is required');
    event.stopPropagation();
    setValidated(true);
    return;
  }

  if (form.checkValidity() === false || !phonel) {
    event.stopPropagation();
    setValidated(true); 
    return;
  }

  if (form.checkValidity() === false) {
    event.stopPropagation();
  } else {
    const formData = {
      phonel,
      address,
      supplierName,
      userEmail: user.email, 
    };

    axios
      .post(`${apiUrl}/supplier`, formData ,{ withCredentials: true })
      .then((response) => {
        console.log('POST request successful:', response);
        setValidated(false);
        setApiData([...apiData, response.data]);
        setPhone(""); 
        setAddress(""); 
        setName(""); 

        toast.success('Supplier added successfully', {
          autoClose: 2000 // Close after 2 seconds
        });

      })
      .catch((error) => {
        console.error('Error sending POST request:', error);
        toast.error('Failed to add supplier: ' + error.response.data.message);
      });
  }
};

const handleRowSubmit = () => {
  console.log("handleRowSubmit triggered");
  console.log(selectedItem)
  
  if (!supplierName) {
    toast.error('Supplier Name is required');
    return;
  }
  
  if (rowSelected && selectedItem) {
    const formData = {
      phonel,
      address,
      supplierName
    };
    console.log('form data: ', formData)
    console.log("id: ", selectedItem.supplierId)
    axios.put(`${apiUrl}/supplier/${selectedItem.supplierId}`, formData , { withCredentials: true })
      .then(response => {
        
        console.log('PUT request successful:', response);
        toast.success('Supplier updated successfully', {
          autoClose: 2000 // Close after 2 seconds
        });
        setApiData(prevData => prevData.map(item => item.supplierId === selectedItem.supplierId ? response.data : item)); // Update the specific item

        setValidated(false);
        setRowSelected(false);
        setPhone("");
        setAddress("");
        setName("");
      })
      .catch(error => {
        console.error('Error sending PUT request:', error);
        toast.error('Failed to update supplier: ' + error.response.data.message);
      });
  }
};

const handleRowClick = (supplier) => {
  setAddress(supplier.address);
  setPhone(supplier.phonel);
  setName(supplier.supplierName);
  setRowSelected(true);
  setSelectedItem(supplier);
};

const postData = (data) => {
  axios.post(`${apiUrl}/supplier `, data , { withCredentials: true })
      .then(response => {
          console.log('Data posted successfully:', response);
          setApiData(prevData => [...prevData, response.data]);
      })
      .catch(error => {
          console.error('Error posting data:', error);
      });
};

const handleDelete = (id) => {
  console.log("Deleting row with id:", id);
  axios.delete(`${apiUrl}/supplier/${id}` , { withCredentials: true })
    .then(response => {
      console.log('Row deleted successfully.');
      toast.success('Supplier deleted successfully', {
        autoClose: 2000 // Close after 2 seconds
      });
      setApiData(prevData => prevData.filter(row => row.supplierId !== id));
    })
    .catch(error => {
      if (error.response && error.response.status === 500) {
        console.error('Error deleting row:', error.response.data.message);
        toast.error('Failed to delete supplier because it is mentioned somewhere: ' + error.message);
      } else {
        console.error('Error deleting row:', error);
      }
    });
};

const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(filteredData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'SupplierData.xlsx');
};

return (
  <div>
    <ToastContainer position="top-right" />
    <div className='title'>
      <h1>Supplier</h1>
    </div>
  
    <Accordion defaultExpanded>
      <AccordionSummary className='acc-summary'
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3-content"
        id="panel3-header"
        sx={{ backgroundColor: '#E5E7E9' }} 
      >
        <h4>Supplier Form</h4>
      </AccordionSummary>
      <AccordionDetails>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">

            <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Label>Name <span style={{ color: 'red' }}>*</span></Form.Label>
            <Form.Control
                required
                type="text"
                placeholder="Supplier Name"
                name="supplierName"
                value={supplierName}
                onChange={(e) => setName(e.target.value)}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="validationCustom02">
              <Form.Label>Address</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="validationCustom03">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Phone"
                name="phonel"
                value={phonel}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Row>
          <div className='buttons'>
            {rowSelected ? (
              <Button id="edit" onClick={handleRowSubmit}>Edit</Button>
            ) : (
              <Button id="submit" type="submit" onClick={handleSubmit}>Submit</Button>
            )}
            <span style={{ margin: '0 10px' }}>or</span>
            <input type="file" onChange={handleFileUpload} />
            <span style={{margin: "auto"}}></span>
            <Button
              variant="contained"
              tabIndex={-1}
              style={{ height: '33px', backgroundColor: 'orange', color: 'white', fontWeight: 'bolder' }}
              onClick={downloadTemplate}
            >
              {<CloudUploadIcon style={{marginBottom: "5px"}}/>} Download Template
            </Button>  
          </div>
        </Form>
      </AccordionDetails>
    </Accordion>
    
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3-content"
        id="panel-header"
        sx={{ backgroundColor: '#E5E7E9' }} 
      >
        <h4>List View of Suppliers</h4>
      </AccordionSummary>
      <AccordionDetails id='accoordion_expand'>
        <div style={{ overflowX: 'auto' }}> 
          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('supplierName')}>
                  </SwapVertIcon>
                  Name
                  
                  <span style={{ margin: '0 10px' }}>
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={searchTermName}
                      onChange={(e) => setSearchTermName(e.target.value)}
                    />
                  </span>
                </th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('address')}>
                  </SwapVertIcon>
                  Address
                  
                  <span style={{ margin: '0 10px' }}>
                    <input
                      type="text"
                      placeholder="Search by address"
                      value={searchTermAddress}
                      onChange={(e) => setSearchTermAddress(e.target.value)}
                    />
                  </span>
                </th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('phonel')}>
                  </SwapVertIcon>
                  Phone No
                  <span style={{ margin: '0 10px' }}>
                    <input
                      type="text"
                      placeholder="Search by phone"
                      value={searchTermPhone}
                      onChange={(e) => setSearchTermPhone(e.target.value)}
                    />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(supplier => (
                <tr key={supplier.supplierId} onClick={() => handleRowClick(supplier)}>
                  <td style={{ width: '50px', textAlign: 'center' }}>
                    <button
                      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
                      className="delete-icon"
                      onClick={(e) => {
                        e.stopPropagation(); // Stop propagation of the click event
                        handleDelete(supplier.supplierId); // Call handleDelete function
                      }}
                    >
                      <DeleteIcon style={{ color: '#F00' }} />
                    </button>
                  </td>
                  <td>{supplier.supplierName}</td>
                  <td>{supplier.address}</td>
                  <td>{supplier.phonel}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <Button
              variant="contained"
              tabIndex={-1}
              style={{ height: '33px', backgroundColor: '#5463FF', color: 'white', fontWeight: 'bolder' }}
              onClick={exportToExcel}
            >
              {<FileDownloadIcon style={{marginBottom: "5px"}}/>} Export to Excel
            </Button>

            
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {rowsPerPageDropdown}
            
            <Pagination>
              {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }).map((_, index) => (
                <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
  </div>
);
}

export default Supplier;
