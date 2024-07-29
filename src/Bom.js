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
  const [skucode, setSku] = useState("");
  const [bomItem, setBomItem] = useState("");
  const [bomCode, setBomCode] = useState("");
  const [defaultStartDate, setDefaultStartDate] = useState("");
  const [defaultEndDate, setDefaultEndDate] = useState("");
  const [apiData, setApiData] = useState([]); 
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [skuList, setSkuList] = useState([]);
  const [skuSearchTerm, setSkuSearchTerm] = useState("");
  const [bomItemSearchTerm, setBomItemSearchTerm] = useState("");
  const [bomCodeSearchTerm, setBomCodeSearchTerm] = useState("");
  const [defaultStartDateSearchTerm, setDefaultStartDateSearchTerm] = useState("");
  const [defaultEndDateSearchTerm, setDefaultEndDateSearchTerm] = useState("");
  const [isRotating, setIsRotating] = useState(false);
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
  const handleRefresh = () => {
    fetchData();
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
    }, 1000);
  };

  const filteredData = apiData.filter(supplier => {
    const sku = supplier.skucode?.toLowerCase() ?? '';
    const startDate = supplier.defaultStartDate?.toLowerCase() ?? '';
    const endDate = supplier.defaultEndDate?.toLowerCase() ?? '';
    const bom = supplier.bomCode?.toLowerCase() ?? '';
    const skuTerm = skuSearchTerm?.toLowerCase() ?? '';
    const startDateTerm = defaultStartDateSearchTerm?.toLowerCase() ?? '';
    const endDateTerm = defaultEndDateSearchTerm?.toLowerCase() ?? '';
    const bomTerm = bomCodeSearchTerm?.toLowerCase() ?? '';
  
    return (
      sku.includes(skuTerm) &&
      startDate.includes(startDateTerm) &&
      endDate.includes(endDateTerm) &&
      bom.includes(bomTerm)
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
  
  const fetchData = () => {
    axios.get('${apiUrl}/item/supplier') // Fetch SKU codes and descriptions from the items table
      .then(response => {
        // Extract SKU codes and descriptions from the response data and filter out null or undefined values
        const skuData = response.data
          .filter(item => item.skucode && item.description) // Filter out items where skucode or description is null or undefined
          .map(item => ({ skucode: item.skucode, description: item.description }));
        // Set the SKU data list state
        setSkuList(skuData);
      })
      .catch(error => console.error(error));
  }

  useEffect(() => {
    axios.get('${apiUrl}/item/supplier') // Fetch SKU codes and descriptions from the items table
      .then(response => {
        // Extract SKU codes and descriptions from the response data and filter out null or undefined values
        const skuData = response.data
          .filter(item => item.skucode && item.description) // Filter out items where skucode or description is null or undefined
          .map(item => ({ skucode: item.skucode, description: item.description }));
        // Set the SKU data list state
        setSkuList(skuData);
      })
      .catch(error => console.error(error));
  }, []);

  const postData = (data) => {
    axios.post('${apiUrl}/boms', data)
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

        //jsonData.shift();

        jsonData.forEach(item => {
            const formattedData = {
                // bomItem: item.bomItem,
                // qty: item.qty,
                skucode: item.skucode,
                bomCode: item.bomCode,
                defaultStartDate: item.defaultStartDate,
                defaultEndDate: item.defaultEndDate
            };

            // Fetch item details using skucode
            axios.get(`${apiUrl}/item/supplier/search/skucode/${item.skucode}`)
                .then(response => {
                    // Check if item exists
                    if (response.data.length === 0) {
                        console.error('Item not found with SKU code: ' + item.skucode);
                        return;
                    }

                    // Extract item from response data
                    const fetchedItem = response.data;

                    // Construct formData with fetched item
                    const formData = {
                        ...formattedData,
                        bomItems: [fetchedItem] // Wrap the single item in an array
                    };

                    console.log('Form data:', formData);

                    // Send data to server
                    postData(formData);
                })
                .catch(error => {
                    console.error('Error fetching item:', error);
                });
        });
    };

    reader.readAsBinaryString(file);
};
  

const handleSubmit = (event) => {
  event.preventDefault();
  const form = event.currentTarget;

  if (form.checkValidity() === false || !skucode || !bomCode) {
    event.stopPropagation();
    setValidated(true); 
    return;
  } else {
    // Fetch item details using skucode
    axios.get(`${apiUrl}/item/supplier/search/skucode/${skucode}`)
      .then(response => {
        console.log("item = " + JSON.stringify(response.data));
        // Check if item exists
        if (response.data.length === 0) {
          toast.error('Item not found with SKU code: ' + skucode);
          return;
        }

        // Extract item from response data
        const item = response.data;

        // Construct formData with item
        const formData = {
          skucode, 
          defaultStartDate,
          bomCode,
          defaultEndDate,
          bomItems : [item], // Wrap the single item in an array
        };

        // Send POST request with formData
        axios.post('${apiUrl}/boms' , formData)
          .then(response => {
            console.log('POST request successful:', response);
            toast.success('BOM added successfully', {
              autoClose: 2000 // Close after 2 seconds
            });
            console.log('form data: ', formData);
            setValidated(false);
            setApiData([...apiData, response.data]);
            // setBomItem("");
            // setQty("");
            setBomCode("");
            setDefaultStartDate("");
            setDefaultEndDate("");
            setSku("");
          })
          .catch(error => {
            console.error('Error sending POST request:', error);
            toast.error('Failed to add BOM: ' + error.response.data.message);
          });
      })
      .catch(error => {
        console.error('Error fetching item:', error);
        toast.error('Failed to fetch item details: ' + error.response.data.message);
      });
  }

  setValidated(true);
};



const handleRowSubmit = () => {
  console.log("handleRowSubmit triggered");
  console.log(selectedItem);
  if (rowSelected && selectedItem) {
    // Fetch item details using skucode
    axios.get(`${apiUrl}/item/supplier/search/skucode/${skucode}`)
      .then(response => {
        // Check if item exists
        if (response.data.length === 0) {
          toast.error('Item not found with SKU code: ' + skucode);
          return;
        }

        // Extract item from response data
        const item = response.data;

        // Construct formData with item
        const formData = {
          skucode,
          defaultStartDate,
          defaultEndDate,
          bomCode,
          bomItems: [item], // Wrap the single item in an array
        };

        console.log('form data: ', formData);
        console.log("id: ", selectedItem.bomId);

        axios.put(`${apiUrl}/boms/${selectedItem.bomId}`, formData)
          .then(response => {
            console.log('PUT request successful:', response);
            toast.success('Bom updated successfully', {
              autoClose: 2000 // Close after 2 seconds
            });
            setApiData(prevData => prevData.map(item => item.bomId === selectedItem.bomId ? response.data : item)); // Update the specific item

            setValidated(false);
            setRowSelected(false);
            setSku("");
            setBomCode("");
            setDefaultStartDate("");
            setDefaultEndDate("");
          })
          .catch(error => {
            console.error('Error sending PUT request:', error);
            toast.error('Failed to update BOM: ' + error.response.data.message);
          });
      })
      .catch(error => {
        console.error('Error fetching item:', error);
        toast.error('Failed to fetch item details: ' + error.response.data.message);
      });
  }
};

  
  const handleRowClick = (bom) => {
    setBomCode(bom.bomCode);
    setSku(bom.skucode);
    setDefaultStartDate(bom.defaultStartDate);
    setDefaultEndDate(bom.defaultEndDate);
    setRowSelected(true);
    setSelectedItem(bom);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase()); // Convert search term to lowercase
  };
  
  useEffect(() => {
    axios.get('${apiUrl}/boms') 
      .then(response => setApiData(response.data))
      .catch(error => console.error(error));
    
  }, []);

const downloadTemplate = () => {
  const templateData = [
      {defaultStartDate: '', defaultEndDate: '', bomCode: '', skucode: ''} 
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

  axios.delete(`${apiUrl}/boms/${id}`)
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

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'BomData.xlsx');
};
  

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className='title'>
        <h1>BOM</h1>
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
          <Form.Label>Bom Code </Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Bom Code"
            defaultValue=""
            value={ bomCode}
            onChange={(e) => setBomCode(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
              
              
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>SKU Code</Form.Label>

                  <Form.Select
                    required
                    onChange={(e) => setSku(e.target.value)}
                    value={skucode}
                  >
                    <option value="">Select SKU Code</option>
                    {skuList.map((sku) => (
                      <option key={sku.itemId} value={sku.skucode}>
                        {sku.skucode} - {sku.description}
                      </option>
                    ))}
                  </Form.Select>
                  <Link to="/Item" target="_blank"><span style = {{float:"right", fontSize:"small", marginTop:"1%", marginRight:"1%"}}>+ add item</span></Link>
          <IoIosRefresh onClick={handleRefresh} className={isRotating ? 'refresh-icon rotating' : 'refresh-icon'}/>
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>

              </Form.Group>
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Default Start Date</Form.Label>
                
                  <div className="custom-date-picker">
                  <DatePicker
                    selected={defaultStartDate}
                    onChange={date => setDefaultStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select Date"
                    className="form-control" // Apply Bootstrap form control class
                  />
                </div>
                
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Default End Date</Form.Label>
                
                  <div className="custom-date-picker">
                  <DatePicker
                    selected={defaultEndDate}
                    onChange={date => setDefaultEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select Date"
                    className="form-control" // Apply Bootstrap form control class
                  />
                </div>
                
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
          <h4>List View of Bom</h4>
        </AccordionSummary>
        <AccordionDetails>
        <div style={{ overflowX: 'auto' }}> 
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
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('skucode')}>
                  </SwapVertIcon>
                  SKU
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by SKU"
                  value={skuSearchTerm}
                  onChange={(e) => setSkuSearchTerm(e.target.value)}
                /></span>
                </th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('defaultStartDate')}>
                  </SwapVertIcon>
                  Default Start Date 
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by start date"
                  value={defaultStartDateSearchTerm}
                  onChange={(e) => setDefaultStartDateSearchTerm(e.target.value)}
                /></span>
                </th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('defaultEndDate')}>
                  </SwapVertIcon>
                  Default End Date 
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by end date"
                  value={defaultEndDateSearchTerm}
                  onChange={(e) => setDefaultEndDateSearchTerm(e.target.value)}
                /></span>
                </th>
              </tr>
            </thead>
            <tbody>
  {currentItems.map(bom => (
    <tr key={bom.bomId} onClick={() => handleRowClick(bom)}>
      <td style={{ width: '50px', textAlign: 'center' }}>
                      
      <button
  style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
  className="delete-icon"
  onClick={(e) => {
    e.stopPropagation(); // Stop propagation of the click event
    handleDelete(bom.bomId); // Call handleDelete function
  }}
>
  <DeleteIcon style={{ color: '#F00' }} />
</button>

      </td>
      <td>{bom.bomCode ? bom.bomCode : ''}</td>
      <td>
  {bom.bomItems && bom.bomItems.length > 0 && bom.bomItems[0].skucode ? bom.bomItems[0].skucode : ''}
</td>
      <td>
  {(() => {
    if (!bom.defaultStartDate) return '';
    const date = new Date(bom.defaultStartDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  })()}
</td>
<td>
  {(() => {
    if (!bom.defaultEndDate) return '';
    const date = new Date(bom.defaultEndDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  })()}
</td>

    </tr>
  ))}
</tbody>

          </Table>
          </div>
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
