import React from 'react'
import { useState } from 'react';
import "./Item.css"
function Dispatch() {
    const initialList = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  // State to manage checked items
  const [checkedItems, setCheckedItems] = useState(initialList);

  // Handle checkbox change
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      // Add to checked items
      setCheckedItems([...checkedItems, value]);
    } else {
      // Remove from checked items
      setCheckedItems(checkedItems.filter(item => item !== value));
    }
  };
  return (
      <div className='item'>
          <h1>Dispatch Items</h1>
          {initialList.map(item => (
        <div key={item}>
          <label>
            <input
              type="checkbox"
              value={item}
              checked={checkedItems.includes(item)}
              onChange={handleCheckboxChange}
            />
            {item}
          </label>
        </div>
      ))}
    </div>
  )
}

export default Dispatch