import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import QrBarCodeScanner from 'react-qr-barcode-scanner'; // Import the new barcode scanner
import './Item.css';
import BarcodeScanner from './BarcodeScanner.js';

function PickListScan() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [picklist, setPicklist] = useState([]);
    const [selectedPicklist, setSelectedPicklist] = useState(''); // State to hold selected picklist
    const [items, setItems] = useState([]); // State to hold items for the selected picklist
    const [scannedCode, setScannedCode] = useState(''); // State to hold scanned barcode
    const [scannerVisible, setScannerVisible] = useState(false); // State to toggle scanner visibility

    useEffect(() => {
        // Fetch the picklists when the component mounts
        const fetchPicklists = async () => {
            try {
                const response = await axios.get(`${apiUrl}/picklists`); // Adjust endpoint if needed
                setPicklist(response.data); // Store the fetched data in the state
            } catch (error) {
                console.error('Error fetching picklists:', error);
            }
        };

        fetchPicklists();
    }, [apiUrl]);

    // Handle change event for the dropdown
    const handlePicklistChange = async (event) => {
        const picklistNumber = event.target.value;
        setSelectedPicklist(picklistNumber);

        if (picklistNumber) {
            try {
                const response = await axios.get(`${apiUrl}/picklistdata/picklistdata`, {
                    params: { pickListNumber: picklistNumber }
                });
                console.log("data = " + response.data);
                setItems(response.data); // Store items for the selected picklist
            } catch (error) {
                console.error('Error fetching items for picklist:', error);
            }
        } else {
            setItems([]); // Clear items if no picklist is selected
        }
    };

    // Handle barcode scan
    const handleScan = (data) => {
        setScannedCode(data);
        // You can add further logic to handle the scanned code
        console.log('Scanned Code:', data);
    };

    // Handle scan error
    const handleError = (error) => {
        console.error('Barcode scan error:', error);
    };

    const handleBarCodeDetected = (code) => {
        console.log('Barcode detected:', code);
        setScannedCode(code);
    };

    return (
        <div className="picklist-scan-container">
            <div className="picklist-section">
                <h1>PickList Scan</h1>
                <label htmlFor="picklist-dropdown">Select Picklist Number:</label>
                <select
                    id="picklist-dropdown"
                    value={selectedPicklist}
                    onChange={handlePicklistChange}
                >
                    <option value="">Select a picklist</option>
                    {picklist.map((item) => (
                        <option key={item.pickListId} value={item.pickListNumber}>
                            {item.pickListNumber}
                        </option>
                    ))}
                </select>

                {selectedPicklist && (
                    <div>
                        <h2>Items for Picklist Number {selectedPicklist}</h2>
                        <ul>
                            {items.map((item) => (
                                <li key={item.itemId}>
                                    SKU Code: {item.item.skucode} - Quantity: {item.pickQty}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="barcode-section">
            <div className="scanner">
                        <h3>Barcode Scanner</h3>
                        <BarcodeScanner onDetected={handleBarCodeDetected} />
                        {scannedCode && <p>Detected Barcode: {scannedCode}</p>}
                    </div>
            </div>
        </div>
    );
}

export default PickListScan;
