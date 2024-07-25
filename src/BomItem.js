import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Item.css';
import Header from './Header';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios'; 
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as XLSX from 'xlsx';
import DeleteIcon from '@mui/icons-material/Delete';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';
import { IoIosRefresh } from "react-icons/io";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from 'react-bootstrap/Pagination';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

function Bom() {
  const [validated, setValidated] = useState(false);
  const [bomItem, setBomItem] = useState("");
  const [qty, setQty] = useState("");
  const [bomCode, setBomCode] = useState("");
  const [apiData, setApiData] = useState([]); 
  const [bomsList, setBomsList] = useState([]);
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bomCodesList, setBomCodeList] = useState([]);
  const [bomItemsList, setBomItemsList] = useState([]);
  const [bomCodeSearchTerm, setBomCodeSearchTerm] = useState("");
  const [bomItemSearchTerm, setBomItemSearchTerm] = useState("");
  const [qtySearchTerm, setQtySearchTerm] = useState("");
  const [defaultDateSearchTerm, setDefaultDateSearchTerm] = useState("");
  const [isRotating, setIsRotating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const rowsPerPageOptions = [10, 20, 50];

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
  const handleRefresh = () => {
    fetchData();
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
    }, 1000);
  };

  const fetchData = () => {
    axios.get('http://localhost:8080/boms')
      .then(response => {
        setBomCodeList(response.data); 
      })
      .catch(error => {
        console.error('Error fetching supplier data:', error);
      });

      axios.get('http://localhost:8080/item/supplier')
      .then(response => {
        setBomItemsList(response.data); 
      })
      .catch(error => {
        console.error('Error fetching supplier data:', error);
      });
  }

  const filteredData = apiData.filter(supplier => {
    return (
      (supplier.qty?.toString().toLowerCase().includes(qtySearchTerm.toLowerCase()) || !qtySearchTerm) && 
      (supplier.bomItem?.toLowerCase().includes(bomItemSearchTerm.toLowerCase()) || !bomItemSearchTerm) &&
      (supplier.bom?.bomCode?.toLowerCase().includes(bomCodeSearchTerm.toLowerCase()) || !bomCodeSearchTerm) 
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

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const postData = (data) => {
    axios.post('http://localhost:8080/bomItems', data)
        .then(response => {
            // Handle successful response
            console.log('Data posted successfully:', response);
        })
        .catch(error => {
            // Handle error
            console.error('Error posting data:', error);
        });
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
      const { bomCode, bomItem, qty } = item;
      
      axios.get(`http://localhost:8080/item/supplier/search/skucode/${bomItem}`)
        .then(response => {
          if (response.data.length === 0) {
            toast.error('Item not found with SKU code: ' + bomItem);
            return;
          }

          const fetchedItem = response.data;

          axios.get(`http://localhost:8080/boms/bom/${bomCode}`)
            .then((response) => {
              const bom = response.data;
              const bomId = bom.bomId;

              const formData = {
                bomItem,
                qty,
                bom,
                item: fetchedItem
              };

              return axios.post(`http://localhost:8080/bomItems/create/${bomId}`, formData);
            })
            .then((response) => {
              console.log('POST request successful:', response);
              setApiData(prevApiData => [...prevApiData, response.data]);
              toast.success('BOM Item added successfully', {
                autoClose: 2000 // Close after 2 seconds
              });
            })
            .catch((error) => {
              console.error('Error in request:', error);
              toast.error('Failed to add BOM Item: ' + (error.response?.data?.message || error.message));
            });
        })
        .catch(error => {
          console.error('Error fetching item:', error);
          toast.error('Failed to fetch item: ' + (error.response?.data?.message || error.message));
        });
    });
  };

  reader.readAsBinaryString(file);
};

  

