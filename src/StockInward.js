import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Item.css"
import Header from "./Header"
import { Container } from 'react-bootstrap';
import axios from 'axios';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as XLSX from 'xlsx';
import Table from 'react-bootstrap/Table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Pagination from 'react-bootstrap/Pagination';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

function StockInward() {
  const [validated, setValidated] = useState(false);

  const [date, setDate] = useState("");
  const [skucode, setSkucode] = useState("");
  const [qty, setQty] = useState("");
  const [apiData, setApiData] = useState([]); 
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [skuList, setSkuList] = useState([]);
  const [searchTermSKU, setSearchTermSKU] = useState("");
  const [searchTermDate, setSearchTermDate] = useState("");
  const [searchTermQty, setSearchTermQty] = useState("");
  const [itemImg, setItemImg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const rowsPerPageOptions = [10, 20, 50];
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
    const currentDate = new Date(); // Get current date
    const year = currentDate.getFullYear(); // Get current year
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Get current month and pad with leading zero if needed
    const day = String(currentDate.getDate() + 1).padStart(2, '0'); // Get current day and pad with leading zero if needed
    const formattedDate = `${year}-${month}-${day}`; // Format date as YYYY-MM-DD
    setDate(formattedDate); // Set the default date state
   
  }, []);

  const filteredData = Array.isArray(apiData) ? apiData.filter(supplier => {
    return (
      (supplier.date && supplier.date.toLowerCase().includes(searchTermDate.toLowerCase())) &&
      (supplier.skucode && supplier.skucode.toLowerCase().includes(searchTermSKU.toLowerCase())) &&
      (supplier.qty && supplier.qty.toLowerCase().includes(searchTermQty.toLowerCase()))
    );
  }) : [];

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
    axios.post('http://localhost:8080/stockInward', data)
        .then(response => {
            // Handle successful response
            console.log('Data posted successfully:', response);
        })
        .catch(error => {
            // Handle error
            console.error('Error posting data:', error);
        });
};

