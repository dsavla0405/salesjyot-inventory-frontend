import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Item.css"
import Header from "./Header"
import axios from 'axios';
import * as XLSX from 'xlsx';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Table from 'react-bootstrap/Table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Pagination from 'react-bootstrap/Pagination';
import { saveAs } from 'file-saver';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

function Return() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [validated, setValidated] = useState(false);
  const [date, setDate] = useState();
  const [skucode, setSkucode] = useState();
  const [portal, setPortal] = useState();
  const [orderNo, setOrderno] = useState();
  const [returnCode, setReturnCode] = useState();
  const [trackingNumber, setTrackingNumber] = useState();
  const [okStock, setOkStock] = useState();
  const [sentForRaisingTicketOn, setSentForRaisingTicketOn] = useState();
  const [sentForTicketOn, setSentForTicketOn] = useState();
  const [apiData, setApiData] = useState([]); 
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [skuList, setSkuList] = useState([]);
  const [searchTermDate, setSearchTermDate] = useState("");
  const [searchTermSkuCode, setSeaarchTermSkuCode] = useState("");
  const [searchTermPortal, setSeaarchTermPortal] = useState("");
  const [searchTermOrderNo, setSeaarchTermOrderNo] = useState("");
  const [searchTermReturnCode, setSeaarchTermReturnCode] = useState("");
  const [searchTermTrackingNumber, setSeaarchTermTrackingNumber] = useState("");
  const [searchTermOkStock, setSeaarchTermOkStock] = useState("");
  const [searchTermSentForRaisingTicketOn, setSeaarchTermSentForRaisingTicketOn] = useState("");
  const [searchTermSentForTicketOn, setSeaarchTermSentForTicketOn] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const rowsPerPageOptions = [10, 20, 50];

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

  const filteredData = apiData.filter(supplier => {
    return (
      supplier.date.toString().toLowerCase().includes(searchTermDate.toLowerCase()) && // Convert to string
      supplier.skucode.toString().toLowerCase().includes(searchTermSkuCode.toLowerCase()) &&
      supplier.portal?.toString().toLowerCase().includes(searchTermPortal.toLowerCase()) &&
      supplier.orderNo?.toString().toLowerCase().includes(searchTermOrderNo.toLowerCase()) &&
      supplier.trackingNumber.toString().toLowerCase().includes(searchTermTrackingNumber.toLowerCase()) && // Convert to string
      supplier.returnCode.toString().toLowerCase().includes(searchTermReturnCode.toLowerCase()) &&
      supplier.okStock.toString().toLowerCase().includes(searchTermOkStock.toLowerCase()) &&
      supplier.sentForRaisingTicketOn.toString().toLowerCase().includes(searchTermSentForRaisingTicketOn.toLowerCase()) &&
      supplier.sentForTicketOn.toString().toLowerCase().includes(searchTermSentForTicketOn.toLowerCase())

      );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        jsonData.shift();

        jsonData.forEach(item => {
            const formattedData = {
                date: item.date,
                skucode: item.skucode,
                portal: item.portal,
                orderNo: item.orderNo,
                returnCode: item.returnCode,
                trackingNumber: item.trackingNumber,
                okStock: item.okStock,
                sentForRaisingTicketOn: item.sentForRaisingTicketOn,
                sentForTicketOn: item.sentForTicketOn
            };
          console.log(formattedData)
            postData(formattedData);
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
    axios.get(`${apiUrl}/item/supplier/search/skucode/${skucode}`)
      .then(response => {
        if (response.data) {
          const item = response.data;
          const formData = {
            date,
            skucode,
            portal,
            orderNo,
            returnCode,
            trackingNumber,
            okStock,
            sentForRaisingTicketOn,
            sentForTicketOn,
            item: item
          };
          console.log('form data: ', formData);
          axios.post(`${apiUrl}/return`, formData)
            .then(response => {
              console.log('POST request successful:', response);
              toast.success('Return added successfully', {
                autoClose: 2000 // Close after 2 seconds
              });
              setValidated(false);
              setApiData([...apiData, response.data]);
              setDate("");
              setOrderno("");
              setPortal("");
              setSkucode("");
              setReturnCode("");
              setTrackingNumber("");
              setOkStock("");
              setSentForRaisingTicketOn("");
              setSentForTicketOn("");

            })
            .catch(error => {
              console.error('Error sending POST request:', error);
              toast.error('Failed to add Return: ' + error.response.data.message);
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
            portal,
            orderNo,
            returnCode,
            trackingNumber,
            okStock,
            sentForRaisingTicketOn,
            sentForTicketOn,
    };
    console.log('form data: ', formData)
    console.log("id: ", selectedItem.returnId)
    axios.put(`${apiUrl}/return/${selectedItem.returnId}`, formData)
      .then(response => {
        
        console.log('PUT request successful:', response);
        toast.success('Return updated successfully', {
          autoClose: 2000 // Close after 2 seconds
        });
        setApiData(prevData => prevData.map(item => item.returnId === selectedItem.returnId ? response.data : item)); // Update the specific item

        setValidated(false);
        setRowSelected(false);
        setDate("");
        setOrderno("");
        setPortal("");
        setSkucode("");
        setReturnCode("");
        setTrackingNumber("");
        setOkStock("");
        setSentForRaisingTicketOn("");
        setSentForTicketOn("");
      })
      .catch(error => {
        console.error('Error sending PUT request:', error);
        toast.error('Failed to update Return: ' + error.response.data.message);
      });
  }
};

const handleRowClick = (stock) => {
  setDate(stock.date);
  setOrderno(stock.orderNo);
  setSkucode(stock.skucode);
  setPortal(stock.portal);
  setReturnCode(stock.returnCode);
  setTrackingNumber(stock.trackingNumber);
  setOkStock(stock.okStock);
  setSentForRaisingTicketOn(stock.sentForRaisingTicketOn);
  setSentForTicketOn(stock.sentForTicketOn);
  setRowSelected(true);
  setSelectedItem(stock);
};



useEffect(() => {
  axios.get(`${apiUrl}/return`) 
    .then(response => setApiData(response.data))
    .catch(error => console.error(error));
    console.log(apiData)
    axios.get(`${apiUrl}/item/supplier`) // Fetch SKU codes and descriptions from the items table
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
    axios.post(`${apiUrl}/return`, data)
        .then(response => {
            // Handle successful response
            console.log('Data posted successfully:', response);
        })
        .catch(error => {
            // Handle error
            console.error('Error posting data:', error);
        });
};

const handleDelete = (id) => {
  console.log("Deleting row with id:", id);
  // Remove the row from the table

  axios.delete(`${apiUrl}/return/${id}`)
  .then(response => {
    // Handle success response
    console.log('Row deleted successfully.');
    toast.success('Return deleted successfully', {
      autoClose: 2000 // Close after 2 seconds
    });
    setApiData(prevData => prevData.filter(row => row.returnId !== id));

  })
  .catch(error => {
    // Handle error
    console.error('Error deleting row:', error);
    toast.error('Failed to delete Return: ' + error.response.data.message);
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

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'ReturnsData.xlsx');
};

const downloadTemplate = () => {
  const templateData = [
      {date: '', skucode: '', portal: '', orderNo: '', returnCode: '', trackingNumber: '', okStock: '', sentForRaisingTicketOn: '', sentForTicketOn: ''} 
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

    return (
        <div>
            <ToastContainer position="top-right" />
            <div className='title'>
                    <h1>Returns</h1>
                </div>
                <Accordion defaultExpanded>
        <AccordionSummary className='acc-summary'
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: '#E5E7E9' }} 
        >
          <h4>Returns Form</h4>
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
          <Form.Control
            required
            type="text"
            placeholder="SKUcode"
            name="SKUCode"
            value={skucode}
            onChange={(e) => setSkucode(e.target.value)}  
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Portal</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Portal"
            name="portal"
            value={portal}
            onChange={(e) => setPortal(e.target.value)}  
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
      </Row>
      
                        <Row className="mb-3">
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Against Order No</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Against Order No"
            name="Against Order No"
            value={orderNo}
            onChange={(e) => setOrderno(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>Return Code</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Return Code"
            name="return code"
            value={returnCode}
            onChange={(e) => setReturnCode(e.target.value)}          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Tracking No</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Tracking No"
            name="tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>

      </Row>
      <Row className="mb-3">
        
                    </Row>
                    <Row className="mb-3">
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>OkStock</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="OkStock"
            name="ok stock"
            value={okStock}
            onChange={(e) => setOkStock(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>Sent for raising Ticket On</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Sent for raising Ticket On"
            name="sent for raising ticket on"
            value={sentForRaisingTicketOn}
            onChange={(e) => setSentForRaisingTicketOn(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Sent for Ticket On</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Sent for Ticket On"
            name="Sent for Ticket On"
            value={sentForTicketOn}
            onChange={(e) => setSentForTicketOn(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
      </Row>
      <Row className="mb-3">
        
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
          <h4>List View of Returns</h4>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ overflowX: 'auto' }}> 
        <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>Date
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by Date"
                  value={searchTermDate}
                  onChange={(e) => setSearchTermDate(e.target.value)}
                /></span>
                </th>
                  <th>SKUCode
                  <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by sku"
                  value={searchTermSkuCode}
                  onChange={(e) => setSeaarchTermSkuCode(e.target.value)}
                /></span>
                  </th>
                  <th>Portal
                  <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by Portal"
                  value={searchTermPortal}
                  onChange={(e) => setSeaarchTermPortal(e.target.value)}
                /></span>
                  </th>
                  <th>Against Order Number
                  <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by order no"
                  value={searchTermOrderNo}
                  onChange={(e) => setSeaarchTermOrderNo(e.target.value)}
                /></span>
                  </th>
                  <th>Return Code
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by return code"
                  value={searchTermReturnCode}
                  onChange={(e) => setSeaarchTermReturnCode(e.target.value)}
                /></span>
                </th>
                <th>Tracking Number
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by Date"
                  value={searchTermTrackingNumber}
                  onChange={(e) => setSeaarchTermTrackingNumber(e.target.value)}
                /></span>
                </th>
                <th>Ok Stock
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by Ok Stock"
                  value={searchTermOkStock}
                  onChange={(e) => setSeaarchTermOkStock(e.target.value)}
                /></span>
                </th>
                <th>Sent for Raising Ticket On
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by sent for raising ticket on"
                  value={searchTermSentForRaisingTicketOn}
                  onChange={(e) => setSeaarchTermSentForRaisingTicketOn(e.target.value)}
                /></span>
                </th>
                <th>sent for ticket on
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by Date"
                  value={searchTermSentForTicketOn}
                  onChange={(e) => setSeaarchTermSentForTicketOn(e.target.value)}
                /></span>
                </th>
                
              </tr>
            </thead>
            <tbody>
              {filteredData.map(returns => (
                <tr key={returns.returnId} onClick={() => handleRowClick(returns)}>
                  <td style={{ width: '50px', textAlign: 'center' }}>
                      
                  <button
  style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
  className="delete-icon"
  onClick={(e) => {
    e.stopPropagation(); // Stop propagation of the click event
    handleDelete(returns.returnId); // Call handleDelete function
  }}
>
  <DeleteIcon style={{ color: '#F00' }} />
</button>

                </td>
                <td>
                    {(() => {
                      const date = new Date(returns.date);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()}
                  </td>
                  <td>{returns.skucode}</td>
                  <td>{returns.portal}</td>
                  <td>{returns.orderNo}</td>
                  <td>{returns.returnCode}</td>
                  <td>{returns.trackingNumber}</td>
                  <td>{returns.okStock}</td>
                  <td>{returns.sentForRaisingTicketOn}</td>
                  <td>{returns.sentForTicketOn}</td>
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

export default Return;