const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
  
    if (form.checkValidity() === false || !bomCode || !bomItem || !qty) {
      event.stopPropagation();
      setValidated(true); 
      return;
    }else{
        axios.get(`http://localhost:8080/item/supplier/search/skucode/${bomItem}`)
      .then(response => {
        console.log("item = " + JSON.stringify(response.data));
        // Check if item exists
        if (response.data.length === 0) {
          toast.error('Item not found with SKU code: ' + bomItem);
          return;
        }

        // Extract item from response data
        const item = response.data;

    axios.get(`http://localhost:8080/boms/bom/${bomCode}`)
      .then((response) => {
        const bom = response.data; // Assuming response.data is the bom object
        const bomId = bom.bomId;
        
        const formData = {
          bomItem,
          qty,
          bom,// Include the bom object directly in formData
            item
        };
  
        return axios.post(`http://localhost:8080/bomItems/create/${bomId}`, formData);
      })
      .then((response) => {
        console.log('POST request successful:', response);
        setValidated(false);
        setApiData([...apiData, response.data]);
        setBomCode(""); 
        setBomItem(""); 
        setQty(""); 
  
        toast.success('BOM Item added successfully', {
          autoClose: 2000 // Close after 2 seconds
        });
      })
      .catch((error) => {
        console.error('Error in request:', error);
        toast.error('Failed to add BOM Item: ' + error.response?.data?.message || error.message);
      });
    })
    }
  };
  

  const handleRowSubmit = () => {
    console.log("handleRowSubmit triggered");
    console.log("Selected Item: ", selectedItem);
  
    if (rowSelected && selectedItem) {
      axios.get(`http://localhost:8080/boms/bom/${bomCode}`)
        .then((response) => {
          const bom = response.data; // Assuming response.data is the bom object
          const bomId = bom.bomId;
  
          const formData = {
            bomItem,
            qty,
            bom // Include the bom object directly in formData
          };
  
          console.log('Form data: ', formData);
          console.log("ID: ", selectedItem.supplierId);
  
          return axios.put(`http://localhost:8080/bomItems/${selectedItem.bomItemId}`, formData);
        })
        .then(response => {
          console.log('PUT request successful:', response);
          toast.success('Supplier updated successfully', {
            autoClose: 2000 // Close after 2 seconds
          });
  
          // Assuming response.data contains the updated bom item
          const updatedBomItem = response.data;
  
          // Update the apiData state with the updated bom item
          const updatedApiData = apiData.map(item => 
            item.bomItemId === updatedBomItem.bomItemId ? updatedBomItem : item
          );
  
          setApiData(updatedApiData);
          setValidated(false);
          setRowSelected(false);
          setBomCode("");
          setBomItem("");
          setQty("");
        })
        .catch(error => {
          console.error('Error sending PUT request:', error);
          toast.error('Failed to update supplier: ' + error.response?.data?.message || error.message);
        });
    }
  };
  

  
  const handleRowClick = (bom) => {
    console.log("cliicked bom = " + JSON.stringify(bom));
    setQty(bom.qty);
    setBomCode(bom.bom.bomCode);
    setBomItem(bom.bomItem);
    setRowSelected(true);
    setSelectedItem(bom);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase()); // Convert search term to lowercase
  };
  
  useEffect(() => {
    axios.get('http://localhost:8080/bomItems') 
      .then(response => setApiData(response.data))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/boms') 
      .then(response => setBomCodeList(response.data))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/item/supplier') 
      .then(response => setBomItemsList(response.data))
      .catch(error => console.error(error));
  }, []);

const downloadTemplate = () => {
  const templateData = [
      {bomItem: '', qty: '', bomCode: ''} 
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

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'bomTemplate.xlsx');
};

const handleDelete = (id) => {
  console.log("Deleting row with id:", id);
  // Remove the row from the table

  axios.delete(`http://localhost:8080/bomItems/${id}`)
  .then(response => {
    // Handle success response
    console.log('Row deleted successfully.');
    toast.success('Bom deleted successfully', {
      autoClose: 2000 // Close after 2 seconds
    });
    setApiData(prevData => prevData.filter(row => row.bomId !== id));

  })
  .catch(error => {
    // Handle error
    console.error('Error deleting row:', error);
    toast.error('Failed to delete BOM: ' + error.response.data.message);
  });


  console.log("After deletion, apiData:", apiData);
};

