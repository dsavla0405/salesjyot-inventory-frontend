import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import * as XLSX from 'xlsx';  // Library for exporting Excel
import 'bootstrap/dist/css/bootstrap.min.css';
import DeleteIcon from '@mui/icons-material/Delete';
import Pagination from 'react-bootstrap/Pagination';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDispatch, useSelector } from 'react-redux';

function LocationForm() {
  const user = useSelector((state) => state.user);  // Access user data from Redux store

  const [validated, setValidated] = useState(false);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [apiData, setApiData] = useState([]);
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermToLocation, setSearchTermToLocation] = useState('');
  const [searchTermFromLocation, setSearchTermFromLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [skuList, setSkuList] = useState([]);
  const rowsPerPageOptions = [10, 20, 50]; // Customize the number of items per page
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const apiUrl = process.env.REACT_APP_API_URL;
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // To keep track of selected items and quantities
  const [currentPage1, setCurrentPage1] = useState(1);
  const [itemsPerPage1] = useState(10); // Number of items per page
  const [skuSearch, setSkuSearch] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  // Calculate the total number of pages
  const totalPages1 = Math.ceil(items.length / itemsPerPage1);

  // Calculate the current page's items
  const currentItems1 = items.slice(
    (currentPage1 - 1) * itemsPerPage1,
    currentPage1 * itemsPerPage1
  );

  // Handle page change
  const handlePageChange1 = (pageNumber) => {
    setCurrentPage1(pageNumber);
  };

  const filteredItems = currentItems1.filter(item => {
    return (
      item.skucode.toLowerCase().includes(skuSearch.toLowerCase()) &&
      item.description.toLowerCase().includes(descriptionSearch.toLowerCase())
    );
  });

  useEffect(() => {
    axios.get(`${apiUrl}/item/supplier/user/email`, {params: { email: user.email }, withCredentials: true }) // Replace with your items API endpoint
      .then(response => {
        setItems(response.data);
      })
      .catch(error => console.error('Error fetching items:', error));
  }, [user]);

  const handleItemSelect = (item, isSelected) => {
    if (isSelected) {
      setSelectedItems(prevItems => [...prevItems, { ...item, quantity: 0 }]);
    } else {
      setSelectedItems(prevItems => prevItems.filter(selectedItem => selectedItem.itemId !== item.itemId));
    }
  };
  
  const handleQuantityChange = (itemId, quantity) => {
    setSelectedItems(prevItems =>
      prevItems.map(item => (item.itemId === itemId ? { ...item, quantity: parseInt(quantity, 10) || 0 } : item))
    );
  };
  
  
  
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

  const filteredData = apiData.filter(stockTransfer => {
    return (
      (stockTransfer.toLocation.locationName && stockTransfer.toLocation.locationName.toLowerCase().includes(searchTermToLocation.toLowerCase())) &&
      (stockTransfer.fromLocation.locationName && stockTransfer.fromLocation.locationName.toLowerCase().includes(searchTermFromLocation.toLowerCase()))
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
  
  useEffect(() => {
    axios.get(`${apiUrl}/api/stocktransfer/user/email`, {params: { email: user.email }, withCredentials: true })
      .then(response => setApiData(response.data))
      .catch(error => console.error(error));
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
  
    // Basic form validation
    if (form.checkValidity() === false || !toLocation || !fromLocation) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
  
    setValidated(true);
  
    // Post each selected item one by one
    for (const item of selectedItems) {
      if (item.itemId && item.quantity > 0) { // Ensure both item and quantity are valid
        try {
          const formData = {
            item: item, // Post the whole item object here
            qty: item.quantity, // Post the quantity
            fromLocation, // Post the fromLocation object
            toLocation, // Post the toLocation object
            userEmail: user.email,
          };
  
          // Make the API call to post the data
          await axios.post(`${apiUrl}/api/stocktransfer/create`, formData, { withCredentials: true })
            .then(response => {
                setApiData([...apiData, response.data]);
            })
          toast.success(`Item ${item.skucode} with quantity ${item.quantity} posted successfully`);
        } catch (error) {
          toast.error(`Failed to post item ${item.skucode}: ${error.message}`);
        }
      } else {
        toast.error(`Item ${item.skucode} or quantity is invalid`);
      }
    }
    // Reset form after successful submission
    resetForm();
  };
  

  const resetForm = () => {
    setToLocation("");
    setFromLocation("");
    setValidated(false);
    setRowSelected(false);
    setSelectedItem(null);
  };

  const handleRowSubmit = () => {
    console.log("handleRowSubmit triggered");
    console.log(selectedItem)
    if (rowSelected && selectedItem) {
      const formData = {
        toLocation,
        fromLocation
      };
      console.log('form data: ', formData)
      console.log("id: ", selectedItem.locationId)
      axios.put(`${apiUrl}/api/stocktransfer/${selectedItem.stockTransferId}`, formData, { withCredentials: true })
        .then(response => {
          
          console.log('PUT request successful:', response);
          toast.success('Stock Transfer updated successfully', {
            autoClose: 2000 // Close after 2 seconds
          });
          setApiData(prevData => prevData.map(item => item.stockTransferId === selectedItem.stockTransferId ? response.data : item)); // Update the specific item
  
          setValidated(false);
          setRowSelected(false);
          setFromLocation("");
          setToLocation("");
        })
        .catch(error => {
          console.error('Error sending PUT request:', error);
          toast.error('Failed to update Stock Transfer: ' + error.response.data.message);
        });
    }
  };
  
  const handleRowClick = (location) => {
    setToLocation(location.toLocation);
    setFromLocation(location.fromLocation);
    setRowSelected(true);
    setSelectedItem(location);
  };

  const handleDelete = (id) => {
    axios.delete(`${apiUrl}/api/stocktransfer/delete/${id}`, { withCredentials: true })
      .then(() => {
        toast.success('Stock Transfer deleted successfully');
        setApiData(prevData => prevData.filter(location => location.stockTransferId !== id));
      })
      .catch(error => toast.error(`Failed to delete Stock Transfer: ${error.message}`));
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(apiData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
    XLSX.writeFile(workbook, "StockTransfer.xlsx");
  };

  // Download template for importing
  const downloadTemplate = () => {
    const templateData = [{ toLocation: '', fromLocation: '' }];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "StockTransferTemplate.xlsx");
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
                toLocation: item.toLocation,
                fromLocation: item.fromLocation, 
                userEmail: user.email,
            };
            console.log(formattedData);
            postData(formattedData);
        });
    };

    reader.readAsBinaryString(file);
};

const postData = (data) => {
    axios.post(`${apiUrl}/api/stocktransfer/create`, data, { withCredentials: true })
        .then(response => {
            console.log('Data posted successfully:', response);
            setApiData(prevData => [...prevData, response.data]);
        })
        .catch(error => {
            console.error('Error posting data:', error);
        });
  };

  useEffect(() => {
    axios.get(`${apiUrl}/api/locations/user/email`, {params: { email: user.email }, withCredentials: true }) 
    .then(response => {
      console.log("API response for locations: ", response.data);  // Check if data is coming in correctly
      // Ensure locationName field exists and filter non-null values
      const skuData = response.data
        .filter(item => item.locationName)  // Ensure valid locationName
        .map(item => ({ locationId: item.locationId, locationName: item.locationName }));
      
      setSkuList(skuData);  // Set the dropdown data
    })
    .catch(error => console.error('Error fetching locations:', error));
 }, [user]);

 const handleToLocationChange = (e) => {
    const locationName = e.target.value;
    const location = skuList.find(loc => loc.locationName === locationName);
    setToLocation(location); // Store the entire location object
};

const handleFromLocationChange = (e) => {
    const locationName = e.target.value;
    const location = skuList.find(loc => loc.locationName === locationName);
    setFromLocation(location); // Store the entire location object
};

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className='title'>
        <h1>Stock Tranfer</h1>
      </div>

      <Accordion defaultExpanded>
      <AccordionSummary className='acc-summary'
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3-content"
        id="panel3-header"
        sx={{ backgroundColor: '#E5E7E9' }} 
      >
        <h4>Stock Transfer Form</h4>
      </AccordionSummary>
        <AccordionDetails>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
    <Form.Group as={Col} md="4" controlId="validationCustom02">
        <Form.Label>To Location</Form.Label>
        <Form.Select
            required
            onChange={handleToLocationChange}
            value={toLocation?.locationName || ""} // Display locationName in the select
        >
            <option value="">Select to location</option>
            {skuList.map((sku) => (
                <option key={sku.locationId} value={sku.locationName}>
                    {sku.locationName}
                </option>
            ))}
        </Form.Select>
        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
    </Form.Group>

    <Form.Group as={Col} md="4" controlId="validationCustom03">
        <Form.Label>From Location</Form.Label>
        <Form.Select
            required
            onChange={handleFromLocationChange}
            value={fromLocation?.locationName || ""} // Display locationName in the select
        >
            <option value="">Select from location</option>
            {skuList.map((sku) => (
                <option key={sku.locationId} value={sku.locationName}>
                    {sku.locationName}
                </option>
            ))}
        </Form.Select>
        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
    </Form.Group>
</Row>

<Row>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Select</th>
            <th>
                  SKUCode
                  
                  <span style={{ margin: '0 10px' }}>
                    <input
                      type="text"
                      placeholder="Search by skucode"
                      value={skuSearch}
                      onChange={(e) => setSkuSearch(e.target.value)}
                    />
                  </span>
                </th>
            <th>
              Description
              <span style={{ margin: '0 10px' }}>
                    <input
                      type="text"
                      placeholder="Search by description"
                      value={descriptionSearch}
                      onChange={(e) => setDescriptionSearch(e.target.value)}
                    />
                  </span>
            </th>
            <th>
              Quantity
              
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.itemId}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedItems.some(
                    (selectedItem) => selectedItem.itemId === item.itemId
                  )}
                  onChange={(e) => handleItemSelect(item, e.target.checked)}
                />
              </td>
              <td>{item.skucode}</td>
              <td>{item.description}</td>
              <td>
                {selectedItems.some(
                  (selectedItem) => selectedItem.itemId === item.itemId
                ) ? (
                  <Form.Control
                    type="number"
                    value={
                      selectedItems.find(
                        (selectedItem) => selectedItem.itemId === item.itemId
                      )?.quantity || ''
                    }
                    onChange={(e) =>
                      handleQuantityChange(item.itemId, e.target.value)
                    }
                  />
                ) : (
                  ''
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination>
        <Pagination.First onClick={() => handlePageChange1(1)} disabled={currentPage1 === 1} />
        <Pagination.Prev onClick={() => handlePageChange1(currentPage1 - 1)} disabled={currentPage1 === 1} />
        {Array.from({ length: totalPages1 }, (_, idx) => (
          <Pagination.Item
            key={idx + 1}
            active={idx + 1 === currentPage1}
            onClick={() => handlePageChange1(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePageChange1(currentPage1 + 1)} disabled={currentPage1 === totalPages1} />
        <Pagination.Last onClick={() => handlePageChange1(totalPages1)} disabled={currentPage1 === totalPages1} />
      </Pagination>
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
        <h4>List View of Stock Transfer</h4>
      </AccordionSummary>
        <AccordionDetails>
          <Form.Control
            type="text"
            placeholder="Search Locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />

          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('toLocation')}>
                  </SwapVertIcon>
                  To Location
                  
                  <span style={{ margin: '0 10px' }}>
                    <input
                      type="text"
                      placeholder="Search by to Location"
                      value={searchTermToLocation}
                      onChange={(e) => setSearchTermToLocation(e.target.value)}
                    />
                  </span>
                </th>

                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('fromLocation')}>
                  </SwapVertIcon>
                  From Location
                  
                  <span style={{ margin: '0 10px' }}>
                    <input
                      type="text"
                      placeholder="Search by from Location"
                      value={searchTermFromLocation}
                      onChange={(e) => setSearchTermFromLocation(e.target.value)}
                    />
                  </span>
                </th>

                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('fromLocation')}>
                  </SwapVertIcon>
                  Item
                  
                  <span style={{ margin: '0 10px' }}>
                    <input
                      type="text"
                      placeholder="Search by item"
                      value={searchTermFromLocation}
                      onChange={(e) => setSearchTermFromLocation(e.target.value)}
                    />
                  </span>
                </th>

                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('fromLocation')}>
                  </SwapVertIcon>
                  Quantity
                  
                  <span style={{ margin: '0 10px' }}>
                    <input
                      type="text"
                      placeholder="Search by from quantity"
                      value={searchTermFromLocation}
                      onChange={(e) => setSearchTermFromLocation(e.target.value)}
                    />
                  </span>
                </th>


              </tr>
            </thead>
            <tbody>
              {currentItems.map((location) => (
                <tr key={location.stockTransferId} onClick={() => handleRowClick(location)}>
                  <td style={{ width: '50px', textAlign: 'center' }}>
                    <button
                      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
                      className="delete-icon"
                      onClick={(e) => {
                        e.stopPropagation(); // Stop propagation of the click event
                        handleDelete(location.stockTransferId); // Call handleDelete function
                      }}
                    >
                      <DeleteIcon style={{ color: '#F00' }} />
                    </button>
                  </td>
                  <td>{location?.toLocation?.locationName || ''}</td>
                    <td>{location?.fromLocation?.locationName || ''}</td>
                    <td>{`${location?.item?.skucode || ''} - ${location?.item?.description || ''}`.trim()}</td>
                    <td>{location?.qty || ''}</td>

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

export default LocationForm;
