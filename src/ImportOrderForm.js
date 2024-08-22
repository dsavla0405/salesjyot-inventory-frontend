import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Item.css"
import { Table } from 'react-bootstrap';
import Header from "./Header"
import * as XLSX from 'xlsx';
import axios from 'axios';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from 'react-bootstrap/Pagination';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { saveAs } from 'file-saver';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

function ImportOrderForm() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [validated, setValidated] = useState(false);
  const [date, setDate] = useState("");
  const [orderNo, setOrderno] = useState("");
  const [portalOrderNo, setPortalOrderno] = useState("");
  const [portalOrderLineId, setPortalOrderLineid] = useState("");
  const [portalSKU, setPortalSKU] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [shipByDate, setShipbyDate] = useState("");
  const [dispatched, setDispatched] = useState("");
  const [courier, setCourier] = useState("");
  const [portal, setPortal] = useState("");
  const [sellerSKU, setSellerSKU] = useState("");
  const [cancel, setCancel] = useState("");
  const [qty, setQuantity] = useState("");
  const [apiData, setApiData] = useState([]); 
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [portalSKUList, setPortalSKUList] = useState([]);
  const [sellerSKUList, setSellerSKUList] = useState([]);
  const [itemDescriptionList, setItemDescriptionList] = useState([]);
  const [portalNameList, setPortalNameList] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [awbNo, setAwbNo] = useState("");

  const [searchTermAwbNo, setSearchTermAwbNo] = useState('')
  const [searchTermOrderStatus, setSearchTermOrderStatus] = useState('');
  const [searchTermDate, setSearchTermDate] = useState('');
  const [searchTermCancel, setSearchTermCancel] = useState('');
  const [searchTermOrderNo, setSearchTermOrderNo] = useState('');
  const [searchTermPortalOrderNo, setSearchTermPortalOrderNo] = useState('');
  const [searchTermPortalLineId, setSearchTermPortalLineId] = useState('');
  const [searchTermQuantity, setSearchTermQuantity] = useState('');
  const [searchTermCourier, setSearchTermCourier] = useState('');
  const [searchTermDispatched, setSearchTermDispatched] = useState('');
  const [searchTermSellerSKU, setSearchTermSellerSKU] = useState('');
  const [searchTermPortalSKU, setSearchTermPortalSKU] = useState('');
  const [searchTermShibByDate, setSearchTermShibByDate] = useState('');
  const [searchTermProductDescription, setSearchTermProductDescription] = useState('');
  const [searchTermPortal, setSearchTermPortal] = useState('');
  const [selectedPortal, setSelectedPortal] = useState(""); // State variable for selected portal
  const [filteredPortalSKUList, setFilteredPortalSKUList] = useState([]); // State variable for filtered portal SKU list
  const [filteredSellerSKUList, setFilteredSellerSKUList] = useState([]); // State variable for filtered seller SKU list
  const [filteredItemDescriptionList, setFilteredItemDescriptionList] = useState([]); // State variable for filtered item description list
  const [portalMapping, setPortalMapping] = useState([]); // State variable to store portal mapping data
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const rowsPerPageOptions = [10, 20, 50];
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Function to handle change in items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // JSX for the dropdown menu to select rows per page
  const rowsPerPageDropdown = (
    <Form.Group controlId="itemsPerPageSelect">
      <Form.Select style={{ marginLeft: "5px", width : "70px"}} value={itemsPerPage} onChange={handleItemsPerPageChange}>
        {rowsPerPageOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
  const formatDateOrderNo = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}${day}${year}`;
  };
  
  const updateOrderNumber = () => {
    const lastSerialNumber = parseInt(localStorage.getItem('lastSerialNumber')) || 0;
    const formattedDate = formatDateOrderNo(new Date());
    const paddedSerialNumber = String(lastSerialNumber + 1).padStart(4, '0');
    const newOrderNumber = `${formattedDate}-${paddedSerialNumber}`;
    setOrderno(newOrderNumber);
  };
  
  useEffect(() => {
    updateOrderNumber(); // Initial update when component mounts
  }, []); // Empty dependency array ensures it only runs once

  useEffect(() => {
    const fetchPortalMapping = async () => {
      try {
        const response = await axios.get(`${apiUrl}/itemportalmapping`); // Replace 'your-api-endpoint' with the actual API endpoint
        setPortalMapping(response.data); // Set portal mapping data
        console.log("iitem portal mapping: "+JSON.stringify(portalMapping));
      } catch (error) {
        console.error('Error fetching portal mapping:', error);
      }
    };

    fetchPortalMapping(); // Call the fetchPortalMapping function
  }, []);


  //useEffect to update filtered lists when selectedPortal changes
  useEffect(() => {
    // Check if portalMapping is empty or not
     if (Object.keys(portalMapping).length === 0) return;

    // Filter portal SKU list based on selected portal
    const filteredPortalSKUs = portalMapping.filter(item => item.portal === selectedPortal).map(item => item.portalSkuCode);
    setFilteredPortalSKUList(filteredPortalSKUs);
  
    // Filter seller SKU list based on selected portal SKU
    const filteredSellerSKUs = portalMapping.filter(item => item.portal === selectedPortal && item.portalSkuCode === portalSKU).map(item => item.skucode);
    setFilteredSellerSKUList(filteredSellerSKUs);
  
    // Filter item description list based on selected portal SKU
    const filteredItemDescriptions = portalMapping.filter(item => item.portal === selectedPortal && item.portalSkuCode === portalSKU).map(item => item.item.description);
    setFilteredItemDescriptionList(filteredItemDescriptions);
  }, [selectedPortal, portalSKU, portalMapping]); // Include portalMapping in the dependencies array

  // Your JSX component rendering goes here


  useEffect(() => {
    const currentDate = new Date(); // Get current date
    const year = currentDate.getFullYear(); // Get current year
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Get current month and pad with leading zero if needed
    const day = String(currentDate.getDate() + 1).padStart(2, '0'); // Get current day and pad with leading zero if needed
    const formattedDate = `${year}-${month}-${day}`; // Format date as YYYY-MM-DD
    setDate(formattedDate); // Set the default date state
  }, []);


  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString().toLowerCase() : '';
  };

  console.log("apiData:", apiData);
  const filteredData = apiData.filter(item =>
    (item.date && formatDate(item.date).includes(searchTermDate.toLowerCase())) ||
    (item.shipByDate && formatDate(item.shipByDate).includes(searchTermShibByDate.toLowerCase())) ||
    (item.orderNo && item.orderNo.toString().toLowerCase().includes(searchTermOrderNo.toLowerCase())) ||
    (item.portalOrderNo && item.portalOrderNo.toString().toLowerCase().includes(searchTermPortalOrderNo.toLowerCase())) ||
    (item.portalOrderLineId && item.portalOrderLineId.toString().toLowerCase().includes(searchTermPortalLineId.toLowerCase())) ||
    (item.qty && item.qty.toString().toLowerCase().includes(searchTermQuantity.toLowerCase())) ||
    (item.courier && item.courier.toString().toLowerCase().includes(searchTermCourier.toLowerCase())) ||
    (item.dispatched && item.dispatched.toString().toLowerCase().includes(searchTermDispatched.toLowerCase())) ||
    (item.itemPortalMapping.sellerSkuCode && item.itemPortalMapping.sellerSkuCode.toString().toLowerCase().includes(searchTermSellerSKU.toLowerCase())) ||
    (item.itemPortalMapping.portalSkuCode && item.itemPortalMapping.portalSkuCode.toString().toLowerCase().includes(searchTermPortalSKU.toLowerCase())) ||
    (item.itemPortalMapping.item.description && item.itemPortalMapping.item.description.toString().toLowerCase().includes(searchTermProductDescription.toLowerCase())) ||
    (item.itemPortalMapping.portal && item.itemPortalMapping.portal.toString().toLowerCase().includes(searchTermPortal.toLowerCase())) &&
    (searchTermCancel === null || searchTermCancel === '' || (item.cancel && item.cancel.toString().toLowerCase().includes(searchTermCancel.toLowerCase()))) &&
    (searchTermOrderStatus === null || searchTermOrderStatus === '' || (item.orderStatus && item.orderStatus.toString().toLowerCase().includes(searchTermOrderStatus.toLowerCase()))) &&
    (searchTermAwbNo === null || searchTermAwbNo === '' || (item.awbNo && item.awbNo.toString().toLowerCase().includes(searchTermAwbNo.toLowerCase())))
  );

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
  
  console.log("filteredData:", filteredData);  

  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400; // seconds in a day
    const date_info = new Date(utc_value * 1000);
  
    const fractional_day = serial - Math.floor(serial) + 0.0000001;
  
    const total_seconds = Math.floor(86400 * fractional_day);
  
    const seconds = total_seconds % 60;
  
    const total_seconds_remaining = total_seconds - seconds;
  
    const hours = Math.floor(total_seconds_remaining / (60 * 60));
    const minutes = Math.floor(total_seconds_remaining / 60) % 60;
  
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
  };
  
  const formatDateString = (dateString) => {
    if (typeof dateString === 'number') {
      const date = excelDateToJSDate(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else if (typeof dateString === 'string') {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    } else if (dateString instanceof Date) {
      const year = dateString.getFullYear();
      const month = String(dateString.getMonth() + 1).padStart(2, '0');
      const day = String(dateString.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      console.error('Invalid date format:', dateString);
      return null;
    }
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
        console.log('Original Date:', item.date); // Debugging log
        console.log('Original Ship By Date:', item.shipByDate); // Debugging log
  
        const formattedDate = formatDateString(item.date);
        const formattedShipByDate = formatDateString(item.shipByDate);
  
        console.log('Formatted Date:', formattedDate); // Debugging log
        console.log('Formatted Ship By Date:', formattedShipByDate); // Debugging log
  
        const formattedData = {
          date: formattedDate,
          orderNo: item.orderNo,
          portalOrderNo: item.portalOrderNo,
          portalOrderLineId: item.portalOrderLineId,
          portalSKU: item.portalSKU,
          productDescription: item.productDescription,
          shipByDate: formattedShipByDate,
          dispatched: item.dispatched,
          courier: item.courier,
          portal: item.portal,
          sellerSKU: item.sellerSKU,
          qty: item.qty,
          cancel: item.cancel,
          awbNo: item.awbNo,
          orderStatus: item.orderStatus || "Order Received"
        };
  
        console.log('Formatted Data:', formattedData); // Debugging log
  
        // Fetch item based on supplier and supplier SKU code
  
              // Fetch item portal mapping details
              axios.get(`${apiUrl}/itemportalmapping/Portal/PortalSku`, {
                params: {
                  portal: item.portal,
                  portalSKU: item.portalSKU,
                },
              })
                .then(res => {
                  const ipm = res.data;
                  const itemsArray = [res.data.item];
                  // Form the data to be sent in the POST request
                  const formData = {
                    ...formattedData,
                    items: itemsArray,
                    itemPortalMapping: ipm,
                  };
  
                  console.log('Form Data for POST:', formData); // Debugging log
  
                  // Send the POST request
                  axios.post(`${apiUrl}/orders`, formData)
                    .then(response => {
                      console.log('POST request successful:', response);
                      toast.success('Order added successfully', {
                        autoClose: 2000 // Close after 2 seconds
                      });
  
                      // Update the state with the new API data
                      setApiData([...apiData, response.data]);
                    })
                    .catch(error => {
                      console.error('Error sending POST request:', error);
                      toast.error('Failed to add Order: ' + error.response?.data?.message || error.message);
                    });
                })
                .catch(error => {
                  console.error('Error fetching item portal mapping:', error);
                  toast.error('Failed to fetch item portal mapping: ' + error.response?.data?.message || error.message);
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
      console.log("Form validation failed");
      setValidated(true);
      return;
    }
  
    // Fetch item based on supplier and seller SKU code
    axios.get(`${apiUrl}/item/supplier/order/search/${sellerSKU}/${productDescription}`)
      .then(response => {
        if (response.data) {
          const itemsArray = [response.data]; // Store item data in an array
  
          // Fetch item portal mapping details
          axios.get(`${apiUrl}/itemportalmapping/Portal/PortalSku`, {
            params: {
              portal,
              portalSKU
            },
          })
            .then(res => {
              const ipm = res.data;
  
              // Build the form data object dynamically
              const formData = {
                orderNo,
                portalSKU,
                productDescription,
                orderStatus: "Order Received",
                items: itemsArray,
                itemPortalMapping: ipm,
                // Add only fields that have values
                ...(date && { date }),
                ...(portalOrderNo && { portalOrderNo }),
                ...(portalOrderLineId && { portalOrderLineId }),
                ...(shipByDate && { shipByDate }),
                ...(dispatched && { dispatched }),
                ...(courier && { courier }),
                ...(portal && { portal }),
                ...(sellerSKU && { sellerSKU }),
                ...(qty && { qty }),
                ...(cancel && { cancel }),
                ...(awbNo && { awbNo }),
              };
  
              console.log('Form data: ', formData);
  
              // Send the POST request
              axios.post(`${apiUrl}/orders`, formData)
                .then(response => {
                  console.log('POST request successful:', response);
                  toast.success('Order added successfully', {
                    autoClose: 2000 // Close after 2 seconds
                  });
  
                  // Update serial number in localStorage
                  const lastSerialNumber = parseInt(localStorage.getItem('lastSerialNumber')) || 0;
                  const newSerialNumber = lastSerialNumber + 1;
                  localStorage.setItem('lastSerialNumber', newSerialNumber);
  
                  // Update order number
                  updateOrderNumber();
  
                  // Reset form validation state
                  setValidated(false);
  
                  // Update the state with the new API data
                  setApiData([...apiData, response.data]);
  
                  // Reset form fields
                  setCourier("");
                  setDispatched("");
                  setPortal("");
                  setPortalOrderno("");
                  setPortalOrderLineid("");
                  setQuantity("");
                  setShipbyDate("");
                  setProductDescription("");
                  setSellerSKU("");
                  setPortalSKU("");
                  setSelectedPortal("");
                  setCancel("");
                  setAwbNo("");
                  setOrderStatus("");
                })
                .catch(error => {
                  console.error('Error sending POST request:', error);
                  toast.error('Failed to add Order: ' + error.response?.data?.message || error.message);
                });
            })
            .catch(error => {
              console.error('Error fetching item portal mapping:', error);
              toast.error('Failed to fetch item portal mapping: ' + error.response?.data?.message || error.message);
            });
        } else {
          console.error('No item found for the specified supplier and supplier SKU code.');
        }
      })
      .catch(error => {
        console.error('Error fetching item:', error);
        toast.error('Failed to fetch item: ' + error.response?.data?.message || error.message);
      });
  
    setValidated(true);
  };
  


const handleRowSubmit = () => {
  console.log("handleRowSubmit triggered");
  console.log(selectedItem)
  if (rowSelected && selectedItem) {
    const formData = {
      ...selectedItem, 
      date,
      orderNo,
      portalOrderNo,
      portalOrderLineId,
      portalSKU,
      productDescription,
      shipByDate,
      dispatched,
      courier,
      portal,
      sellerSKU,
      qty,
      cancel,
      awbNo,
      orderStatus
    };
    console.log('form data: ', formData)
    console.log("id: ", selectedItem.orderId)
    axios.put(`${apiUrl}/orders/${selectedItem.orderId}`, formData)
      .then(response => {
        
        console.log('PUT request successful:', response);
        toast.success('Order updated successfully', {
          autoClose: 2000 // Close after 2 seconds
        });
        setApiData(prevData => prevData.map(item => item.orderId === selectedItem.orderId ? response.data : item)); // Update the specific item

        setValidated(false);
        setRowSelected(false);
        setDate("");
        setOrderno("");
        setPortalOrderno("");
        setPortalOrderLineid("");
        setPortal("");
        setSelectedPortal("");
        setPortalSKU("");
        setProductDescription("");
        setCourier("");
        setDispatched("");
        setQuantity("");
        setSellerSKU("");
        setShipbyDate("");
        setCancel("");
        setAwbNo("");
        setOrderStatus("");
      })
      .catch(error => {
        console.error('Error sending PUT request:', error);
        toast.error('Failed to update Order: ' + error.response.data.message);
      });
  }
};


const handleRowClick = (order) => {
  console.log("order: ", order);
  setDate(order.date);
  setOrderno(order.orderNo);
  setPortalOrderno(order.portalOrderNo);
  setPortalOrderLineid(order.portalOrderLineId);
  setSelectedPortal(order.portal); // Assuming 'portal' property exists in the order object
  setPortal(order.portal); // Assuming 'portal' property exists in the order object
  setPortalSKU(order.portalSKU);
  setProductDescription(order.productDescription);
  setCourier(order.courier);
  setDispatched(order.dispatched);
  setQuantity(order.qty);
  setSellerSKU(order.itemPortalMapping.skucode);
  setShipbyDate(order.shipByDate);
  setCancel(order.cancel);
  setAwbNo(order.awbNo);
  setOrderStatus(order.orderStatus);
  setRowSelected(true);
  setSelectedItem(order);
  
};



useEffect(() => {
  axios.get(`${apiUrl}/orders`) 
    .then(response => setApiData(response.data))
      .catch(error => console.error(error));
    console.log(apiData)
    axios.get(`${apiUrl}/itemportalmapping`)
    .then(response => {
      // Extract portal SKUs from the response data
      const portalSKUs = response.data.map(item => item.portalSkuCode);
      const sellerSKUs = response.data.map(seller => seller.sellerSkuCode);
      const portalNames = new Set(response.data.map(item => item.portal));
      // Convert the Set of portal names to an array
      const portalNameList = Array.from(portalNames);
      setSellerSKUList(sellerSKUs);
      setPortalSKUList(portalSKUs);
      setPortalNameList(portalNameList); // Now it should work without error

    })
    .catch(error => {
      console.error('Error fetching portal SKUs:', error);
    });
    axios.get(`${apiUrl}/item/supplier`)
    .then(response => {
      // Extract portal SKUs from the response data
      const itemDescription = response.data.map(item => item.description);
      setItemDescriptionList(itemDescription);
      console.log("portal list = " + portalSKUList)
    })
    .catch(error => {
      console.error('Error fetching portal SKUs:', error);
    });
}, []);

const postData = (data) => {
    axios.post(`${apiUrl}/orders`, data)
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

  axios.delete(`${apiUrl}/orders/${id}`)
  .then(response => {
    // Handle success response
    console.log('Row deleted successfully.');
    toast.success('Order deleted successfully', {
      autoClose: 2000 // Close after 2 seconds
    });
    setApiData(prevData => prevData.filter(row => row.orderId !== id));

  })
  .catch(error => {
    // Handle error
    console.error('Error deleting row:', error);
    toast.error('Failed to delete Order: ' + error.response.data.message);
  });
  console.log("After deletion, apiData:", apiData);
};

const downloadTemplate = () => {
  const templateData = [
      { date: '', orderNo: '',  portal: '', portalOrderNo: '', portalOrderLineId: '', portalSKU: '', sellerSKU: '', productDescription: '', qty: '', shipByDate: '', dispatched: '', courier: '', cancel: '', awbNo } // Add more fields if needed
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

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'OrderTemplate.xlsx');
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

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'OrderData.xlsx');
};

    return (
        <div>
            <ToastContainer position="top-right" />
            <div className='title'>
                    <h1>Import Order Form</h1>
                </div>
                <Accordion defaultExpanded>
        <AccordionSummary className='acc-summary'
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: '#E5E7E9' }} 
        >
          <h4>Order Form</h4>
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
        
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Order No</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Order No"
                  defaultValue=""
                  value={orderNo}
                onChange={(e) => setOrderno(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Portal</Form.Label>
          <Form.Select
          required
          value={selectedPortal} // Set the selected value
          onChange={(e) => {
            setSelectedPortal(e.target.value); // Handle value change
            setPortal(e.target.value);
            setPortalSKU(""); // Reset portal SKU when portal changes
          }}        >
          <option value="">Select Portal</option>
          {/* Map over portalNameList and create options */}
          {portalNameList.map((portal, index) => (
            <option key={index} value={portal}>{portal}</option>
          ))}
        </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Portal OrderNo</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Portal OrderNo"
                  defaultValue=""
                  value={portalOrderNo}
                onChange={(e) => setPortalOrderno(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>Portal OrderLineid</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Portal OrderLineid"
                  defaultValue=""
                  value={portalOrderLineId}
                  onChange={(e) => setPortalOrderLineid(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Portal SKU</Form.Label>
          <Form.Select
            required
            value={portalSKU} // Set the selected value
            onChange={(e) => setPortalSKU(e.target.value)} // Handle value change
          >
            <option value="">Select Portal SKU</option>
            {/* Map over filteredPortalSKUList and create options */}
            {filteredPortalSKUList.map((sku, index) => (
              <option key={index} value={sku}>{sku}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
        </Row>

         <Row className="mb-3">
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>SKUCode</Form.Label>
          <Form.Select
            required
            value={sellerSKU} // Set the selected value
            onChange={(e) => setSellerSKU(e.target.value)} // Handle value change
          >
            <option value="">Select SKUCode</option>
            {/* Map over filteredSellerSKUList and create options */}
            {filteredSellerSKUList.map((sku, index) => (
              <option key={index} value={sku}>{sku}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>Product Description</Form.Label>
          <Form.Select
            required
            value={productDescription} // Set the selected value
            onChange={(e) => setProductDescription(e.target.value)} // Handle value change
          >
            <option value="">Select Product Description</option>
            {/* Map over filteredItemDescriptionList and create options */}
            {filteredItemDescriptionList.map((description, index) => (
              <option key={index} value={description}>{description}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Quantity"
                  defaultValue=""
                  value={qty}
                  onChange={(e) => setQuantity(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
      </Row>            
      
      <Row className="mb-3">
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Shipby Date</Form.Label>
          <div className="custom-date-picker">
          <DatePicker
            selected={shipByDate}
            onChange={date => setShipbyDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select Date"
            className="form-control" // Apply Bootstrap form control class
          />
        </div>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>Dispatched</Form.Label>
          <Form.Select
          required
          value={dispatched} // Set the selected value
          onChange={(e) => setDispatched(e.target.value)} // Handle value change
        >
          <option value="">Select Dispatched</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Courier</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Courier"
                  defaultValue=""
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
    </Row>

    <Row className="mb-3">
      <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>Order Cancel</Form.Label>
          <Form.Select
          required
          value={cancel} // Set the selected value
          onChange={(e) => setCancel(e.target.value)} // Handle value change
        >
          <option value="">Select If Order Canceled</option>
          <option value="Order Not Canceled">Order Not Canceled</option>
          <option value="Order Canceled">Order Canceled</option>
        </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>AWB No</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="AWB No"
                  defaultValue=""
                  value={awbNo}
                onChange={(e) => setAwbNo(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Order Status</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Order Status"
                  defaultValue=""
                  value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
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
          <h4>List View of Orders</h4>
        </AccordionSummary>
        <AccordionDetails>
        <div style={{ overflowX: 'auto' }}> 
        <Table striped bordered hover>
            <thead>
                <tr>
                  <th></th>
                <th>
                  <span>
                  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('date')}>
                  </SwapVertIcon>
                    Date
                    <input
                      type="text"
                      placeholder="Search by date"
                      value={searchTermDate}
                      onChange={(e) => setSearchTermDate(e.target.value)}
                    />
                  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('orderNo')}>
                  </SwapVertIcon>
    Order No
    <input
      type="text"
      placeholder="Search by order no"
      value={searchTermOrderNo}
      onChange={(e) => setSearchTermOrderNo(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('portal')}>
                  </SwapVertIcon>
    Portal
    <input
      type="text"
      placeholder="Search by portal"
      value={searchTermPortal}
      onChange={(e) => setSearchTermPortal(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('portalOrderNo')}>
                  </SwapVertIcon>
    Portal Order No
    <input
      type="text"
      placeholder="Search by portal order no"
      value={searchTermPortalOrderNo}
      onChange={(e) => setSearchTermPortalOrderNo(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('portalOrderLineId')}>
                  </SwapVertIcon>
    Portal Order Line Id
    <input
      type="text"
      placeholder="Search by portal order line id"
      value={searchTermPortalLineId}
      onChange={(e) => setSearchTermPortalLineId(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('portalSKU')}>
                  </SwapVertIcon>
    Portal SKU
    <input
      type="text"
      placeholder="Search by portal SKU"
      value={searchTermPortalSKU}
      onChange={(e) => setSearchTermPortalSKU(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('sellerSKU')}>
                  </SwapVertIcon>
    SKUCode
    <input
      type="text"
      placeholder="Search by seller SKU"
      value={searchTermSellerSKU}
      onChange={(e) => setSearchTermSellerSKU(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('productDescription')}>
                  </SwapVertIcon>
    Product Description
    <input
      type="text"
      placeholder="Search by product description"
      value={searchTermProductDescription}
      onChange={(e) => setSearchTermProductDescription(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('qty')}>
                  </SwapVertIcon>
    Quantity
    <input
      type="text"
      placeholder="Search by quantity"
      value={searchTermQuantity}
      onChange={(e) => setSearchTermQuantity(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('shipByDate')}>
                  </SwapVertIcon>
    Ship by Date
    <input
      type="text"
      placeholder="Search by ship by date"
      value={searchTermShibByDate}
      onChange={(e) => setSearchTermShibByDate(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('dispatched')}>
                  </SwapVertIcon>
    Dispatched
    <input
      type="text"
      placeholder="Search by dispatched"
      value={searchTermDispatched}
      onChange={(e) => setSearchTermDispatched(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('courier')}>
                  </SwapVertIcon>
    Courier
    <input
      type="text"
      placeholder="Search by courier"
      value={searchTermCourier}
      onChange={(e) => setSearchTermCourier(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('cancel')}>
                  </SwapVertIcon>
    Order Cancel
    <input
      type="text"
      placeholder="Search by cancel"
      value={searchTermCancel}
      onChange={(e) => setSearchTermCancel(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('awbNo')}>
                  </SwapVertIcon>
    AWB No
    <input
      type="text"
      placeholder="Search by awbNo"
      value={searchTermAwbNo}
      onChange={(e) => setSearchTermAwbNo(e.target.value)}
    />
  </span>
</th>
<th>
  <span>
  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('orderStatus')}>
                  </SwapVertIcon>
    Order Status
    <input
      type="text"
      placeholder="Search by order status"
      value={searchTermOrderStatus}
      onChange={(e) => setSearchTermOrderStatus(e.target.value)}
    />
  </span>
</th>


              </tr>
            </thead>
            <tbody>
              {currentItems.map(order => (
                <tr key={order.orderId} onClick={() => handleRowClick(order)}>
                  <td style={{ width: '50px', textAlign: 'center' }}>
                      
                  <button
  style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
  className="delete-icon"
  onClick={(e) => {
    e.stopPropagation(); // Stop propagation of the click event
    handleDelete(order.orderId); // Call handleDelete function
  }}
>
  <DeleteIcon style={{ color: '#F00' }} />
</button>

                    </td>
                    <td>
  {(() => {
    const date = new Date(order.date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  })()}
</td>
<td>{order.orderNo ?? ''}</td>
<td>{order.itemPortalMapping?.portal ?? ''}</td>
<td>{order.portalOrderNo ?? ''}</td>
<td>{order.portalOrderLineId ?? ''}</td>
<td>{order.itemPortalMapping?.portalSkuCode ?? ''}</td>
<td>{order.items[0]?.sellerSKUCode ?? ''}</td>
<td>{order.itemPortalMapping?.item?.description ?? ''}</td>
<td>{order.qty ?? ''}</td>
<td>
  {(() => {
    const date = new Date(order.shipByDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  })()}
</td>
<td>{order.dispatched ?? ''}</td>
<td>{order.courier ?? ''}</td>
<td>{order.cancel ?? ''}</td>
<td>{order.awbNo ?? ''}</td>
<td>{order.orderStatus ?? ''}</td>
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

export default ImportOrderForm;