const formatDateString = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
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
                date: formatDateString(item.date),
                qty: item.qty,
                skucode: item.skucode
            };

            // Fetch item details using skucode
            axios.get(`http://localhost:8080/item/supplier/search/skucode/${item.skucode}`)
                .then(response => {
                    // Check if item exists
                    if (!response.data || response.data.length === 0) {
                        console.error('Item not found with SKU code: ' + item.skucode);
                        return;
                    }

                    console.log("found item with skucode: " + item.skucode);

                    // Extract item from response data
                    const fetchedItem = response.data;

                    // Construct formData with fetched item
                    const formData = {
                        ...formattedData,
                        item: fetchedItem // Make sure fetchedItem is correctly assigned
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
  if (form.checkValidity() === false) {
    event.stopPropagation();
  } else {
    // Fetch item based on supplier and supplier SKU code
    axios.get(`http://localhost:8080/item/supplier/search/skucode/${skucode}`)
      .then(response => {
        if (response.data) {
          const item = response.data;
          const formData = {
            date,
            skucode,
            qty,
            item: item
          };
          console.log('form data: ', formData);
          axios.post('http://localhost:8080/stockInward', formData)
            .then(response => {
              console.log('POST request successful:', response);
              toast.success('StoockInward added successfully', {
                autoClose: 2000 // Close after 2 seconds
              });
              setValidated(false);
              setApiData([...apiData, response.data]);
              setQty("");
              setDate("");
              setSkucode("");
            })
            .catch(error => {
              console.error('Error sending POST request:', error);
              toast.error('Failed to add StockInward: ' + error.response.data.message);
            });
        } else {
          console.error('No item found for the specified supplier and supplier SKU code.');
        }
      })
      .catch(error => {
        console.error('Error fetching item:', error);
      });
  }

  setValidated(true);
};

const handleRowSubmit = () => {
  console.log("handleRowSubmit triggered");
  console.log(selectedItem)
  if (rowSelected && selectedItem) {
    const formData = {
      date, 
      skucode,
      qty,
      stock : selectedItem.stock
    };
    console.log('form data: ', formData)
    console.log("id: ", selectedItem.stockInwardId)
    axios.put(`http://localhost:8080/stockInward/${selectedItem.stockInwardId}`, formData)
      .then(response => {
        
        console.log('PUT request successful:', response);
        toast.success('StockInward updated successfully', {
          autoClose: 2000 // Close after 2 seconds
        });
        setApiData(prevData => prevData.map(item => item.stockInwardId === selectedItem.stockInwardId ? response.data : item)); // Update the specific item

        setValidated(false);
        setRowSelected(false);
        setDate(""); 
        setSkucode("");
        setQty("")
      })
      .catch(error => {
        console.error('Error sending PUT request:', error);
        toast.error('Failed to update StockInward: ' + error.response.data.message);
      });
  }
};

const downloadTemplate = () => {
  const templateData = [
      {date: '', qty: '', skucode: ''} 
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


const handleRowClick = (stock) => {
  setDate(stock.date);
  setSkucode(stock.skucode);
  setQty(stock.qty);
  setRowSelected(true);
  setSelectedItem(stock);
};



useEffect(() => {
  axios.get('http://localhost:8080/stockInward') 
    .then(response => setApiData(response.data))
    .catch(error => console.error(error));
    console.log(apiData)
    axios.get('http://localhost:8080/item/supplier') // Fetch SKU codes and descriptions from the items table
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


const handleDelete = (id) => {
  console.log("Deleting row with id:", id);
  // Remove the row from the table

  axios.delete(`http://localhost:8080/stockInward/${id}`)
  .then(response => {
    // Handle success response
    console.log('Row deleted successfully.');
    toast.success('StockInward deleted successfully', {
      autoClose: 2000 // Close after 2 seconds
    });
    setApiData(prevData => prevData.filter(row => row.stockInwardId !== id));

  })
  .catch(error => {
    // Handle error
    console.error('Error deleting row:', error);
    toast.error('Failed to delete StockInward: ' + error.response.data.message);
  });


  console.log("After deletion, apiData:", apiData);
};

const getImg = (skucode) => {
  axios.get(`http://localhost:8080/item/supplier/search/skucode/${skucode}`)
    .then(response => {
      setItemImg(response.data.img || '');
    })
    .catch(error => {
      // Handle error
      console.error('Error getting img:', error);
    });

    
}

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

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'StockInwardData.xlsx');
};

    return (
        <div>
            <ToastContainer position="top-right" />
            <div className='title'>
                    <h1>Stock Inward</h1>
            </div>
            <Accordion defaultExpanded>
        <AccordionSummary className='acc-summary'
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: '#E5E7E9' }} 
        >
          <h4>Stock Inward Form</h4>
        </AccordionSummary>
        <AccordionDetails>
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Date</Form.Label>
          <div className="custom-date-picker">
          <DatePicker
            selected={date}
            onChange={date => setDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select Date"
            className="form-control" // Apply Bootstrap form control class
          />
        </div>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
        <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>SKUcode</Form.Label>
         <Form.Select
          required
          onChange={(e) => {
            setSkucode(e.target.value); // Update the state with the selected value
            // Call your additional function here
            getImg(e.target.value);
          }}
          value={skucode}
        >
          <option value="">Select SKU Code</option>
          {skuList.map((sku) => (
            <option key={sku.id} value={sku.skucode}>
              {sku.skucode} - {sku.description}
            </option>
          ))}
        </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Quantity"
            name="Quantity"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        {itemImg && (
        <img alt = "item image" src = {itemImg} className='rotating1' style={{width: "200px", height: "150px", marginTop: "-50px", marginLeft: "45%"}}></img>
        )}
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
          <h4>List View of Stock Inward</h4>
        </AccordionSummary>
        <AccordionDetails>
        <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('date')}>
                  </SwapVertIcon>
                  Date
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by Date"
                  value={searchTermDate}
                  onChange={(e) => setSearchTermDate(e.target.value)}
                /></span>
                </th>
                  <th>
                  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('skucode')}>
                  </SwapVertIcon>
                    SKUCode
                  <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by sku"
                  value={searchTermSKU}
                  onChange={(e) => setSearchTermSKU(e.target.value)}
                /></span>
                  </th>
                  
                  <th>
                  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('qty')}>
                  </SwapVertIcon>
                    Quantity
                  <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by qty"
                  value={searchTermQty}
                  onChange={(e) => setSearchTermQty(e.target.value)}
                /></span>
                  </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(stock => (
                <tr key={stock.stockInwardId} onClick={() => handleRowClick(stock)}>
                  <td style={{ width: '50px', textAlign: 'center' }}>
                      
                  <button
  style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
  className="delete-icon"
  onClick={(e) => {
    e.stopPropagation(); // Stop propagation of the click event
    handleDelete(stock.stockInwardId); // Call handleDelete function
  }}
>
  <DeleteIcon style={{ color: '#F00' }} />
</button>
                    </td>
                    <td>
                      {(() => {
                        const date = new Date(stock.date);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                      })()}
                    </td>
                  <td>{stock.item ? stock.item.skucode : ''}</td>
                  <td>{stock.qty}</td>
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

export default StockInward;