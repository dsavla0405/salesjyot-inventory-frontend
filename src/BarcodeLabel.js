import React, { useState, useRef, useEffect } from 'react';
import ReactToPrint from 'react-to-print';
import Label from './Label'; // Adjust the path as needed
import axios from 'axios';
import { Form, Row, Col, Button, Table, InputGroup, FormControl } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const PrintLabel = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [skuCode, setSkuCode] = useState('');
  const [MRP, setMRP] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [startRow, setStartRow] = useState(1);
  const [startColumn, setStartColumn] = useState(1);
  const [validated, setValidated] = useState(false);
  const labelRef = useRef();

  // Fetch items from API
  useEffect(() => {
    axios.get(`${apiUrl}/item/supplier`)  // Replace with your API endpoint
      .then(response => {
        setAllItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });
  }, []);

  // Handle SKU code input change and filter suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSkuCode(value);
    const filtered = allItems.filter(item => item.skucode.toLowerCase().includes(value.toLowerCase()));
    setFilteredItems(filtered);
  };

  // Handle SKU code selection
  const handleSelectSkuCode = (item) => {
    setSkuCode(item.skucode);
    setMRP(item.mrp);
    setDescription(item.description);
    setFilteredItems([]);
  };

  const handleMRPChange = (e) => setMRP(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleQuantityChange = (e) => setQuantity(parseInt(e.target.value, 10) || 0);
  const handleStartRowChange = (e) => setStartRow(parseInt(e.target.value, 10) || 1);
  const handleStartColumnChange = (e) => setStartColumn(parseInt(e.target.value, 10) || 1);

  const handleAddItem = () => {
    const newItem = { skuCode, MRP, description, quantity };
    setItems([...items, newItem]);
    setSkuCode('');
    setMRP('');
    setDescription('');
    setQuantity(1);
  };

  const labelsPerRow = 4; 
  const rowsPerPage = 10; 
  const totalSlots = rowsPerPage * labelsPerRow;

  const labels = [];

  // Calculate the total number of empty slots before starting the labels
  const emptySlots = (startRow - 1) * labelsPerRow + (startColumn - 1);

  // Add empty slots for the starting position
  for (let i = 0; i < emptySlots; i++) {
    labels.push(<div key={`empty-${i}`} style={{ width: '52.5mm', height: '29.7mm' }} />);
  }

  // Add the actual labels
  items.forEach((item, itemIndex) => {
    for (let i = 0; i < item.quantity; i++) {
      labels.push(
        <Label
          key={`label-${itemIndex}-${i}`}
          skuCode={item.skuCode}
          MRP={item.MRP}
          description={item.description}
        />
      );
    }
  });

  // Fill remaining slots with empty labels to complete the page layout
  while (labels.length < totalSlots) {
    labels.push(<div key={`empty-${labels.length}`} style={{ width: '52.5mm', height: '29.7mm' }} />);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      handleAddItem();
    }
    setValidated(true);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px' }}>
      <Form noValidate validated={validated} onSubmit={handleSubmit} style={{ flex: 1, maxWidth: '300px' }}>
        <h2>Label Details</h2>
        <Form.Group as={Row} controlId="formSkuCode">
          <Form.Label column sm="4">SKU Code</Form.Label>
          <Col sm="8">
            <Form.Control
              required
              type="text"
              placeholder="Enter SKU Code"
              value={skuCode}
              onChange={handleInputChange}
            />
            {filteredItems.length > 0 && (
              <ul className="list-group">
                {filteredItems.map(item => (
                  <li
                    key={item.skucode}
                    className="list-group-item list-group-item-action"
                    onClick={() => handleSelectSkuCode(item)}
                  >
                    {item.skucode}
                  </li>
                ))}
              </ul>
            )}
            <Form.Control.Feedback type="invalid">Please provide a valid SKU Code.</Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formMRP">
          <Form.Label column sm="4">MRP</Form.Label>
          <Col sm="8">
            <Form.Control
              required
              type="text"
              placeholder="Enter MRP"
              value={MRP}
              onChange={handleMRPChange}
            />
            <Form.Control.Feedback type="invalid">Please provide MRP.</Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formDescription">
          <Form.Label column sm="4">Description</Form.Label>
          <Col sm="8">
            <Form.Control
              required
              type="text"
              placeholder="Enter Description"
              value={description}
              onChange={handleDescriptionChange}
            />
            <Form.Control.Feedback type="invalid">Please provide a description.</Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formQuantity">
          <Form.Label column sm="4">Quantity</Form.Label>
          <Col sm="8">
            <Form.Control
              required
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
            />
            <Form.Control.Feedback type="invalid">Quantity must be at least 1.</Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formStartRow">
          <Form.Label column sm="4">Start Row</Form.Label>
          <Col sm="8">
            <Form.Control
              required
              type="number"
              min="1"
              max="10"
              value={startRow}
              onChange={handleStartRowChange}
            />
            <Form.Control.Feedback type="invalid">Start Row should be between 1 and 10.</Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formStartColumn">
          <Form.Label column sm="4">Start Column</Form.Label>
          <Col sm="8">
            <Form.Control
              required
              type="number"
              min="1"
              max="4"
              value={startColumn}
              onChange={handleStartColumnChange}
            />
            <Form.Control.Feedback type="invalid">Start Column should be between 1 and 4.</Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Button type="submit" variant="primary">Add Item</Button>
      </Form>

      <div style={{ flex: 2, border: '1px solid #ccc', padding: '10px' }}>
        <h2>Label Preview</h2>
        <div
          ref={labelRef}
          style={{
            width: '210mm',
            height: '297mm',
            display: 'grid',
            gridTemplateColumns: `repeat(${labelsPerRow}, 52.5mm)`,
            gridTemplateRows: `repeat(${rowsPerPage}, 29.7mm)`,
            margin: '0',
            padding: '0',
          }}
        >
          {labels}
        </div>
        <ReactToPrint
          trigger={() => <Button variant="primary">Print Label</Button>}
          content={() => labelRef.current}
          pageStyle="@media print { @page { size: A4; margin: 0; } body { margin: 0; } }"
        />
      </div>
    </div>
  );
};

export default PrintLabel;
