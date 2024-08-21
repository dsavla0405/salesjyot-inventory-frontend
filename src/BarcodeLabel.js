// import React, { useState, useRef } from 'react';
// import ReactToPrint from 'react-to-print';
// import Label from './Label'; // Adjust the path as needed

// const PrintLabel = () => {
//   const [skuCode, setSkuCode] = useState('');
//   const [MRP, setMRP] = useState('');
//   const [description, setDescription] = useState('');
//   const [quantity, setQuantity] = useState(1);
//   const [startRow, setStartRow] = useState(1);
//   const [submitted, setSubmitted] = useState(false);
//   const labelRef = useRef();

//   const handleInputChange = (e) => {
//     setSkuCode(e.target.value);
//   };

//   const handleMRPChange = (e) => {
//     setMRP(e.target.value);
//   }

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   }

//   const handleQuantityChange = (e) => {
//     setQuantity(parseInt(e.target.value, 10) || 0);
//   };

//   const handleStartRowChange = (e) => {
//     setStartRow(parseInt(e.target.value, 10) || 1);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setSubmitted(true);
//   };

//   const labelsPerRow = 4; // Number of labels per row
//   const rowsPerPage = 10; // Number of rows per page
//   const totalLabels = quantity;
//   const totalSlots = rowsPerPage * labelsPerRow;

//   // Create an array for labels with empty labels for skipped rows
//   const labels = [];

//   // Add empty slots for skipped rows
//   for (let i = 0; i < (startRow - 1) * labelsPerRow; i++) {
//     labels.push(<div key={`empty-${i}`} style={{ width: '52.5mm', height: '29.7mm', border: '1px solid transparent' }} />);
//   }

//   // Add labels
//   for (let i = 0; i < totalLabels; i++) {
//     labels.push(<Label key={`label-${i}`} skuCode={skuCode} MRP={MRP} description={description} />);
//   }

//   // Add remaining empty slots to fit the page size
//   while (labels.length < totalSlots) {
//     labels.push(<div key={`empty-${labels.length}`} style={{ width: '52.5mm', height: '29.7mm', border: '1px solid transparent' }} />);
//   }

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <label>
//           Enter SKU Code:
//           <input type="text" value={skuCode} onChange={handleInputChange} required />
//         </label>
//         <label>
//           MRP:
//           <input type="text" value={MRP} onChange={handleMRPChange} required />
//         </label>
//         <label>
//           Description:
//           <input type="text" value={description} onChange={handleDescriptionChange} required />
//         </label>
//         <label>
//           Quantity:
//           <input type="number" value={quantity} onChange={handleQuantityChange} min="1" required />
//         </label>
//         <label>
//           Start Row:
//           <input type="number" value={startRow} onChange={handleStartRowChange} min="1" required />
//         </label>
//         <button type="submit">Generate Label</button>
//       </form>

//       {submitted && (
//         <div>
//           <div
//             ref={labelRef}
//             style={{
//               width: '210mm', // A4 width
//               height: '297mm', // A4 height
//               display: 'grid',
//               gridTemplateColumns: `repeat(${labelsPerRow}, 52.5mm)`,
//               gridTemplateRows: `repeat(${rowsPerPage}, 29.7mm)`,
              
//               margin: '0',
//               padding: '0',
//             }}
//           >
//             {labels}
//           </div>

//           <ReactToPrint
//             trigger={() => <button>Print Label</button>}
//             content={() => labelRef.current}
//             pageStyle={`@media print { @page { size: A4; margin: 0; } }`} // Ensure it fits A4 size
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default PrintLabel;


import React, { useState, useRef, useEffect } from 'react';
import ReactToPrint from 'react-to-print';
import Label from './Label'; // Adjust the path as needed
import axios from 'axios';

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
  const labelRef = useRef();

  // Fetch items from API
  useEffect(() => {
    axios.get(`${apiUrl}/item/supplier`)  // Replace with your API endpoint
      .then(response => {
        console.log(response.data);
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

  for (let i = 0; i < (startRow - 1) * labelsPerRow; i++) {
    labels.push(<div key={`empty-${i}`} style={{ width: '52.5mm', height: '29.7mm' }} />);
  }

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

  while (labels.length < totalSlots) {
    labels.push(<div key={`empty-${labels.length}`} style={{ width: '52.5mm', height: '29.7mm' }} />);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px' }}>
      <form style={{ flex: 1, maxWidth: '300px' }}>
        <h2>Label Details</h2>
        <label>
          Enter SKU Code:
          <input
            type="text"
            value={skuCode}
            onChange={handleInputChange}
            required
          />
          {filteredItems.length > 0 && (
            <ul style={{ listStyleType: 'none', padding: '0', margin: '0', border: '1px solid #ccc' }}>
              {filteredItems.map(item => (
                <li
                  key={item.skucode}
                  style={{ padding: '5px', cursor: 'pointer' }}
                  onClick={() => handleSelectSkuCode(item)}
                >
                  {item.skucode}
                </li>
              ))}
            </ul>
          )}
        </label>
        <label>
          MRP:
          <input type="text" value={MRP} onChange={handleMRPChange} required />
        </label>
        <label>
          Description:
          <input type="text" value={description} onChange={handleDescriptionChange} required />
        </label>
        <label>
          Quantity:
          <input type="number" value={quantity} onChange={handleQuantityChange} min="1" required />
        </label>
        <label>
          Start Row:
          <input type="number" value={startRow} onChange={handleStartRowChange} min="1" max="10" required />
        </label>
        <div>
          <button type="button" onClick={handleAddItem}>Add Item</button>
        </div>
      </form>

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
          trigger={() => <button>Print Label</button>}
          content={() => labelRef.current}
          pageStyle="@media print { @page { size: A4; margin: 0; } body { margin: 0; } }"
        />
      </div>
    </div>
  );
};

export default PrintLabel;
