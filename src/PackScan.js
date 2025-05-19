import React, { useState, useEffect } from "react";
import BarcodeScanner from "./BarcodeScanner.js";
import QRScanner from "./QRScanner.js";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import successSound from "./store-scanner-beep-90395.mp3";
import "./Scan.css"; // Import your custom CSS file
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

const PackScan = () => {
  const user = useSelector((state) => state.user); // Access user data from Redux store

  const apiUrl = process.env.REACT_APP_API_URL;
  const [barcode, setBarcode] = useState("");
  const [qrCode, setQRCode] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortedOrders, setSortedOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({
    date: "",
    orderNo: "",
    portal: "",
    portalOrderNo: "",
    portalOrderLineId: "",
    portalSku: "",
    sellerSku: "",
    productDescription: "",
    qty: "",
    shipByDate: "",
    dispatched: "",
    courier: "",
    cancel: "",
    awbNo: "",
    orderStatus: "",
  });

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString().toLowerCase() : "";
  };

  const successAudio = new Audio(successSound);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to fetch orders from the backend
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/orders/notPacked`, {
        params: { email: user.email },
        withCredentials: true,
      });
      setOrders(response.data); // Assuming response.data is an array of orders
      console.log("orders = " + orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
  };

  // Function to call the API with the scanned code
  const callApiWithCode = async (code) => {
    console.log("Calling API with code:", code);
    try {
      const response = await axios.put(
        `${apiUrl}/orders/scan/pack?awb=${code}`,
        { withCredentials: true }
      );
      console.log("API Response:", response.data);
      toast.success("Scan successful, order status changed", {
        autoClose: 2000,
      });
      successAudio.play();
      fetchOrders(); // Refresh the list of orders after scanning
    } catch (error) {
      console.error("Error:", error);
      toast.error("Scan failed: " + error.message);
    }
  };

  const handleBarCodeDetected = (code) => {
    console.log("Barcode detected:", code);
    setBarcode(code);
    callApiWithCode(code);
  };

  const handleQRCodeDetected = (data) => {
    console.log("QR code detected:", data);
    setQRCode(data);
    callApiWithCode(data);
  };

  // Toggle selection of an order
  const toggleOrderSelection = (orderId) => {
    const isSelected = selectedOrders.includes(orderId);
    if (isSelected) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Save selected orders
  const saveSelectedOrders = async () => {
    try {
      // Iterate through selectedOrders array
      for (const orderId of selectedOrders) {
        const order = orders.find((o) => o.orderId === orderId); // Find the order details
        const response = await axios.put(
          `${apiUrl}/orders/packByAwbNo`, //?orderNo=${order.orderNo}&email=${user.email}
          {},
          {
            params: { orderNo: order.orderNo, email: user.email },
            withCredentials: true,
          }
        );
        console.log(
          `Packed order with AWB No. ${order.orderNo}:`,
          response.data
        );
      }

      toast.success("Selected orders packed successfully");
      fetchOrders(); // Refresh the list of orders after saving
    } catch (error) {
      console.error("Error packing orders:", error);
      toast.error("Failed to pack orders");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const sortArray = (array, key, direction) => {
    if (!key) return array;
    return [...array].sort((a, b) => {
      const aValue = key.split(".").reduce((obj, i) => (obj ? obj[i] : ""), a);
      const bValue = key.split(".").reduce((obj, i) => (obj ? obj[i] : ""), b);
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filterArray = (array, filters) => {
    return array.filter((order) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true;
        const value = key
          .split(".")
          .reduce((obj, i) => (obj ? obj[i] : ""), order);
        return value
          .toString()
          .toLowerCase()
          .includes(filters[key].toLowerCase());
      });
    });
  };

  useEffect(() => {
    setSortedOrders(
      filterArray(
        sortArray(orders, sortConfig.key, sortConfig.direction),
        filters
      )
    );
  }, [orders, sortConfig, filters]);

  return (
    <div className="pack-scan-container">
      <ToastContainer position="top-right" />
      <div className="title">
        <h1>Scan Packed Orders</h1>
      </div>
      <div className="content-container">
        <div className="scanners">
          <div className="scanner">
            <h3>Barcode Scanner</h3>
            <BarcodeScanner onDetected={handleBarCodeDetected} />
            {barcode && <p>Detected Barcode: {barcode}</p>}
          </div>
          <div className="scanner">
            <h3>QR Code Scanner</h3>
            <QRScanner
              style={{ width: "100px" }}
              onScan={handleQRCodeDetected}
            />
            {qrCode && <p>Detected QR Code: {qrCode}</p>}
          </div>
        </div>
        <div className="orders-list">
          <h3>Orders to Pack</h3>
          <div style={{ overflowX: "auto" }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th></th>
                  <th onClick={() => handleSort("date")}>
                    Date <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("orderNo")}>
                    Order No <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("itemPortalMapping.portal")}>
                    Portal <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("portalOrderNo")}>
                    Portal Order No <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("portalOrderLineId")}>
                    Portal Order Line Id <SwapVertIcon />
                  </th>
                  <th
                    onClick={() =>
                      handleSort("itemPortalMapping.portalSkuCode")
                    }
                  >
                    Portal SKU <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("items[0].sellerSKUCode")}>
                    Seller SKU <SwapVertIcon />
                  </th>
                  <th
                    onClick={() =>
                      handleSort("itemPortalMapping.item.description")
                    }
                  >
                    Product Description <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("qty")}>
                    Quantity <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("shipByDate")}>
                    Ship by Date <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("dispatched")}>
                    Dispatched <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("courier")}>
                    Courier <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("cancel")}>
                    Order Cancel <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("awbNo")}>
                    AWB No <SwapVertIcon />
                  </th>
                  <th onClick={() => handleSort("orderStatus")}>
                    Order Status <SwapVertIcon />
                  </th>
                </tr>
                <tr>
                  <th></th>
                  {Object.keys(filters).map((key) => (
                    <th key={key}>
                      <input
                        type="text"
                        value={filters[key]}
                        onChange={(e) =>
                          handleFilterChange(key, e.target.value)
                        }
                        placeholder={`Search ${key}`}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.orderId)}
                        onChange={() => toggleOrderSelection(order.orderId)}
                      />
                    </td>
                    <td>{formatDate(order.date)}</td>
                    <td>{order.orderNo ?? ""}</td>
                    <td>{order.itemPortalMapping?.portal ?? ""}</td>
                    <td>{order.portalOrderNo ?? ""}</td>
                    <td>{order.portalOrderLineId ?? ""}</td>
                    <td>{order.itemPortalMapping?.portalSkuCode ?? ""}</td>
                    <td>{order.items[0]?.sellerSKUCode ?? ""}</td>
                    <td>{order.itemPortalMapping?.item?.description ?? ""}</td>
                    <td>{order.qty ?? ""}</td>
                    <td>{formatDate(order.shipByDate)}</td>
                    <td>{order.dispatched ?? ""}</td>
                    <td>{order.courier ?? ""}</td>
                    <td>{order.cancel ?? ""}</td>
                    <td>{order.awbNo ?? ""}</td>
                    <td>{order.orderStatus ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <button onClick={saveSelectedOrders}>Pack Selected Orders</button>
        </div>
      </div>
    </div>
  );
};

export default PackScan;