useEffect(() => {
    axios.get('http://localhost:8080/boms') 
      .then(response => setBomsList(response.data))
      .catch(error => console.error(error));
  }, []);

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
  
    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'BomItemData.xlsx');
  };
  

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className='title'>
        <h1>BOM Items</h1>
      </div>

      
      <Accordion defaultExpanded>
        <AccordionSummary className='acc-summary'
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: '#E5E7E9' }} 
        >
          <h4>BOM Form</h4>
        </AccordionSummary>
        <AccordionDetails>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Bom Code</Form.Label>

                  <Form.Select
                    required
                    onChange={(e) => setBomCode(e.target.value)}
                    value={bomCode}
                  >
                    <option value="">Select Bom Code</option>
                    {bomCodesList.map((sku) => (
                      <option key={sku.bomId} value={sku.bomCode}>
                        {sku.bomCode}
                      </option>
                    ))}
                  </Form.Select>
                  <Link to="/bom" target="_blank"><span style = {{float:"right", fontSize:"small", marginTop:"1%", marginRight:"1%"}}>+ add bom</span></Link>
          <IoIosRefresh onClick={handleRefresh} className={isRotating ? 'refresh-icon rotating' : 'refresh-icon'}/>
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>

              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Bom Item</Form.Label>

                  <Form.Select
                    required
                    onChange={(e) => setBomItem(e.target.value)}
                    value={bomItem}
                  >
                    <option value="">Select Bom Item</option>
                    {bomItemsList.map((sku) => (
                      <option key={sku.itemId} value={sku.skucode}>
                        {sku.skucode} - {sku.description}
                      </option>
                    ))}
                  </Form.Select>
                  <Link to="/item" target="_blank"><span style = {{float:"right", fontSize:"small", marginTop:"1%", marginRight:"1%"}}>+ add item</span></Link>
          <IoIosRefresh onClick={handleRefresh} className={isRotating ? 'refresh-icon rotating' : 'refresh-icon'}/>
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>

              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Quantity </Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Quantity"
            defaultValue=""
            value={ qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
            </Row>
            <div className='buttons'>
      {rowSelected ? (
        <Button onClick={handleRowSubmit}>Edit</Button>
      ) : (
        <Button type="submit" onClick={handleSubmit}>Submit</Button>
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
          id="panel3-header"
          sx={{ backgroundColor: '#E5E7E9' }} 
        >
          <h4>List View of Bom Items</h4>
        </AccordionSummary>
        <AccordionDetails>
          
          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('bomCode')}>
                  </SwapVertIcon>
                  Bom Code
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by bomCode"
                  value={bomCodeSearchTerm}
                  onChange={(e) => setBomCodeSearchTerm(e.target.value)}
                /></span>
                </th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('bomItem')}>
                  </SwapVertIcon>
                  Bom Item 
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by bomItem"
                  value={bomItemSearchTerm}
                  onChange={(e) => setBomItemSearchTerm(e.target.value)}
                /></span>
                </th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('qty')}>
                  </SwapVertIcon>
                  Qty 
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by qty"
                  value={qtySearchTerm}
                  onChange={(e) => setQtySearchTerm(e.target.value)}
                /></span>
                </th>
              </tr>
            </thead>
            <tbody>
  {currentItems.map(bomItems => (
    <tr key={bomItems.bomItemId} onClick={() => handleRowClick(bomItems)}>
      <td style={{ width: '50px', textAlign: 'center' }}>
                      
      <button
  style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
  className="delete-icon"
  onClick={(e) => {
    e.stopPropagation(); // Stop propagation of the click event
    handleDelete(bomItems.bomItemId); // Call handleDelete function
  }}
>
  <DeleteIcon style={{ color: '#F00' }} />
</button>

      </td>
      <td>{bomItems.bom && bomItems.bom.bomCode ? bomItems.bom.bomCode : ''}</td>
        <td>{bomItems.item && bomItems.item.skucode ? bomItems.item.skucode : ''}</td>
        <td>{bomItems.qty ? bomItems.qty : ''}</td>

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
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default Bom;
