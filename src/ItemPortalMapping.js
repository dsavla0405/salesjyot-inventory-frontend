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
import axios from 'axios';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useDispatch, useSelector } from 'react-redux';

function ItemPortalMapping() {
  const user = useSelector((state) => state.user);  // Access user data from Redux store

    const apiUrl = process.env.REACT_APP_API_URL;
    const [validated, setValidated] = useState(false);
    const [portal, setPortal] = useState("");
    const [supplier, setSeller] = useState(null);
    const [skucode, setSkucode] = useState("");
    const [portalSkuCode, setPortalSKU] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [apiData, setApiData] = useState([]); 
    const [suppliersList, setSuppliersList] = useState([]);
    const [rowSelected, setRowSelected] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTermPortal, setSearchTermPortal] = useState('');
    const [searchTermSupplier, setSearchTermSupplier] = useState('');
    const [searchTermSkucode, setSearchTermSkucode] = useState('');
    const [searchTermPortalSKU, setSearchTermPortalSKU] = useState('');
    const [isRotating, setIsRotating] = useState(false);
    const [skucodeList, setSkucodeList] = useState([]);
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

    const filteredData = apiData.filter(supplier => {
      return (
        (!searchTermPortal || (supplier.portal && supplier.portal.toLowerCase().includes(searchTermPortal.toLowerCase()))) &&
        (!searchTermSupplier || (supplier.supplier && supplier.supplier.supplierName.toLowerCase().includes(searchTermSupplier.toLowerCase()))) &&
        (!searchTermPortalSKU || (supplier.portalSkuCode && supplier.portalSkuCode.toLowerCase().includes(searchTermPortalSKU.toLowerCase()))) &&
        (!searchTermSkucode || (supplier.skucode && supplier.skucode.toLowerCase().includes(searchTermSkucode.toLowerCase())))
      );
    });

    const sortedData = filteredData.sort((a, b) => {
      if (sortConfig.key) {
        const aValue = sortConfig.key === 'supplier' ? a[sortConfig.key]?.supplierName : a[sortConfig.key];
        const bValue = sortConfig.key === 'supplier' ? b[sortConfig.key]?.supplierName : b[sortConfig.key];
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

    const formatPortal = (portal) => {
      const words = portal.split(' ');
      const formattedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      return formattedWords.join(' ');
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      
      // Check if all required fields are filled
      if (form.checkValidity() === false || !portal || !portalSkuCode || !skucode || !supplierId) {
        event.stopPropagation();
        setValidated(true); // This will trigger the display of validation messages
        
        // You can also show a toast message for better user experience
        if (!portal || !portalSkuCode || !skucode || !supplierId) {
          toast.error('Please fill out all required fields');
        }
        
        return; // Stop the function execution here if validation fails
      }
      
      console.log("supplier = " + supplierId + "sellerSKU =" + skucode);
    
      // Proceed with API calls only if validation passes
      axios.get(`${apiUrl}/item/supplier/search/${supplierId}/${skucode}`, { params: { email: user.email }, withCredentials: true })
        .then(response => {
          if (response.data) {
            const item = response.data;
            const portalUpperCase = formatPortal(portal);
            const formData = {
              portal: portalUpperCase,
              supplier,
              portalSkuCode,
              skucode,
              item: item,
              userEmail: user.email,
            };
            console.log('form data: ', formData);
            axios.post(`${apiUrl}/itemportalmapping`, formData, { withCredentials: true })
              .then(response => {
                console.log('POST request successful:', response);
                toast.success('Item Portal Mapping added successfully', {
                  autoClose: 2000 // Close after 2 seconds
                });
                setValidated(false);
                setApiData([...apiData, response.data]);
                setPortal(""); 
                setPortalSKU(""); 
                setSkucode("");
                setSeller(""); 
              })
              .catch(error => {
                console.error('Error sending POST request:', error);
                toast.error('Failed to add item portal mapping: ' + error.response.data.message);
              });
          } else {
            console.error('No item found for the specified supplier and supplier SKU code.');
            toast.error('No item found for the specified supplier and supplier SKU code.');
          }
        })
        .catch(error => {
          console.error('Error fetching item:', error);
          toast.error('Error fetching item: ' + (error.response?.data?.message || error.message));
        });
      
      setValidated(true);
    };

    const downloadTemplate = () => {
      const templateData = [
          {portal: '', supplierName: '', portalSkuCode: '', skucode: ''} 
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
    
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'itemPortalMappingTemplate.xlsx');
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
          const { portalSkuCode, portal, skucode, supplierName } = item;
    
          // // Data Validation (optional but recommended)
          // if (!portal || !sellerSkuCode || !supplierName || !phone) {
          //   console.error('Missing required field(s) in data:', item);
          //   // Handle missing data (e.g., skip or log error)
          //   return;
          // }
    
          fetchSupplierAndItem(supplierName, skucode)
            .then(data => {
              console.log(data);
              // Modify data as needed before posting (optional)
              data.portal = portal;
              data.skucode = skucode;
              data.portalSkuCode = portalSkuCode; // Use optional chaining for potential missing item.portalSkuCode
              postData(data);
            })
            .catch(error => {
              console.error('Error handling item for:', item, error);
              // Handle errors (e.g., display error message to user)
            });
        });
      };
    
      reader.readAsBinaryString(file);
    };
    
  
  const fetchSupplierAndItem = (supplierName, skucode) => {
      console.log("in fetch");
  
      // First API call to fetch supplier details
      return axios.get(`${apiUrl}/supplier/name/${supplierName}`, { params: { email: user.email }, withCredentials: true })
          .then(supplierResponse => {
              const supplier = supplierResponse.data;
              console.log('Supplier fetched successfully:', supplier);
  
              // Second API call to fetch item using the retrieved supplier details
              return axios.get(`${apiUrl}/item/supplier/search/${supplier.supplierId}/${skucode}`, { params: { email: user.email }, withCredentials: true })
                  .then(itemResponse => {
                      const item = itemResponse.data;
                      console.log('Item fetched successfully:', item);
                      const formattedData = {
                          portal: item.portal,
                          supplier: supplier,
                          skucode: skucode,
                          portalSkuCode: item.portalSkuCode,
                          item: item,
                          userEmail: user.email,
                      };
                      return formattedData;
                  })
                  .catch(error => {
                      console.error('Error fetching item:', error);
                      throw error;
                  });
          })
          .catch(error => {
              console.error('Error fetching supplier:', error);
              throw error;
          });
  };
  


