import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import BarcodeScanner from './BarcodeScanner.js';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for Toastify
import './Item.css';

function PickListScan() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [picklist, setPicklist] = useState([]);
    const [selectedPicklist, setSelectedPicklist] = useState('');
    const [items, setItems] = useState([]);
    const [scannedCode, setScannedCode] = useState('');

    useEffect(() => {
        const fetchPicklists = async () => {
            try {
                const response = await axios.get(`${apiUrl}/picklists`);
                setPicklist(response.data);
            } catch (error) {
                console.error('Error fetching picklists:', error);
                toast.error('Error fetching picklists.');
            }
        };

        fetchPicklists();
    }, [apiUrl]);

    const handlePicklistChange = async (event) => {
        const picklistNumber = event.target.value;
        setSelectedPicklist(picklistNumber);

        if (picklistNumber) {
            try {
                const response = await axios.get(`${apiUrl}/picklistdata/picklistdata`, {
                    params: { pickListNumber: picklistNumber }
                });

                const groupedItems = response.data.reduce((acc, item) => {
                    const sku = item.item.skucode;
                    if (!acc[sku]) {
                        acc[sku] = { skucode: sku, totalQty: 0 };
                    }
                    acc[sku].totalQty += item.pickQty;
                    return acc;
                }, {});

                setItems(Object.values(groupedItems));
            } catch (error) {
                console.error('Error fetching items for picklist:', error);
                toast.error('Error fetching items for picklist.');
            }
        } else {
            setItems([]);
        }
    };

    const debouncedHandleBarCodeDetected = useCallback(debounce(async (code) => {
        console.log('Barcode detected:', code);
        setScannedCode(code);

        if (selectedPicklist) {
            try {
                const response = await axios.get(`${apiUrl}/picklists/validate`, {
                    params: {
                        picklistNumber: selectedPicklist,
                        sku: code,
                        scannedQty: 1
                    }
                });
                console.log(response.data);
                if (response.data == true) {
                    toast.success('Scanned item is valid and quantity is correct.');
                    setItems(prevItems =>
                        prevItems.map(item =>
                            item.skucode === code && item.totalQty > 0
                                ? { ...item, totalQty: item.totalQty - 1 }
                                : item
                        )
                    );
                } else {
                    toast.error('Invalid scan or quantity exceeds allowed pick quantity.');
                }
            } catch (error) {
                console.error('Error validating scanned item:', error);
                toast.error('Error validating scanned item.');
            }
        } else {
            toast.error('Please select a picklist first.');
        }
    }, 300), [selectedPicklist, apiUrl]);

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
                            {items.map((item, index) => (
                                <li key={index}>
                                    SKU Code: {item.skucode} - Total Quantity: {item.totalQty}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="barcode-section">
                <div className="scanner">
                    <h3>Barcode Scanner</h3>
                    <BarcodeScanner onDetected={debouncedHandleBarCodeDetected} />
                    {scannedCode && <p>Detected Barcode: {scannedCode}</p>}
                </div>
            </div>

            <ToastContainer /> {/* Add ToastContainer to render toasts */}
        </div>
    );
}

export default PickListScan;
