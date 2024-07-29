import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from 'react-bootstrap/Table';

const MyTable1 = ({selectedOrderData, handleDelete, handleDownload }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  return (
    <div>
    <Table striped bordered hover>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th>pick list number</th>
      <th>Date</th>
      <th>Portal Order No</th>
      <th>Portal</th>
      <th>Seller SKU</th>
      <th>Order Qty</th>
      <th>Pick Qty</th>
      <th>Bin Number</th>
      <th>Rack Number</th>
    </tr>
  </thead>
  <tbody>
    {selectedOrderData.map((picklist, index) => {
      // Find the number of rows for the current pickListNumber
      const rowsForPickListNumber = selectedOrderData.filter(
        p => p.pickListNumber === picklist.pickListNumber
      ).length;

      const deleteButtonCell = index === 0 ? (
        <td rowSpan={rowsForPickListNumber} style={{ width: '50px', textAlign: 'center' }}>
          <button
              style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', border: 'none', background: 'none' }}
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation(); // Stop propagation of the click event
                handleDelete(picklist.pickListId); // Call handleDelete function
              }}
            >
              <DeleteIcon style={{ color: '#F00' }} />
            </button>
        </td>
      ) : null;

      // If it's the first row for this pickListNumber, render the pickListNumber cell
      const pickListNumberCell = index === 0 ? (
        <td rowSpan={rowsForPickListNumber}>{picklist.pickListNumber}</td>
      ) : null;

      const downloadButtonCell = index === 0 ? (
        <td rowSpan={rowsForPickListNumber}>
          <button onClick={() => handleDownload(picklist.pickListNumber)}>Download</button>
        </td>
      ) : null;

      return (
        <tr key={`${picklist.pickListId}-${index}`}>
          
          {deleteButtonCell}
          {downloadButtonCell}
          {pickListNumberCell}
          <td>
            {(() => {
              const date = new Date(picklist.date);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}-${month}-${year}`;
            })()}
          </td>
          <td>{picklist.portalOrderNo}</td>
          <td>{picklist.portal}</td>
          <td>{picklist.sellerSKU}</td>
          <td>{picklist.qty}</td>
          <td>{picklist.pickQty}</td>
          <td>{picklist.binNumber || "N/A"}</td>
          <td>{picklist.rackNumber || "N/A"}</td>
        </tr>
      );
    })}
  </tbody>
</Table>

    </div>
  );
};

export default MyTable1;
