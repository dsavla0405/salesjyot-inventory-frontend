import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from 'react-bootstrap/Table';

const MyTable = ({selectedOrderData, generatePicklist, generatePicklistPDF}) => {
  const groupedData = React.useMemo(() => {
    // Group picklistData by pickListNumber
    return selectedOrderData.reduce((acc, picklist) => {
      console.log("selected orders = " + JSON.stringify(selectedOrderData));
      const existingGroup = acc.find(group => group.sellerSKU === picklist.sellerSKU);
      if (existingGroup) {
        existingGroup.qty += picklist.qty; 
        existingGroup.pickQty += picklist.pickQty; // Accumulate pickQty
      } else {
        acc.push({ ...picklist });
      }
      return acc;
    }, []);
  }, [selectedOrderData]);
  const apiUrl = process.env.REACT_APP_API_URL;
  return (
    <div>
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>SKUCode</th>
          <th>Seller SKU</th>
          <th>Order Qty</th>
          <th>Pick Qty</th>
          <th>Bin Number</th>
          <th>Rack Number</th>
          <th>Image</th>
        </tr>
      </thead>
      <tbody>
        {groupedData.map((picklist, index) => (
          <tr key={index}>       
            <td>{picklist.skucode}</td>     
            <td>{picklist.sellerSKU}</td>
            <td>{picklist.qty}</td>
            <td>{picklist.pickQty}</td>  {/* Display accumulated pickQty */}
            <td>{picklist.binNumber || "N/A"}</td>
            <td>{picklist.rackNumber || "N/A"}</td>
            <td>{picklist.img && <img style = {{height: "150px", width : "150px"}} src = {picklist.img} alt='item image'/>}</td>
          </tr>
        ))}
      </tbody>
    </Table>
    <button className = "generateButton" onClick={generatePicklist}>Generate picklist</button>
    <button className="generateButton" onClick={generatePicklistPDF}>Download PickList</button>
    </div>
  );
};

export default MyTable;