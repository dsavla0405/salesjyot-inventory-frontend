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
import axios from 'axios';
import Pagination from 'react-bootstrap/Pagination';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast, ToastContainer } from 'react-toastify';

const CreateCombo = () => {
  const [validated, setValidated] = useState(false);
  const [rowSelected, setRowSelected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [apiData, setApiData] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [comboName, setComboName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage1, setCurrentPage1] = useState(1);
  const [itemsPerPage1] = useState(10);
  const [skuSearch, setSkuSearch] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [boms, setBoms] = useState([]);
  const [bom, setBom] = useState('');
  const [selectedBom, setSelectedBom] = useState(null);
  const [qtyToMake, setQtyToMake] = useState(1);
  const [searchTermBomBomCode, setSearchTermBomBomCode] = useState('');
  const [searchTermItemSkucode, setSearchTermItemSkucode] = useState('');
  const [searchTermQuantity, setSearchTermQuantity] = useState('');
  const [searchTermQtyToMake, setSearchTermQtyToMake] = useState('');
  const [searchTermQuantityRequired, setSearchTermQuantityRequired] = useState('');
  const [searchTermSkucode, setSearchTermSkucode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPageOptions = [10, 20, 50]; // Customize the number of items per page
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const apiUrl = process.env.REACT_APP_API_URL;

  const totalPages1 = Math.ceil(items.length / itemsPerPage1);

  const currentItems1 = items.slice(
    (currentPage1 - 1) * itemsPerPage1,
    currentPage1 * itemsPerPage1
  );

  const handlePageChange1 = (pageNumber) => {
    setCurrentPage1(pageNumber);
  };

  useEffect(() => {
    setSelectedItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        quantityRequired: item.quantity * qtyToMake,
      }))
    );
  }, [qtyToMake]);
  

  useEffect(() => {
    axios.get(`${apiUrl}/item/supplier`)
      .then(response => setItems(response.data))
      .catch(error => console.error(error));

    axios.get(`${apiUrl}/boms`)
      .then(response => setBoms(response.data))
      .catch(error => console.error(error));

    axios.get(`${apiUrl}/api/combos`)
      .then(response => {setApiData(response.data)
        console.log(response.data);
  })
      .catch(error => console.error(error));
  }, [apiUrl]);

  const handleItemSelect = (item, isSelected) => {
    if (isSelected) {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    } else {
      setSelectedItems(selectedItems.filter(i => i.itemId !== item.itemId));
    }
  };

  const handleQuantityChange = (itemId, qty) => {
    const updatedItems = selectedItems.map(item =>
      item.itemId === itemId
        ? { ...item, quantity: qty, quantityRequired: qty * qtyToMake }
        : item
    );
    setSelectedItems(updatedItems);
  };

  const handleComboSave = (event) => {
    event.preventDefault();
    setValidated(true);

    const combo = {
      comboName: selectedItem,
      qtyToMake,
      comboItems: selectedItems.map(item => ({
        item,
        boms: selectedBom,
        quantity: item.quantity,
        quantityRequired: item.quantityRequired
      }))
    };

    axios.post(`${apiUrl}/api/combos`, combo)
      .then(response => {
        console.log(response.data);
        alert('Combo created successfully!');
        // Reset the form
      setComboName('');
      setSelectedItem(null);
      setSelectedItems([]);
      setQtyToMake(0);
      setBom('');
      setSelectedBom(null);
      setSkuSearch('');
      setDescriptionSearch('');
      setCurrentPage1(1); // Reset pagination if needed
      })
      .catch(error => {
        console.error(error);
        alert('Failed to create combo.');
      });
  };

  const handleComboNameChange = (e) => {
    const selectedSku = e.target.value;
    const selectedItem = items.find(item => item.skucode === selectedSku);
    setComboName(selectedSku);
    setSelectedItem(selectedItem);
  };

  const handleBomChange = (e) => {
    const selectedBomCode = e.target.value;
    const selectedBom = boms.find(bom => bom.bomCode === selectedBomCode);
    setBom(selectedBomCode);
    setSelectedBom(selectedBom);
  };

  // Filter items based on SKU and description
  const filteredItems = currentItems1.filter(item => {
    return (
      item.skucode.toLowerCase().includes(skuSearch.toLowerCase()) &&
      item.description.toLowerCase().includes(descriptionSearch.toLowerCase())
    );
  });

  // Remove duplicate BOM items based on itemId
  const uniqueBomItems = selectedBom ? Array.from(new Set(selectedBom.bomItems.map(item => item.itemId)))
    .map(id => selectedBom.bomItems.find(item => item.itemId === id)) : [];

  const otherItems = filteredItems.filter(item => !uniqueBomItems.some(bomItem => bomItem.itemId === item.itemId));


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

  const filteredData = apiData.filter(combo => {
    // Check if comboName.skucode exists and matches the search term
    const skucodeMatch = combo.comboName.skucode &&
                         combo.comboName.skucode.toLowerCase().includes(searchTermSkucode.toLowerCase());
  
    // Check if any combo item matches the search term for item.skucode, boms.bomCode, etc.
    const comboItemMatch = combo.comboItems.some(item => {
      const itemSkucodeMatch = item.item.skucode &&
                               item.item.skucode.toLowerCase().includes(searchTermItemSkucode.toLowerCase());
  
      const bomCodeMatch = item.boms.bomCode &&
                           item.boms.bomCode.toLowerCase().includes(searchTermBomBomCode.toLowerCase());
  
      const quantityMatch = item.quantity && 
                           item.quantity.toString().toLowerCase().includes(searchTermQuantity.toLowerCase());
  
      const quantityRequiredMatch = item.quantityRequired && 
                                   item.quantityRequired.toString().toLowerCase().includes(searchTermQuantityRequired.toLowerCase());
  
      return itemSkucodeMatch || bomCodeMatch || quantityMatch || quantityRequiredMatch;
    });
  
    // Check if qtyToMake matches the search term
    const qtyToMakeMatch = combo.qtyToMake && 
                           combo.qtyToMake.toString().toLowerCase().includes(searchTermQtyToMake.toLowerCase());
  
    // Return true only if all conditions are met
    return skucodeMatch && comboItemMatch && qtyToMakeMatch;
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

  const handleDelete = (id) => {
    axios.delete(`${apiUrl}/api/combos/${id}`)
      .then(() => {
        toast.success('Combo deleted successfully');
        setApiData(prevData => prevData.filter(location => location.comboId !== id));
      })
      .catch(error => toast.error(`Failed to delete Combo: ${error.message}`));
  };

  const handleRowClick = (location) => {
    setRowSelected(true);
    setSelectedItem(location);
  };

  return (
    <div>
            <ToastContainer position="top-right" />

      <div className="title">
        <h1>Create Combo</h1>
      </div>

      <Accordion defaultExpanded>
      <AccordionSummary className='acc-summary'
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3-content"
        id="panel3-header"
        sx={{ backgroundColor: '#E5E7E9' }} 
      >
        <h4>Create Combo Form</h4>
      </AccordionSummary>
        <AccordionDetails>
          <Form noValidate validated={validated} onSubmit={handleComboSave}>
            <Row className="align-items-center">
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Combo Name</Form.Label>
                <Form.Select required onChange={handleComboNameChange} value={comboName}>
                  <option value="">Select Item</option>
                  {items.map((sku) => (
                    <option key={sku.itemId} value={sku.skucode}>
                      {sku.skucode} - {sku.description}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>BOM</Form.Label>
                <Form.Select required onChange={handleBomChange} value={bom}>
                  <option value="">Select BOM</option>
                  {boms.map((bom) => (
                    <option key={bom.bomId} value={bom.bomCode}>
                      {bom.bomCode}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Quantity To Make</Form.Label>
                <Form.Control
                  required
                  type="number"
                  placeholder="Quantity To make"
                  value={qtyToMake}
                  onChange={(e) => setQtyToMake(e.target.value)}
                />
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
                    <th>Quantity</th>
                    <th>Quantity Required</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueBomItems.length > 0 && uniqueBomItems.map((item) => (
                    <tr key={item.itemId}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedItems.some(selectedItem => selectedItem.itemId === item.itemId)}
                          onChange={(e) => handleItemSelect(item, e.target.checked)}
                        />
                      </td>
                      <td>{item.skucode}</td>
                      <td>{item.description}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={selectedItems.find(selectedItem => selectedItem.itemId === item.itemId)?.quantity || ''}
                          onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                        />
                      </td>
                      <td>{selectedItems.find(selectedItem => selectedItem.itemId === item.itemId)?.quantityRequired || 0}</td>
                    </tr>
                  ))}
                  {otherItems.map((item) => (
                    <tr key={item.itemId}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedItems.some(selectedItem => selectedItem.itemId === item.itemId)}
                          onChange={(e) => handleItemSelect(item, e.target.checked)}
                        />
                      </td>
                      <td>{item.skucode}</td>
                      <td>{item.description}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={selectedItems.find(selectedItem => selectedItem.itemId === item.itemId)?.quantity || ''}
                          onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                        />
                      </td>
                      <td>{selectedItems.find(selectedItem => selectedItem.itemId === item.itemId)?.quantityRequired || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              <Pagination>
                <Pagination.First onClick={() => handlePageChange1(1)} disabled={currentPage1 === 1} />
                <Pagination.Prev onClick={() => handlePageChange1(currentPage1 - 1)} disabled={currentPage1 === 1} />
                {Array.from({ length: totalPages1 }, (_, index) => (
                  <Pagination.Item key={index + 1} active={index + 1 === currentPage1} onClick={() => handlePageChange1(index + 1)}>
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => handlePageChange1(currentPage1 + 1)} disabled={currentPage1 === totalPages1} />
                <Pagination.Last onClick={() => handlePageChange1(totalPages1)} disabled={currentPage1 === totalPages1} />
              </Pagination>
            </Row>

            <div className='buttons'>
            
              <Button id="submit" type="submit" onClick={handleComboSave}>Submit</Button>
           
            
            <span style={{margin: "auto"}}></span>
            
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
        <SwapVertIcon
          style={{ cursor: 'pointer', marginRight: "2%" }}
          onClick={() => requestSort('comboName')}
        />
        Combo Name
        <span style={{ margin: '0 10px' }}>
          <input
            type="text"
            placeholder="Search by combo name"
            value={searchTermSkucode}
            onChange={(e) => setSearchTermSkucode(e.target.value)}
          />
        </span>
      </th>
      <th>
        <SwapVertIcon
          style={{ cursor: 'pointer', marginRight: "2%" }}
          onClick={() => requestSort('qtyToMake')}
        />
        Qty To Make
        <span style={{ margin: '0 10px' }}>
          <input
            type="text"
            placeholder="Search by qty to make"
            value={searchTermQtyToMake}
            onChange={(e) => setSearchTermQtyToMake(e.target.value)}
          />
        </span>
      </th>
      <th>
        <SwapVertIcon
          style={{ cursor: 'pointer', marginRight: "2%" }}
          onClick={() => requestSort('bom')}
        />
        Bom
        <span style={{ margin: '0 10px' }}>
          <input
            type="text"
            placeholder="Search by bom"
            value={searchTermBomBomCode}
            onChange={(e) => setSearchTermBomBomCode(e.target.value)}
          />
        </span>
      </th>
      <th>
        <SwapVertIcon
          style={{ cursor: 'pointer', marginRight: "2%" }}
          onClick={() => requestSort('fromLocation')}
        />
        Item
        <span style={{ margin: '0 10px' }}>
          <input
            type="text"
            placeholder="Search by item"
            value={searchTermItemSkucode}
            onChange={(e) => setSearchTermItemSkucode(e.target.value)}
          />
        </span>
      </th>
      <th>
        <SwapVertIcon
          style={{ cursor: 'pointer', marginRight: "2%" }}
          onClick={() => requestSort('quantity')}
        />
        Quantity
        <span style={{ margin: '0 10px' }}>
          <input
            type="text"
            placeholder="Search by item"
            value={searchTermQuantity}
            onChange={(e) => setSearchTermQuantity(e.target.value)}
          />
        </span>
      </th>
      <th>
        <SwapVertIcon
          style={{ cursor: 'pointer', marginRight: "2%" }}
          onClick={() => requestSort('fromLocation')}
        />
        Qty Required
        <span style={{ margin: '0 10px' }}>
          <input
            type="text"
            placeholder="Search by qty required"
            value={searchTermQuantityRequired}
            onChange={(e) => setSearchTermQuantityRequired(e.target.value)}
          />
        </span>
      </th>
    </tr>
  </thead>
  <tbody>
    {currentItems.map((location) => (
      <>
        {location.comboItems.map((item, index) => (
          <tr key={index} onClick={() => handleRowClick(location)}>
            {index === 0 && (
              <>
                <td
                  rowSpan={location.comboItems.length}
                  style={{ width: '50px', textAlign: 'center' }}
                >
                  <button
                    style={{
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      height: '100%',
                      padding: '0',
                      border: 'none',
                      background: 'none'
                    }}
                    className="delete-icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop propagation of the click event
                      handleDelete(location.comboId); // Call handleDelete function
                    }}
                  >
                    <DeleteIcon style={{ color: '#F00' }} />
                  </button>
                </td>
                <td rowSpan={location.comboItems.length}>{location.comboName.skucode}</td>
                <td rowSpan={location.comboItems.length}>{location.qtyToMake}</td>
              </>
            )}
            <td>{item.boms.bomCode}</td>
            <td>{item.item.skucode}</td>
            <td>{item.quantity}</td>
            <td>{item.quantityRequired}</td>
          </tr>
        ))}
      </>
    ))}
  </tbody>
</Table>


          <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <Button
              variant="contained"
              tabIndex={-1}
              style={{ height: '33px', backgroundColor: '#5463FF', color: 'white', fontWeight: 'bolder' }}
              
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
};

export default CreateCombo;
