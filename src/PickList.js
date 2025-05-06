import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import "./PickList.css"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DeleteIcon from '@mui/icons-material/Delete';
import MyTable from './MyTable.js';
import 'jspdf-autotable';
import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useDispatch, useSelector } from 'react-redux';

const PicklistComponent = () => {
  const user = useSelector((state) => state.user);  // Access user data from Redux store

  const apiUrl = process.env.REACT_APP_API_URL;
  const [apiData, setApiData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [picklistData, setPicklistData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState("");
  const [orderData, setOrderData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [mergedOrderData, setMergedOrderData] = useState();
  const [mergedPicklistData, setMergedPicklistData] = useState([]); 
  const [selectedOrderData, setSelectedOrderData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [bomCode, setBomCode] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [bomCodeList, setBomCodeList] = useState([]);
  const rowsPerPageOptions = [10, 20, 50];
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [boms, setBoms] = useState({});
  const [bomCodes, setBomCodes] = useState({});
  const [filters, setFilters] = useState({
    date: '',
    orderNo: '',
    portalOrderNo: '',
    portal: '',
    sellerSKU: '',
    skuCode: '',
    orderQty: '',
    bomCode: ''
  });
  const [currentPage1, setCurrentPage1] = useState(1);
const [itemsPerPage1] = useState(10); // Number of items per page

// Apply filters to orders
const filteredOrders = orders
  .filter(order => {
    return (
      (filters.date === '' || new Date(order.date).toLocaleDateString().includes(filters.date)) &&
      (filters.orderNo === '' || order.orderNo.includes(filters.orderNo)) &&
      (filters.portalOrderNo === '' || order.portalOrderNo.includes(filters.portalOrderNo)) &&
      (filters.portal === '' || order.portal.includes(filters.portal)) &&
      (filters.sellerSKU === '' || order.items[0].sellerSKUCode.includes(filters.sellerSKU)) &&
      (filters.skuCode === '' || order.items[0].skucode.includes(filters.skuCode)) &&
      (filters.orderQty === '' || order.qty.toString().includes(filters.orderQty)) &&
      (filters.bomCode === '' || (bomCodes[order.orderNo] || '').includes(filters.bomCode))
    );
  });

// Calculate the total number of pages
const totalPages1 = Math.ceil(filteredOrders.length / itemsPerPage1);

// Calculate the current page's items
const currentItems1 = filteredOrders.slice(
  (currentPage1 - 1) * itemsPerPage1,
  currentPage1 * itemsPerPage1
);

// Handle page change
const handlePageChange1 = (pageNumber) => {
  setCurrentPage1(pageNumber);
};

  useEffect(() => {
    const fetchBomsForOrder = async (orderNo) => {
      try {
        const response = await axios.get(`${apiUrl}/picklists/boms/${orderNo}`, {params: { email: user.email }, withCredentials: true });
        console.log("Fetched BOMs for order", orderNo, response.data);
        setBoms(prevBoms => ({
          ...prevBoms,
          [orderNo]: response.data
        }));
  
        // Fetch the default BOM code for the orderNo
        const bomCodeResponse = await axios.get(`${apiUrl}/picklists/bom/default/bomCode?orderNo=${orderNo}`, {params: { email: user.email }, withCredentials: true });
        console.log("Response = " + bomCodeResponse.data);
        setBomCodes(prevBomCodes => ({
          ...prevBomCodes,
          [orderNo]: bomCodeResponse.data
        }));
        console.log(`Initial BOM for order ${orderNo} = ${bomCodeResponse.data}`);
      } catch (error) {
        console.error(`Error fetching BOMs for order ${orderNo}:`, error);
      }
    };
  
    // Use a Set to keep track of processed orderNos and avoid duplicates
    const processedOrders = new Set();
  
    if (orders.length > 0) {
      orders.forEach(order => {
        if (!processedOrders.has(order.orderNo)) {
          fetchBomsForOrder(order.orderNo);
          processedOrders.add(order.orderNo); // Mark the orderNo as processed
        }
      });
    }
  }, [orders]);
  


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

  useEffect (() => {
    axios.get(`${apiUrl}/picklists/orderData`, {params: { email: user.email }, withCredentials: true })
      .then(response => {
        setOrderData(response.data);
        console.log("orderData = " + JSON.stringify(orderData));
      })
      .catch(error => {
        console.error('Error getting order data:', error);
      });
  }, [])

  useEffect(() => {
    axios.get(`${apiUrl}/api/locations/user/email`, {params: { email: user.email }, withCredentials: true })
      .then(response => {
        setLocations(response.data);
      })
      .catch(error => {
        console.log("error getting locations: " + error);
      })
  }, [user])

  useEffect(() => {
    axios.get(`${apiUrl}/picklists/merged/picklist`, {params: { email: user.email }, withCredentials: true })
      .then(response => {
        setPicklistData(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const sortedData = picklistData.sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    }
    return picklistData;
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
  const currentItems = picklistData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  const handleCheckboxChange = async (event, orderNo, bomCode) => {
    console.log("in handle");

    if (orderNo === undefined) {
        // "Select All" checkbox logic
        const allOrderNos = orders.map(order => order.orderNo);
        const updatedSelectedRows = event.target.checked ? allOrderNos : [];
        setSelectedRows(updatedSelectedRows);

        if (event.target.checked) {
            const promises = orders.map(order => 
                axios.get(`${apiUrl}/picklists/getSelectedOrderData?orderNo=${order.orderNo}&bomCode=${bomCodes[order.orderNo]}`, {params: { email: user.email }, withCredentials: true })
                    .then(response => {
                        console.log("selected bomCode = " + bomCodes[order.orderNo]);
                        console.log("from backend = "+ response.data); 
                        return response.data; // Return data on success
                    })
                    .catch(error => {
                        console.error(`Error fetching data for orderNo ${order.orderNo}:`, error);
                        return []; // Return empty array on failure
                    })
            );

            Promise.all(promises)
                .then(results => {
                    const orderData = results.reduce((acc, data) => [...acc, ...data], []);
                    setSelectedOrderData(orderData);
                })
                .catch(error => {
                    console.error('Error fetching order data:', error);
                });
        } else {
            setSelectedOrderData([]);
        }
    } else {
        // Individual checkbox logic
        const updatedSelectedRows = event.target.checked
            ? [...selectedRows, orderNo]
            : selectedRows.filter(row => row !== orderNo);

        setSelectedRows(updatedSelectedRows);

        if (event.target.checked) {
            try {
                const orderDataResponse = await axios.get(`${apiUrl}/picklists/getSelectedOrderData?orderNo=${orderNo}&bomCode=${bomCode}`,{params: { email: user.email }, withCredentials: true });
                const orderData = orderDataResponse.data;
                setSelectedOrderData(prevData => [...prevData, ...orderData]);
            } catch (error) {
                console.error('Error fetching BOM or order data:', error);
            }
        } else {
            setSelectedOrderData(prevData => prevData.filter(order => order.orderNo !== orderNo));
        }
    }
};

  
  
  const generatePicklist = () => {
    // Assuming your API endpoint for fetching all picklists is '/picklists'
    axios.get(`${apiUrl}/picklists/user/email`, {params: { email: user.email }, withCredentials: true })
      .then(response => {
        const picklists = response.data;
        if (picklists.length === 0) {
          // If no picklists are available, start with picklist number 1
          generatePicklistWithNumber(1);
          return;
        }
        // Sort picklists based on picklist number in descending order
        picklists.sort((a, b) => b.pickListNumber - a.pickListNumber);
        const latestPicklistNumber = picklists[0].pickListNumber;
        generatePicklistWithNumber(latestPicklistNumber + 1);
      })
      .catch(error => {
        console.error('Error fetching picklists:', error);
      });
  };
  

const generatePicklistWithNumber = async (pickListNumber) => {
    const selectedOrders = orders.filter(order => selectedRows.includes(order.orderNo));
    //const selectedOrderDatas = orderData.filter(orderData => selectedRows.includes(orderData.orderNo));
  console.log("selected order datas 101 = " + JSON.stringify(selectedOrderData));
    try {
        // First, post to 'picklistdata' endpoint for each selected order data
        await Promise.all(selectedOrderData.map(async s => {
            const selectedOrder = {
                pickListNumber: pickListNumber,
                date: new Date(),
                portalOrderNo: s.portalOrderNo,
                orderNo: s.orderNo,
                bomCode: s.bomCode,
                portal: s.portal,
                sellerSKU: s.sellerSKU,
                qty: s.qty,
                description: s.description,
                binNumber: s.binNumber,
                rackNumber: s.rackNumber,
                pickQty: s.pickQty,
                skucode: s.skucode,
                userEmail: user.email
            };

            console.log("selected order = " + JSON.stringify(selectedOrder));

            try {
                const response = await axios.post(`${apiUrl}/picklistdata`, selectedOrder, {withCredentials: true });
                console.log('Picklist data generated successfully:', response.data);
            } catch (error) {
                console.error('Error generating picklist data:', error);
                throw new Error('Failed to generate picklist data');
            }
        }));

        // Then, post to 'picklists' endpoint for all selected orders
        const response = await axios.post(`${apiUrl}/picklists`, {
            pickListNumber,
            orders: selectedOrders,
            userEmail: user.email,
        },
        {withCredentials: true });

        console.log('Picklist generated successfully:', response.data);

        // Optionally, update state or perform other actions here after both requests succeed
        setSelectedOrderData([]);
        setSelectedRows([]);

        // Fetch updated picklist and orders data
        await Promise.all([
            axios.get(`${apiUrl}/picklists/merged/picklist`, {params: { email: user.email }, withCredentials: true }),
            axios.post(`${apiUrl}/picklists/not/generated/orders`, {withCredentials: true })
        ]).then(([picklistResponse, ordersResponse]) => {
            setPicklistData(picklistResponse.data);
            setOrders(ordersResponse.data);
            toast.success('PickList generated successfully', {
                autoClose: 2000
            });
        }).catch(error => {
            console.error('Error fetching picklists or orders:', error);
            toast.error('Failed to fetch updated data after generating PickList');
        });

    } catch (error) {
        console.error('Error generating picklist:', error);
        toast.error('Failed to generate PickList: ' + error.message);
    }
};




const selected = (selectedOrders) => {
  return selectedOrders.reduce((acc, picklist) => {
    console.log("selected orders = " + JSON.stringify(selectedOrders));
    const existingGroup = acc.find(group => group.sellerSKU === picklist.sellerSKU);
    if (existingGroup) {
      existingGroup.qty += picklist.qty; 
      existingGroup.pickQty += picklist.pickQty; // Accumulate pickQty
    } else {
      acc.push({ ...picklist });
    }
    return acc;
  }, []);
}

const generatePicklistPDF1 = async () => {
  try {
      // Create a new PDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const selectedOrders = orderData.filter(order => selectedRows.includes(order.orderNo));
      console.log(JSON.stringify(selectedOrders));

      // Group picklistData by pickListNumber
      const groupedData = selected(selectedOrders);
    
      // Define table columns
      const columns = [
          { title: "Date", dataKey: "date" },
          { title: "Order No", dataKey: "orderNo" },
          { title: "Portal", dataKey: "portal" },
          { title: "Seller SKU", dataKey: "sellerSKU" },
          { title: "Qty", dataKey: "qty" },
          { title: "Description", dataKey: "description" },
          { title: "Bin Number", dataKey: "binNumber" },
          { title: "Rack Number", dataKey: "rackNumber" },
          { title: "Pick Quantity", dataKey: "pickQty" }
      ];

      // Define table rows
      const rows = groupedData.map((order) => ({
          date: formatDate(order.date),
          orderNo: order.orderNo,
          portal: order.portal,
          sellerSKU: order.sellerSKU,
          qty: order.qty,
          description: order.description,
          binNumber: order.binNumber || 'N/A',
          rackNumber: order.rackNumber || 'N/A',
          pickQty: order.pickQty
      }));

      // Add table to PDF
      pdf.autoTable({ columns, body: rows });

      // Save the PDF with a specified name
      pdf.save('pick_list.pdf');

  } catch (error) {
      console.error("Error generating PDF:", error);
  }
};


const handleDelete = (pickListNumber) => {
  console.log("Deleting row with picklist number:", pickListNumber);

  axios.delete(`${apiUrl}/picklistdata/picklistnumber/${pickListNumber}`, {params: { email: user.email }, withCredentials: true })
  .then(response => {
    console.log('Row deleted successfully.');
    toast.success('PickList deleted successfully', {
      autoClose: 2000
    });
    setPicklistData(prevData => prevData.filter(row => row.pickListNumber !== pickListNumber));
    axios.post(`${apiUrl}/picklists/not/generated/orders`, { withCredentials: true })
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => {
        console.log("error getting orders: " + error);
      })
  })
  .catch(error => {
    console.error('Error deleting row:', error);
    toast.error('Failed to delete picklist: ' + error.message);
  });

  console.log("After deletion, apiData:", apiData);
};

const handleRowClick = (event, orderNo) => {
  console.log("in handle1");

  // Check if the orderNo is already in selectedRows
  const isChecked = selectedRows.includes(orderNo);
  
  // Update selectedRows based on whether the orderNo is already selected or not
  const updatedSelectedRows = isChecked
    ? selectedRows.filter(id => id !== orderNo) // If already selected, remove it
    : [...selectedRows, orderNo]; // If not selected, add it
  
  // Update selectedRows state
  setSelectedRows(updatedSelectedRows);

  // If the row was just selected, fetch orderData for the selected orderNo
  if (!isChecked) {
    axios.get(`${apiUrl}/picklists/getSelectedOrderData?orderNo=${orderNo}`, {params: { email: user.email }, withCredentials: true })
      .then(response => {
        // Assuming the API response is an array of orderData
        const orderData = response.data;
        // Add the fetched orderData to selectedOrderData state
        setSelectedOrderData(prevData => [...prevData, ...orderData]);
      })
      .catch(error => {
        console.error('Error fetching order data:', error);
        // Handle error as needed
      });
  } else {
    // If the row was deselected, remove the corresponding orderData from selectedOrderData
    setSelectedOrderData(prevData => prevData.filter(order => order.orderNo !== orderNo));
  }
};


const handleDownload1 = async (pickListNumber) => {
  try {
      const picklistItems = picklistData.filter(picklist => picklist.pickListNumber === pickListNumber);
      
      if (picklistItems.length === 0) {
          console.error(`Picklist with pickListNumber ${pickListNumber} not found.`);
          return;
      }

      // Create a new PDF instance
      const pdf = new jsPDF();

      const logoURL = 'https://media.licdn.com/dms/image/D560BAQF6CchqkqZEEQ/company-logo_200_200/0/1704887637105/techjyot___india_logo?e=2147483647&v=beta&t=S1jLov5GABl39n8XPksGcm8GIQsmvMTLl84RwYZNL-8'; // Replace with your actual base64 or URL
      pdf.addImage(logoURL, 'PNG', 10, 10, 30, 15); // Adjust the position and size as needed

      // Add heading
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PickList', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

      // Add current date
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formattedDate, pdf.internal.pageSize.getWidth() - 50, 20);

      // Add PackingList Number
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`PickList Number: ${pickListNumber}`, 15, 35);
      
      // Set font size and style for the table
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');

      // Define table columns
      const columns = [
          { title: "Date", dataKey: "date" },
          { title: "Seller SKU", dataKey: "sellerSKU" },
          { title: "Order Qty", dataKey: "qty" },
          { title: "Pick Qty", dataKey: "pickQty" },
          { title: "Bin Number", dataKey: "binNumber" },
          { title: "Rack Number", dataKey: "rackNumber" }
      ];

      // Define table rows
      const rows = picklistItems.map(item => ({
          date: formatDate(item.date), // Format the date
          sellerSKU: item.sellerSKU,
          qty: item.qty,
          pickQty: item.pickQty,
          binNumber: item.binNumber || "N/A",
          rackNumber: item.rackNumber || "N/A"
      }));

      // Add table to PDF
      pdf.autoTable({ columns, body: rows, startY: 40  });

      // Save the PDF with a specified name
      pdf.save(`picklist_${pickListNumber}.pdf`);
      
  } catch (error) {
      console.error("Error generating PDF:", error);
  }
};

// Function to format date as dd-mm-yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const handleDropdownChange = (event, orderNo) => {
  // Handle dropdown change
  console.log(`Selected ${event.target.value} for order ${orderNo}`);
};

const handleLocationChange = (selectedLocation) => {
  console.log(`Selected Location: ${selectedLocation.locationName}`);
  
  // Send selectedLocation in the POST request
  axios.post(`${apiUrl}/picklists/not/generated/orders`, selectedLocation, {params: { email: user.email }, withCredentials: true })
    .then(response => {
      setOrders(response.data);
      console.log("Orders fetched successfully", response.data);
    })
    .catch(error => {
      console.log("Error getting orders: " + error);
    });
};

  return (
    <div>
      <div className='title'>
          <h1>PickList</h1>
        </div>
        <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: '#E5E7E9' }} 
        >
          <h4>PickList</h4>
        </AccordionSummary>
        <AccordionDetails>
        <ToastContainer position="top-right" />
        <div style={{ overflowX: 'auto' }}> 

        <div className="locationSelect">
  <Form.Select
    required
    value={location ? location.locationId : ""} // Use a default value when location is undefined
    onChange={(e) => {
      const selectedLocationId = e.target.value;
      const selectedLocation = locations.find(loc => loc.locationId === parseInt(selectedLocationId));

      // Ensure selectedLocation exists before proceeding
      if (selectedLocation) {
        setLocation(selectedLocation); // Update the state with the selected location
        handleLocationChange(selectedLocation); // Pass the entire location object to the handler
      }
    }}
  >
    <option value="">Select Location</option>
    {locations && locations.map((loc) => ( // Ensure locations is defined
      <option key={loc.locationId} value={loc.locationId}>
        {loc.locationName}
      </option>
    ))}
  </Form.Select>
</div>

        <Table striped bordered hover className='custom-table' style={{ width: '100%' }}>
  <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
    <tr>
      <th style={{ width: '5%' }}>
        <input
          type="checkbox"
          id={`checkbox-${uuidv4()}`}
          checked={selectedRows.length === filteredOrders.length}
          onChange={(event) => handleCheckboxChange(event)}
        />
      </th>
      <th style={{ width: '15%' }}>
        <input
          type="text"
          placeholder="Filter Date"
          value={filters.date}
          onChange={(e) => setFilters(prevFilters => ({ ...prevFilters, date: e.target.value }))}
        />
      </th>
      <th style={{ width: '10%' }}>
        <input
          type="text"
          placeholder="Filter Order No"
          value={filters.orderNo}
          onChange={(e) => setFilters(prevFilters => ({ ...prevFilters, orderNo: e.target.value }))}
        />
      </th>
      <th style={{ width: '10%' }}>
        <input
          type="text"
          placeholder="Filter Porta Order No"
          value={filters.portalOrderNo}
          onChange={(e) => setFilters(prevFilters => ({ ...prevFilters, portalOrderNo: e.target.value }))}
        />
      </th>
      <th style={{ width: '10%' }}>
        <input
          type="text"
          placeholder="Filter Portal"
          value={filters.portal}
          onChange={(e) => setFilters(prevFilters => ({ ...prevFilters, portal: e.target.value }))}
        />
      </th>
      <th style={{ width: '15%' }}>
        <input
          type="text"
          placeholder="Filter Seller SKU"
          value={filters.sellerSKU}
          onChange={(e) => setFilters(prevFilters => ({ ...prevFilters, sellerSKU: e.target.value }))}
        />
      </th>
      <th style={{ width: '10%' }}>
        <input
          type="text"
          placeholder="Filter SKU Code"
          value={filters.skuCode}
          onChange={(e) => setFilters(prevFilters => ({ ...prevFilters, skuCode: e.target.value }))}
        />
      </th>
      <th style={{ width: '10%' }}>
        <input
          type="text"
          placeholder="Filter Order Qty"
          value={filters.orderQty}
          onChange={(e) => setFilters(prevFilters => ({ ...prevFilters, orderQty: e.target.value }))}
        />
      </th>
      <th style={{ width: '15%' }}>
        <input
          type="text"
          placeholder="Filter Bom Code"
          value={filters.bomCode}
          onChange={(e) => setFilters(prevFilters => ({ ...prevFilters, bomCode: e.target.value }))}
        />
      </th>
    </tr>
  </thead>
  <tbody>
    {currentItems1.map(order => (
      <tr key={uuidv4()}>
        <td>
          <input
            type="checkbox"
            id={`checkbox-${uuidv4()}`}
            checked={selectedRows.includes(order.orderNo)}
            onChange={(event) => handleCheckboxChange(event, order.orderNo, bomCodes[order.orderNo])}
          />
        </td>
        <td>{(() => {
          const date = new Date(order.date);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        })()}</td>
        <td>{order.orderNo}</td>
        <td>{order.portalOrderNo}</td>
        <td>{order.portal}</td>
        <td>{order.items[0].sellerSKUCode}</td>
        <td>{order.items[0].skucode}</td>
        <td>{order.qty}</td>
        <td>
          <Form.Select
            required
            onChange={(e) => {
              const { value } = e.target;
              setBomCodes(prevBomCodes => ({
                ...prevBomCodes,
                [order.orderNo]: value
              }));
            }}
            value={bomCodes[order.orderNo] || ''}
          >
            <option value=''>{bomCodes[order.orderNo] || 'Select Bom Code'}</option>
            {boms[order.orderNo]?.map((sku) => (
              <option key={sku.bomId} value={sku.bomCode}>
                {sku.bomCode}
              </option>
            )) || <option>Loading...</option>}
          </Form.Select>
        </td>
      </tr>
    ))}
  </tbody>
</Table>

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

</div>


{selectedRows.length > 0 && (
  <MyTable 
    selectedOrderData={selectedOrderData} 
    generatePicklist={generatePicklist}
    generatePicklistPDF={generatePicklistPDF1}
  />
)}

</AccordionDetails>
      </Accordion>


<Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: '#E5E7E9' }} 
        >
          <h4>List View of PickList</h4>
        </AccordionSummary>
        <AccordionDetails>
        <div style={{ overflowX: 'auto' }}> 

        <Table striped bordered hover>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th>
      <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('pickListNumber')}>
                  </SwapVertIcon>
        Pick List Number</th>
      <th>
      <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('date')}>
                  </SwapVertIcon>
        Date</th>
      <th>
      <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('sellerSKU')}>
                  </SwapVertIcon>
        Seller SKU</th>
      <th>
      <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('qty')}>
                  </SwapVertIcon>
        Order Qty</th>
      <th>
      <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('pickQty')}>
                  </SwapVertIcon>
        Pick Qty</th>
      <th>
      <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('binNumber')}>
                  </SwapVertIcon>
        Bin Number</th>
      <th>
      <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('rackNumber')}>
                  </SwapVertIcon>
        Rack Number</th>
    </tr>
  </thead>
  <tbody>
  {picklistData.map((picklist, index) => {
    const rowsForPickListNumber = picklistData.filter(
      p => p.pickListNumber === picklist.pickListNumber
    ).length;

    const isFirstRowForPickListNumber = index === picklistData.findIndex(
      p => p.pickListNumber === picklist.pickListNumber
    );

    const deleteButtonCell = isFirstRowForPickListNumber ? (
      <td rowSpan={rowsForPickListNumber} style={{ width: '50px', textAlign: 'center' }}>
        <button
          style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
          className="delete-icon"
          onClick={(e) => {
            e.stopPropagation(); 
            handleDelete(picklist.pickListNumber); 
          }}
        >
          <DeleteIcon style={{ color: '#F00' }} />
        </button>
      </td>
    ) : null;

    const downloadButtonCell = isFirstRowForPickListNumber ? (
      <td rowSpan={rowsForPickListNumber}>
        <button onClick={() => handleDownload1(picklist.pickListNumber)}>Download</button>
      </td>
    ) : null;

    return (
      <tr key={index}>
        {deleteButtonCell}
        {downloadButtonCell}
        {isFirstRowForPickListNumber && <td rowSpan={rowsForPickListNumber}>{picklist.pickListNumber}</td>}
        <td>
          {(() => {
            const date = new Date(picklist.date);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          })()}
        </td>
        <td>{picklist.sellerSKU ? picklist.sellerSKU : ''}</td>
        <td>{picklist.qty}</td>
        <td>{picklist.pickQty}</td>
        <td>{picklist.binNumber ? picklist.binNumber : "N/A"}</td>
        <td>{picklist.rackNumber ? picklist.rackNumber : "N/A"}</td>
      </tr>
    );
  })}
</tbody>

</Table>
</div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {rowsPerPageDropdown}
            <Pagination>
              {Array.from({ length: Math.ceil(picklistData.length / itemsPerPage) }).map((_, index) => (
                <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>

      </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default PicklistComponent;