const handleSupplierChange = (event, name) => {
  if (name) {
    const selectedSupplier = suppliersList.find(supplier => supplier.supplierName === name);
    console.log("selected supplier = " + JSON.stringify(selectedSupplier));
    if (selectedSupplier) {
      // Fetch the sellerSKUCode based on the selected supplier's name
      axios.get(`${apiUrl}/item/supplier/search/seller/${selectedSupplier.supplierName}`, { params: { email: user.email }, withCredentials: true })
        .then(response => {
          console.log("list = " + response.data);
    // Split the response data into an array of strings, assuming it's comma-separated
    const sellerSKUs = response.data.split(', ');
    // Update the sellerSKUList state with the fetched values
    setSkucodeList(prevSellerSKUs => [...prevSellerSKUs, ...sellerSKUs]);
    console.log(skucodeList);
        })
        .catch(error => {
          console.error('Error fetching sellerSKUCode:', error);
        });
      
      // Update the selected supplier name and supplierId
      setSeller(selectedSupplier);
      setSupplierId(selectedSupplier.supplierId);
    } else {
      console.error("Supplier not found for name:", name);
      
    }
  } else {
    
  }
};

  
  const handleDelete = (id) => {
    console.log("Deleting row with id:", id);
    // Remove the row from the table
  
    axios.delete(`${apiUrl}/itemportalmapping/${id}`, { withCredentials: true })
    .then(response => {
      console.log('Row deleted successfully.');
      toast.success('Item Portal Mapping deleted successfully', {
        autoClose: 2000
      });
      setApiData(prevData => prevData.filter(row => row.id !== id));

    })
    .catch(error => {
      console.error('Error deleting row:', error);
      toast.error('Failed to delete item portal mapping: ' + error.response.data.message);

    });

    console.log("After deletion, apiData:", apiData);
  };
    
  
    const handleRowSubmit = () => {
      console.log("handleRowSubmit triggered");
      console.log(selectedItem)
      if (!portal) {
            toast.error('Portal is required');
            return;
          }
      if (!supplier) {
            toast.error('Supplier is required');
            return;
          }
      if (!portalSkuCode) {
            toast.error('Portal SKUcode is required');
            return;
          }
      if (!skucode) {
            toast.error('SKUcode is required');
            return;
          }
      if (rowSelected && selectedItem) {
        const formData = {
          portal,
          supplier,
          portalSkuCode,
          skucode
        };
        console.log('form data: ', formData)
        console.log("id: ", selectedItem.id)
        axios.put(`${apiUrl}/itemportalmapping/${selectedItem.id}`, formData, { withCredentials: true })
          .then(response => {
            
            console.log('PUT request successful:', response);
            toast.success('Item Portal Mapping updated successfully', {
              autoClose: 2000 // Close after 2 seconds
            });
            setApiData(prevData => prevData.map(item => item.id === selectedItem.id ? response.data : item)); // Update the specific item

            setValidated(false);
            setRowSelected(false);
            setPortal("");
            setSeller("");
            setPortalSKU("");
            setSkucode("");
          })
          .catch(error => {
            console.error('Error sending PUT request:', error);
            toast.error('Failed to update item portal mapping: ' + error.response.data.message);
          });
      }
    };
  
    const handleRowClick = (ipm) => {
      setPortal(ipm.portal);
      setSeller(ipm.supplier);
      setPortalSKU(ipm.portalSkuCode);
      setSkucode(ipm.skucode);
      setRowSelected(true);
      setSelectedItem(ipm);
    };
    
 
      useEffect(() => {
        axios.get(`${apiUrl}/supplier/user/email`, { params: { email: user.email }, withCredentials: true })
        .then(response => {
          setSuppliersList(response.data); 
        })
        .catch(error => {
          console.error('Error fetching supplier data:', error);
        });

        axios.get(`${apiUrl}/itemportalmapping/user/email`, { params: { email: user.email }, withCredentials: true }) 
          .then(response => setApiData(response.data))
          .catch(error => console.error(error));
          console.log(apiData)
      }, [user]);
  
      const fetchData = () => {
        axios.get(`${apiUrl}/supplier/user/email`, { params: { email: user.email }, withCredentials: true })
          .then(response => {
            setSuppliersList(response.data); 
          })
          .catch(error => {
            console.error('Error fetching supplier data:', error);
          });
      }
    
  const postData = (data) => {
    axios.post(`${apiUrl}/itemportalmapping`, data, { withCredentials: true })
      .then(response => {
        // Handle successful response
        console.log('Data posted successfully:', response);
        toast.success('Item Portal Mapping added successfully', {
          autoClose: 2000 // Close after 2 seconds
        });
        setApiData(prevData => [...prevData, response.data]);

      })
      .catch(error => {
        // Handle error
        console.error('Error posting data:', error);
      });
  };    

  const uniquePortals = [...new Set(apiData.filter(item => item.portal !== null).map(item => item.portal))];


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
  
    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'ItemPortalMappingData.xlsx');
  };

    return (
        <div>
            <ToastContainer position="top-right" />
            <div className='title'>
                    <h1>Import Portal Mapping</h1>
                </div>
        <Accordion defaultExpanded>
        <AccordionSummary className='acc-summary'
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: '#E5E7E9' }} 
        >
          <h4>ItemPortalMapping Form</h4>
        </AccordionSummary>
        <AccordionDetails>
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Portal <span style={{ color: 'red' }}>*</span></Form.Label>
          <input 
            className='form-control'
              list="uniquePortals" 
              onChange={(e) => setPortal(e.target.value)} 
              placeholder="Portal" 
              value={portal} 
            />
            <datalist id="uniquePortals"> 
              {uniquePortals.map((op) => (
                <option key={op}>{op}</option> ))}
            </datalist>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>Seller/Supplier <span style={{ color: 'red' }}>*</span></Form.Label>
          <Form.Select
              required
              onChange={(e) => handleSupplierChange(e, e.target.value.trim())}
              value={supplier ? supplier.supplierName : ''} 
            >
            <option value="">Select Supplier</option>
            {suppliersList.map((supplier) => (
              <option key={supplier.supplierId} value={supplier.supplierName}>
                {supplier.supplierName}
              </option>
            ))}
            
          </Form.Select>
          <Link to="/Supplier" target="_blank"><span style = {{float:"right", fontSize:"small", marginTop:"1%", marginRight:"1%"}}>+ add supplier</span></Link>
          <IoIosRefresh onClick={handleRefresh} className={isRotating ? 'refresh-icon rotating' : 'refresh-icon'}/>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        
      </Row>
      <Row className="mb-3">
        <Form.Group as={Col} md="4" controlId="validationCustom01">
          <Form.Label>Portal SKUcode <span style={{ color: 'red' }}>*</span></Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Portal SKUcode"
            defaultValue=""
            value={ portalSkuCode}
            onChange={(e) => setPortalSKU(e.target.value)}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="validationCustom02">
          <Form.Label>SKUcode <span style={{ color: 'red' }}>*</span></Form.Label>
          <Form.Select
              required
              onChange={(e) => setSkucode(e.target.value)}
              value={skucode} // Change 'supplier' to 'Supplier'
            >
            <option value="">Select skucode</option>
            {skucodeList.map((supplier) => (
              <option key={supplier.supplierId} value={supplier}>
                {supplier}
              </option>
            ))}
            
          </Form.Select>
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
          <h4>List View of ItemPortalMapping</h4>
        </AccordionSummary>
        <AccordionDetails>
        <div style={{ overflowX: 'auto' }}> 
        <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('portal')}>
                  </SwapVertIcon>
                  Portal
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by Portal"
                  value={searchTermPortal}
                  onChange={(e) => setSearchTermPortal(e.target.value)}
                /></span>
                </th>
                <th>
                <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('portalSkuCode')}>
                  </SwapVertIcon>
                  Portal SKUCode
                <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by PortalSKU"
                  value={searchTermPortalSKU}
                  onChange={(e) => setSearchTermPortalSKU(e.target.value)}
                /></span>
                </th>
                  <th>
                  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('supplier')}>
                  </SwapVertIcon>
                    Supplier
                  <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by Supplier"
                  value={searchTermSupplier}
                  onChange={(e) => setSearchTermSupplier(e.target.value)}
                /></span>
                  </th>
                  <th>
                  <SwapVertIcon style = {{cursor: 'pointer', marginRight: "2%"}}variant="link" onClick={() => requestSort('sellerSkuCode')}>
                  </SwapVertIcon>
                    SKUCode
                  <span style={{ margin: '0 10px' }}><input
                  type="text"
                  placeholder="Search by SKUCode"
                  value={searchTermSkucode}
                  onChange={(e) => setSearchTermSkucode(e.target.value)}
                /></span>
                  </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(ipm => (
                <tr key={ipm.id} onClick={() => handleRowClick(ipm)}>
                  <td style={{ width: '50px', textAlign: 'center' }}>
                      
                  <button
                    style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
                    className="delete-icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop propagation of the click event
                      handleDelete(ipm.id); // Call handleDelete function
                    }}
                  >
                    <DeleteIcon style={{ color: '#F00' }} />
                  </button>

                    </td>
                  <td>{ipm.portal ? ipm.portal : ''}</td>
                  <td>{ipm.portalSkuCode ? ipm.portalSkuCode : ''}</td>
                  <td>{ipm.supplier ? ipm.suppl