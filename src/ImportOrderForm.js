import { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Item.css";
import { Table } from "react-bootstrap";

import * as XLSX from "xlsx";
import axios from "axios";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "react-bootstrap/Pagination";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { saveAs } from "file-saver";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useSelector } from "react-redux";

function ImportOrderForm() {
  const user = useSelector((state) => state.user); // Access user data from Redux store

  const apiUrl = process.env.REACT_APP_API_URL;
  const fileInputRef = useRef();
  const [excelData, setExcelData] = useState([]);
  const [validated, setValidated] = useState(false);
  const [date, setDate] = useState("");
  const [orderNo, setOrderno] = useState("");
  const [portalOrderNo, setPortalOrderno] = useState("");
  const [portalOrderLineId, setPortalOrderLineid] = useState("");
  const [portalSKU, setPortalSKU] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [shipByDate, setShipbyDate] = useState("");
  const [dispatched, setDispatched] = useState("");
  const [courier, setCourier] = useState("");
  const [portal, setPortal] = useState("");
  const [skucode, setSkucode] = useState("");
  const [cancel, setCancel] = useState("");
  const [qty, setQuantity] = useState("");
  const [apiData, setApiData] = useState([]);
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [portalSKUList, setPortalSKUList] = useState([]);
  const [skucodeList, setSkucodeList] = useState([]);
  const [itemDescriptionList, setItemDescriptionList] = useState([]);
  const [portalNameList, setPortalNameList] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [awbNo, setAwbNo] = useState("");
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null); // Selected location

  const [searchTermAwbNo, setSearchTermAwbNo] = useState("");
  const [searchTermOrderStatus, setSearchTermOrderStatus] = useState("");
  const [searchTermDate, setSearchTermDate] = useState("");
  const [searchTermCancel, setSearchTermCancel] = useState("");
  const [searchTermOrderNo, setSearchTermOrderNo] = useState("");
  const [searchTermPortalOrderNo, setSearchTermPortalOrderNo] = useState("");
  const [searchTermPortalLineId, setSearchTermPortalLineId] = useState("");
  const [searchTermQuantity, setSearchTermQuantity] = useState("");
  const [searchTermCourier, setSearchTermCourier] = useState("");
  const [searchTermDispatched, setSearchTermDispatched] = useState("");
  const [searchTermSkucode, setSearchTermSkucode] = useState("");
  const [searchTermPortalSKU, setSearchTermPortalSKU] = useState("");
  const [searchTermShibByDate, setSearchTermShibByDate] = useState("");
  const [searchTermProductDescription, setSearchTermProductDescription] =
    useState("");
  const [searchTermPortal, setSearchTermPortal] = useState("");
  const [selectedPortal, setSelectedPortal] = useState(""); // State variable for selected portal
  const [filteredPortalSKUList, setFilteredPortalSKUList] = useState([]); // State variable for filtered portal SKU list
  const [filteredSkucodeList, setFilteredSkucodeList] = useState([]); // State variable for filtered seller SKU list
  const [filteredItemDescriptionList, setFilteredItemDescriptionList] =
    useState([]); // State variable for filtered item description list
  const [portalMapping, setPortalMapping] = useState([]); // State variable to store portal mapping data
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const rowsPerPageOptions = [10, 20, 50];
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [searchTermLocation, setSearchTermLocation] = useState("");

  const [productRows, setProductRows] = useState([
    { portalSKU: "", skuCode: "", productDescription: "", quantity: "" },
  ]);

  const [filteredOptions, setFilteredOptions] = useState([]);

  const [showTable, setShowTable] = useState(false);

  const handleAddRow = () => {
    setShowTable(true);
    setProductRows([
      ...productRows,
      {
        portalSKU: "",
        productDescription: "",
        skuCode: "",
        quantity: "",
      },
    ]);
  };

  const handlePortalSKUChange = (value, index) => {
    const updatedRows = [...productRows];
    const selectedData = filteredOptions.find(
      (item) => item.portalSkuCode === value
    );

    updatedRows[index].portalSKU = value;
    updatedRows[index].skuCode = selectedData ? selectedData.skucode : "";
    updatedRows[index].productDescription = selectedData
      ? selectedData.item.description
      : "";

    setProductRows(updatedRows);
  };

  const handleSkuCodeChange = (value, index) => {
    const updatedRows = [...productRows];
    updatedRows[index].skuCode = value;
    setProductRows(updatedRows);
  };

  const handleProductDescriptionChange = (value, index) => {
    const updatedRows = [...productRows];
    updatedRows[index].productDescription = value;
    setProductRows(updatedRows);
  };

  const handleQuantityChange = (value, index) => {
    const updatedRows = [...productRows];
    updatedRows[index].quantity = value;
    setProductRows(updatedRows);
  };

  const handleRemoveRow = (index) => {
    const updatedRows = [...productRows];
    updatedRows.splice(index, 1);
    setProductRows(updatedRows);
  };
  const uniquePortalSKUs = [
    ...new Set(filteredOptions.map((item) => item.portalSkuCode)),
  ];

  useEffect(() => {
    setProductRows([
      {
        portalSKU: "",
        productDescription: "",
        skuCode: "",
        quantity: "",
      },
    ]);
  }, [selectedPortal]);

  useEffect(() => {
    if (!portalMapping || portalMapping.length === 0 || !selectedPortal) return;

    const filtered = portalMapping.filter(
      (item) => item.portal === selectedPortal
    );
    setFilteredOptions(filtered);
  }, [portalMapping, selectedPortal]);

  // Function to handle change in items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // JSX for the dropdown menu to select rows per page
  const rowsPerPageDropdown = (
    <Form.Group controlId="itemsPerPageSelect">
      <Form.Select
        style={{ marginLeft: "5px", width: "70px" }}
        value={itemsPerPage}
        onChange={handleItemsPerPageChange}
      >
        {rowsPerPageOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
  const formatDateOrderNo = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}${day}${year}`;
  };

  const updateOrderNumber = () => {
    // const lastSerialNumber =
    //   parseInt(localStorage.getItem("lastSerialNumber")) || 0;
    // const formattedDate = formatDateOrderNo(new Date());
    // const paddedSerialNumber = String(lastSerialNumber + 1).padStart(4, "0");
    // const newOrderNumber = `${formattedDate}-${paddedSerialNumber}`;

    axios
      .get(`${apiUrl}/orders/setNewOrderNo`, {
        params: { email: user.email },
        withCredentials: true,
      })
      .then((response) => {
        const newOrderNumber = response.data;
        console.log("newOrderNumber:::", response.data);
        setOrderno(newOrderNumber);
      });
  };

  // useEffect(() => {
  //   if (Object.keys(portalMapping).length === 0) return;

  //   const filteredPortalSKUs = portalMapping
  //     .filter((item) => item.portal === selectedPortal)
  //     .map((item) => item.portalSkuCode);
  //   setFilteredPortalSKUList(filteredPortalSKUs);

  //   // Filter seller SKU list based on selected portal SKU
  //   const filteredSkucode = portalMapping
  //     .filter(
  //       (item) =>
  //         item.portal === selectedPortal && item.portalSkuCode === portalSKU
  //     )
  //     .map((item) => item.skucode);
  //   setFilteredSkucodeList(filteredSkucode);

  //   // Filter item description list based on selected portal SKU
  //   const filteredItemDescriptions = portalMapping
  //     .filter(
  //       (item) =>
  //         item.portal === selectedPortal && item.portalSkuCode === portalSKU
  //     )
  //     .map((item) => item.item.description);
  //   setFilteredItemDescriptionList(filteredItemDescriptions);
  // }, [selectedPortal, portalSKU, portalMapping]); // Include portalMapping in the dependencies array

  // useEffect(() => {
  //   if (Object.keys(portalMapping).length === 0) return;

  //   // Dynamically update dropdowns per row
  //   const updatedRows = productRows.map((row) => {
  //     const availablePortalSKUs = portalMapping
  //       .filter((item) => item.portal === selectedPortal)
  //       .map((item) => item.portalSkuCode);

  //     const availableSkuCodes = portalMapping
  //       .filter(
  //         (item) =>
  //           item.portal === selectedPortal &&
  //           item.portalSkuCode === row.portalSKU
  //       )
  //       .map((item) => item.skucode);

  //     const availableDescriptions = portalMapping
  //       .filter(
  //         (item) =>
  //           item.portal === selectedPortal &&
  //           item.portalSkuCode === row.portalSKU
  //       )
  //       .map((item) => item.item.description);

  //     return {
  //       ...row,
  //       availablePortalSKUs,
  //       availableSkuCodes,
  //       availableDescriptions,
  //     };
  //   });

  //   setProductRows(updatedRows);
  // }, [selectedPortal, productRows.length, portalMapping]);

  // Your JSX component rendering goes here

  useEffect(() => {
    const currentDate = new Date(); // Get current date
    const year = currentDate.getFullYear(); // Get current year
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Get current month and pad with leading zero if needed
    const day = String(currentDate.getDate() + 1).padStart(2, "0"); // Get current day and pad with leading zero if needed
    const formattedDate = `${year}-${month}-${day}`; // Format date as YYYY-MM-DD
    setDate(formattedDate); // Set the default date state
    updateOrderNumber();
  }, []);

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString().toLowerCase() : "";
  };

  // console.log("apiData:", apiData);
  const filteredData = apiData.filter(
    (item) =>
      (item.date &&
        formatDate(item.date).includes(searchTermDate.toLowerCase())) ||
      (item.shipByDate &&
        formatDate(item.shipByDate).includes(
          searchTermShibByDate.toLowerCase()
        )) ||
      (item.orderNo &&
        item.orderNo
          .toString()
          .toLowerCase()
          .includes(searchTermOrderNo.toLowerCase())) ||
      (item.portalOrderNo &&
        item.portalOrderNo
          .toString()
          .toLowerCase()
          .includes(searchTermPortalOrderNo.toLowerCase())) ||
      (item.portalOrderLineId &&
        item.portalOrderLineId
          .toString()
          .toLowerCase()
          .includes(searchTermPortalLineId.toLowerCase())) ||
      (item.qty &&
        item.qty
          .toString()
          .toLowerCase()
          .includes(searchTermQuantity.toLowerCase())) ||
      (item.courier &&
        item.courier
          .toString()
          .toLowerCase()
          .includes(searchTermCourier.toLowerCase())) ||
      (item.dispatched &&
        item.dispatched
          .toString()
          .toLowerCase()
          .includes(searchTermDispatched.toLowerCase())) ||
      (item.itemPortalMapping.skucode &&
        item.itemPortalMapping.skucode
          .toString()
          .toLowerCase()
          .includes(searchTermSkucode.toLowerCase())) ||
      (item.itemPortalMapping.portalSkuCode &&
        item.itemPortalMapping.portalSkuCode
          .toString()
          .toLowerCase()
          .includes(searchTermPortalSKU.toLowerCase())) ||
      (item.itemPortalMapping.item.description &&
        item.itemPortalMapping.item.description
          .toString()
          .toLowerCase()
          .includes(searchTermProductDescription.toLowerCase())) ||
      (item.itemPortalMapping.portal &&
        item.itemPortalMapping.portal
          .toString()
          .toLowerCase()
          .includes(searchTermPortal.toLowerCase()) &&
        (searchTermCancel === null ||
          searchTermCancel === "" ||
          (item.cancel &&
            item.cancel
              .toString()
              .toLowerCase()
              .includes(searchTermCancel.toLowerCase()))) &&
        (searchTermOrderStatus === null ||
          searchTermOrderStatus === "" ||
          (item.orderStatus &&
            item.orderStatus
              .toString()
              .toLowerCase()
              .includes(searchTermOrderStatus.toLowerCase()))) &&
        (searchTermAwbNo === null ||
          searchTermAwbNo === "" ||
          (item.awbNo &&
            item.awbNo
              .toString()
              .toLowerCase()
              .includes(searchTermAwbNo.toLowerCase()))) &&
        (!searchTermLocation ||
          (item.location &&
            item.location.locationName
              .toLowerCase()
              .includes(searchTermLocation.toLowerCase()))))
  );

  const sortedData = filteredData.sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    }
    return filteredData;
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // console.log("filteredData:", filteredData);

  // const excelDateToJSDate = (serial) => {
  //   const utc_days = Math.floor(serial - 25569);
  //   const utc_value = utc_days * 86400; // seconds in a day
  //   const date_info = new Date(utc_value * 1000);

  //   const fractional_day = serial - Math.floor(serial) + 0.0000001;

  //   const total_seconds = Math.floor(86400 * fractional_day);

  //   const seconds = total_seconds % 60;

  //   const total_seconds_remaining = total_seconds - seconds;

  //   const hours = Math.floor(total_seconds_remaining / (60 * 60));
  //   const minutes = Math.floor(total_seconds_remaining / 60) % 60;

  //   return new Date(
  //     date_info.getFullYear(),
  //     date_info.getMonth(),
  //     date_info.getDate(),
  //     hours,
  //     minutes,
  //     seconds
  //   );
  // };

  // const parseDate = (value) => {
  //   if (!value) return null;

  //   // Try native Date
  //   const date = new Date(value);
  //   if (!isNaN(date)) return date;

  //   // Try manual parsing: dd-mm-yyyy or dd-mmm-yyyy
  //   const parts = value.split(/[-\/\s]/);
  //   if (parts.length === 3) {
  //     let [day, month, year] = parts;
  //     if (isNaN(month)) {
  //       // Handle mmm month
  //       const monthIndex = [
  //         "jan",
  //         "feb",
  //         "mar",
  //         "apr",
  //         "may",
  //         "jun",
  //         "jul",
  //         "aug",
  //         "sep",
  //         "oct",
  //         "nov",
  //         "dec",
  //       ].indexOf(month.toLowerCase());
  //       if (monthIndex >= 0) {
  //         return new Date(year, monthIndex, day);
  //       }
  //     } else {
  //       // numeric month
  //       return new Date(`${year}-${month}-${day}`);
  //     }
  //   }

  //   return null;
  // };

  const formatDateString = (value) => {
    // Handle Excel serial numbers
    if (typeof value === "number") {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
    }

    // Try parsing string date
    const parsed = new Date(value);

    // If parsed date is valid
    if (!isNaN(parsed)) {
      return parsed.toISOString().split("T")[0]; // "YYYY-MM-DD"
    }

    // Handle dd/mm/yyyy or dd-mm-yyyy formats
    const parts = value.split(/[\/\-]/);
    if (parts.length === 3) {
      let [day, month, year] = parts;
      // Pad single-digit day/month
      if (day.length === 1) day = "0" + day;
      if (month.length === 1) month = "0" + month;
      return `${year}-${month}-${day}`; // "YYYY-MM-DD"
    }

    // Fallback
    return value;
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const invalidRows = [];
      const parsedData = jsonData
        .map((item, index) => {
          if (index == 0) {
            return null;
          }

          const rowNumber = index + 2;
          const hasMissing = !item.date;
          if (hasMissing) invalidRows.push(rowNumber);

          const orderDate = formatDateString(item.date);
          const shipByDate = formatDateString(item.shipByDate);

          return {
            date: orderDate,
            orderNo: item.orderNo,
            portalOrderNo: item.portalOrderNo,
            portalOrderLineId: item.portalOrderLineId,
            portalSKU: item.portalSKU,
            productDescription: item.productDescription,
            shipByDate: shipByDate,
            dispatched: item.dispatched,
            courier: item.courier,
            portal: item.portal,
            skucode: item.skucode,
            qty: item.qty,
            cancel: item.cancel,
            awbNo: item.awbNo,
            orderStatus: item.orderStatus || "Order Received",
            location: item.location,
          };
        })
        .filter((row) => row !== null);

      if (invalidRows.length > 0) {
        toast.error(
          `Mandatory fields (Supplier Name) missing in rows: ${invalidRows.join(
            ", "
          )}`
        );
        setExcelData([]); // Clear previous

        if (fileInputRef.current) {
          fileInputRef.current.value = null; // reset file input
        }
      } else {
        setExcelData(parsedData);
        toast.success("Excel data loaded. Click Submit to upload.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (event) => {
    // Add 'async' here
    event.preventDefault();
    const form = event.currentTarget;

    if (excelData.length > 0) {
      excelData.forEach((row) => {
        axios
          .get(`${apiUrl}/api/locations/name/${row.location}`, {
            params: { email: user.email },
            withCredentials: true,
          })
          .then((response) => {
            const loc = response.data;
            row.location = loc;
          });

        // Fetch item portal mapping details
        axios
          .get(`${apiUrl}/itemportalmapping/Portal/PortalSku`, {
            params: {
              portal: row.portal,
              portalSKU: row.portalSKU,
              email: user.email,
            },
            withCredentials: true, // Moved outside params object
          })
          .then((res) => {
            const ipm = res.data;
            const itemsArray = [res.data.item];
            // Form the data to be sent in the POST request
            const formData = {
              ...row,
              items: itemsArray,
              itemPortalMapping: ipm,
              userEmail: user.email,
            };

            console.log("Form Data for POST:", formData); // Debugging log

            // Send the POST request
            axios
              .post(`${apiUrl}/orders`, formData, { withCredentials: true })
              .then((response) => {
                console.log("POST request successful:", response);
                toast.success("Order added successfully", {
                  autoClose: 2000, // Close after 2 seconds
                });

                // Update the state with the new API data
                setApiData([...apiData, response.data]);
              })
              .catch((error) => {
                console.error("Error sending POST request:", error);
                toast.error(
                  "Failed to add Order: " + error.response?.data?.message ||
                    error.message
                );
              });
          })
          .catch((error) => {
            console.error("Error fetching item portal mapping:", error);
            toast.error(
              "Failed to fetch item portal mapping: " +
                error.response?.data?.message || error.message
            );
          });
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      setExcelData([]);
      return; // Don’t proceed with manual form if Excel prese
    }

    if (form.checkValidity() === false) {
      event.stopPropagation();
      console.log("Form validation failed");
      setValidated(true);
      return;
    }

    // productRows.forEach((pr) => {
    //   console.log("products::::", pr.skuCode);

    const formData = {
      date,
      orderNo,
      portal,
      portalOrderNo,
      portalOrderLineId,
      products: productRows,
      shipByDate,
      dispatched,
      courier,
      cancel,
      awbNo,
      orderStatus: "Order Received",
      location: location,
      userEmail: user.email,
    };

    console.log("Form data: ", formData);

    axios
      .post(`${apiUrl}/orders/new`, formData, { withCredentials: true })
      .then((postResponse) => {
        console.log("POST request successful:", postResponse);

        toast.success("Order added successfully", { autoClose: 2000 });

        // const lastSerialNumber =
        //   parseInt(localStorage.getItem("lastSerialNumber")) || 0;
        // const newSerialNumber = lastSerialNumber + 1;
        // localStorage.setItem("lastSerialNumber", newSerialNumber);

        updateOrderNumber();
        setValidated(false);
        for (let index = 0; index < postResponse.data.length; index++) {
          setApiData([...apiData, postResponse.data[index]]);
        }

        setCourier("");
        setDispatched("");
        setPortal("");
        setPortalOrderno("");
        setPortalOrderLineid("");
        setShipbyDate("");
        // setQuantity("");
        // setProductDescription("");
        // setSkucode("");
        // setPortalSKU("");
        setSelectedPortal("");
        setCancel("");
        setAwbNo("");
        setOrderStatus("");
        setLocation("");
        setProductRows([
          {
            portalSKU: "",
            productDescription: "",
            skuCode: "",
            quantity: "",
          },
        ]);
      })
      .catch((error) => {
        console.error("Error sending Post request:", error);
        toast.error("Failed to add new Order: " + error.response.data.message);
      });

    // try {
    //   // Make the location API call
    //   const locationResponse = await axios.get(
    //     `${apiUrl}/api/locations/name/${location}`,
    //     { params: { email: user.email }, withCredentials: true }
    //   );
    //   const loc = locationResponse.data;

    //   // Fetch item based on supplier and seller SKU code
    //   const itemResponse = await axios.get(
    //     `${apiUrl}/item/supplier/order/search/${skucode}/${productDescription}`,
    //     { params: { email: user.email }, withCredentials: true }
    //   );

    //   if (itemResponse.data) {
    //     const itemsArray = [itemResponse.data]; // Store item data in an array

    //     // Fetch item portal mapping details
    //     const ipmResponse = await axios.get(
    //       `${apiUrl}/itemportalmapping/Portal/PortalSku`,
    //       {
    //         params: {
    //           portal,
    //           portalSKU,
    //           email: user.email,
    //         },
    //         withCredentials: true,
    //       }
    //     );

    //     const ipm = ipmResponse.data;

    //     // Build the form data object dynamically
    //     const formData = {
    //       orderNo,
    //       portalSKU,
    //       productDescription,
    //       orderStatus: "Order Received",
    //       items: itemsArray,
    //       itemPortalMapping: ipm,
    //       location: loc,
    //       userEmail: user.email,
    //       ...(date && { date }),
    //       ...(portalOrderNo && { portalOrderNo }),
    //       ...(portalOrderLineId && { portalOrderLineId }),
    //       ...(shipByDate && { shipByDate }),
    //       ...(dispatched && { dispatched }),
    //       ...(courier && { courier }),
    //       ...(portal && { portal }),
    //       ...(skucode && { skucode }),
    //       ...(qty && { qty }),
    //       ...(cancel && { cancel }),
    //       ...(awbNo && { awbNo }),
    //     };

    //     console.log("Form data: ", formData);

    //     // Send the POST request
    //     const postResponse = await axios.post(`${apiUrl}/orders`, formData, {
    //       withCredentials: true,
    //     });
    //     console.log("POST request successful:", postResponse);

    //     toast.success("Order added successfully", { autoClose: 2000 });

    //     const lastSerialNumber =
    //       parseInt(localStorage.getItem("lastSerialNumber")) || 0;
    //     const newSerialNumber = lastSerialNumber + 1;
    //     localStorage.setItem("lastSerialNumber", newSerialNumber);

    //     updateOrderNumber();
    //     setValidated(false);
    //     setApiData([...apiData, postResponse.data]);

    //     setCourier("");
    //     setDispatched("");
    //     setPortal("");
    //     setPortalOrderno("");
    //     setPortalOrderLineid("");
    //     setQuantity("");
    //     setShipbyDate("");
    //     setProductDescription("");
    //     setSkucode("");
    //     setPortalSKU("");
    //     setSelectedPortal("");
    //     setCancel("");
    //     setAwbNo("");
    //     setOrderStatus("");
    //     setLocation("");
    //   } else {
    //     console.error(
    //       "No item found for the specified supplier and supplier SKU code."
    //     );
    //   }
    // } catch (error) {
    //   console.error("Error:", error);
    //   toast.error(
    //     "Failed to process the order: " + error.response?.data?.message ||
    //       error.message
    //   );
    // }
    // });
    setValidated(false);
  };

  const handleRowSubmit = () => {
    console.log("handleRowSubmit triggered");
    console.log(selectedItem);
    if (rowSelected && selectedItem) {
      const formData = {
        ...selectedItem,
        date,
        orderNo,
        portalOrderNo,
        portalOrderLineId,
        products: productRows,
        // portalSKU,
        // productDescription,
        shipByDate,
        dispatched,
        courier,
        portal,
        // skucode,
        // qty,
        cancel,
        awbNo,
        orderStatus,
        location,
      };
      console.log("form data: ", formData);
      console.log("id: ", selectedItem.orderId);

      // const loc = locations.filter((i) => i.locationName == location);
      // formData.location = loc[0];
      axios
        .put(`${apiUrl}/orders/${selectedItem.orderId}`, formData, {
          withCredentials: true,
        })
        .then((response) => {
          console.log("PUT request successful:", response);
          toast.success("Order updated successfully", {
            autoClose: 2000, // Close after 2 seconds
          });
          setApiData((prevData) =>
            prevData.map((item) =>
              item.orderId === selectedItem.orderId ? response.data : item
            )
          ); // Update the specific item

          setValidated(false);
          setRowSelected(false);
          setDate("");
          setOrderno("");
          setPortalOrderno("");
          setPortalOrderLineid("");
          setPortal("");
          setSelectedPortal("");
          // setPortalSKU("");
          // setProductDescription("");
          setCourier("");
          setDispatched("");
          // setQuantity("");
          // setSkucode("");
          setShipbyDate("");
          setCancel("");
          setAwbNo("");
          setOrderStatus("");
          setLocation("");
          setProductRows([
            {
              portalSKU: "",
              productDescription: "",
              skuCode: "",
              quantity: "",
            },
          ]);

          updateOrderNumber();
        })
        .catch((error) => {
          console.error("Error sending PUT request:", error);
          toast.error("Failed to update Order: " + error.response.data.message);
        });
    }
  };

  const handleRowClick = (order) => {
    console.log("order: ", order);

    setDate(order.date);
    setOrderno(order.orderNo);
    setPortalOrderno(order.portalOrderNo);
    setPortalOrderLineid(order.portalOrderLineId);
    setSelectedPortal(order.portal); // Assuming 'portal' property exists in the order object
    setPortal(order.portal); // Assuming 'portal' property exists in the order object
    setProductRows([
      {
        portalSKU: order.portalSKU,
        productDescription: order.productDescription,
        skuCode: order.itemPortalMapping.skucode,
        quantity: order.qty,
      },
    ]);

    setCourier(order.courier);
    setDispatched(order.dispatched);

    setShipbyDate(order.shipByDate);
    setCancel(order.cancel);
    setAwbNo(order.awbNo);
    setOrderStatus(order.orderStatus);
    setLocation(order.location.locationName);
    setRowSelected(true);
    setSelectedItem(order);
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/orders/user/email`, {
        params: { email: user.email },
        withCredentials: true,
      })
      .then((response) => {
        setApiData(response.data);
        console.log("response::::::", response.data);
      })
      .catch((error) => console.error(error));
    // console.log("hereeeeeee-------", apiData);
    axios
      .get(`${apiUrl}/itemportalmapping/user/email`, {
        params: { email: user.email },
        withCredentials: true,
      })
      .then((response) => {
        console.log("in first itemportalmapping ----", response.data);
        // Extract portal SKUs from the response data
        const portalSKUs = response.data.map((item) => item.portalSkuCode);
        const filteredSkucodeList = response.data.map(
          (seller) => seller.skucode
        );
        const portalNames = new Set(response.data.map((item) => item.portal));
        // Convert the Set of portal names to an array
        const portalNameList = Array.from(portalNames);
        setPortalSKUList(portalSKUs);
        setSkucodeList(filteredSkucodeList);
        setPortalNameList(portalNameList); // Now it should work without error
        setPortalMapping(response.data); // Set portal mapping data
      })
      .catch((error) => {
        console.error("Error fetching portal SKUs:", error);
      });
    // axios
    //   .get(`${apiUrl}/item/supplier/user/email`, {
    //     params: { email: user.email },
    //     withCredentials: true,
    //   })
    //   .then((response) => {
    //     // Extract portal SKUs from the response data
    //     const itemDescription = response.data.map((item) => item.description);
    //     setItemDescriptionList(itemDescription);
    //     console.log("portal list = " + portalSKUList);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching portal SKUs:", error);
    //   });

    axios
      .get(`${apiUrl}/api/locations/user/email`, {
        params: { email: user.email },
        withCredentials: true,
      }) // Update with your API endpoint
      .then((response) => {
        setLocations(response.data);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
      });
    const fetchPortalMapping = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/itemportalmapping/user/email`,
          { params: { email: user.email }, withCredentials: true }
        ); // Replace 'your-api-endpoint' with the actual API endpoint
        setPortalMapping(response.data); // Set portal mapping data
        console.log("item portal mapping Response data: ", response.data);
        console.log("item portal mapping: ", portalMapping);
      } catch (error) {
        console.error("Error fetching portal mapping:", error);
      }
    };

    // fetchPortalMapping(); // Call the fetchPortalMapping function
  }, [user]);

  const handleDelete = (id) => {
    console.log("Deleting row with id:", id);
    // Remove the row from the table

    axios
      .delete(`${apiUrl}/orders/${id}`, { withCredentials: true })
      .then((response) => {
        // Handle success response
        console.log("Row deleted successfully.");
        toast.success("Order deleted successfully", {
          autoClose: 2000, // Close after 2 seconds
        });
        setApiData((prevData) => prevData.filter((row) => row.orderId !== id));
      })
      .catch((error) => {
        // Handle error
        console.error("Error deleting row:", error);
        toast.error("Failed to delete Order: " + error.response.data.message);
      });
    console.log("After deletion, apiData:", apiData);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        date: "dd-mmm-yyyy",
        orderNo: "",
        portal: "",
        portalOrderNo: "",
        portalOrderLineId: "",
        portalSKU: "",
        skucode: "",
        productDescription: "",
        qty: "",
        shipByDate: "dd-mmm-yyyy",
        dispatched: "",
        courier: "",
        cancel: "",
        awbNo: "",
        location: "",
        orderStatus: "",
      },
      {
        date: "",
        orderNo: "",
        portal: "",
        portalOrderNo: "",
        portalOrderLineId: "",
        portalSKU: "",
        skucode: "",
        productDescription: "",
        qty: "",
        shipByDate: "",
        dispatched: "",
        courier: "",
        cancel: "",
        awbNo: "",
        location: "",
        orderStatus: "",
      }, // Add more fields if needed
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Adjust column widths to fit the note
    ws["!cols"] = [
      { wch: 20 }, // width
      { wch: 20 }, // width
      { wch: 15 }, // width
      { wch: 15 }, // width
      { wch: 20 }, // width
      { wch: 20 }, // width
      { wch: 15 }, // width
      { wch: 15 }, // width
      { wch: 20 }, // width
      { wch: 20 }, // width
      { wch: 15 }, // width
      { wch: 15 }, // width
      { wch: 20 }, // width
      { wch: 20 }, // width
      { wch: 15 }, // width
      { wch: 15 }, // width
    ];

    ws["!ref"] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: templateData.length, c: 17 },
    });

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    }

    saveAs(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
      "OrderTemplate.xlsx"
    );
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    }

    saveAs(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
      "OrderData.xlsx"
    );
  };

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="title">
        <h1>Import Order Form</h1>
      </div>
      <Accordion defaultExpanded>
        <AccordionSummary
          className="acc-summary"
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: "#E5E7E9" }}
        >
          <h4>Order Form</h4>
        </AccordionSummary>
        <AccordionDetails>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Date</Form.Label>
                <div className="custom-date-picker">
                  <DatePicker
                    selected={date}
                    onChange={(date) => setDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select Date"
                    className="form-control" // Apply Bootstrap form control class
                  />
                </div>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Order No</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Order No"
                  value={orderNo}
                  onChange={(e) => setOrderno(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Portal</Form.Label>
                <Form.Select
                  required
                  value={selectedPortal} // Set the selected value
                  onChange={(e) => {
                    setSelectedPortal(e.target.value); // Handle value change
                    setPortal(e.target.value);
                    // setPortalSKU(""); // Reset portal SKU when portal changes
                  }}
                >
                  <option value="">Select Portal</option>
                  {/* Map over portalNameList and create options */}
                  {portalNameList.map((portal, index) => (
                    <option key={index} value={portal}>
                      {portal}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Portal OrderNo</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Portal OrderNo"
                  value={portalOrderNo}
                  onChange={(e) => setPortalOrderno(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Portal OrderLineid</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Portal OrderLineid"
                  value={portalOrderLineId}
                  onChange={(e) => setPortalOrderLineid(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                {/* <Form.Label>Portal SKU</Form.Label>
                <Form.Select
                  required
                  value={portalSKU} // Set the selected value
                  onChange={(e) => setPortalSKU(e.target.value)} // Handle value change
                >
                  <option value="">Select Portal SKU</option> */}
                {/* Map over filteredPortalSKUList and create options */}
                {/* {filteredPortalSKUList.map((sku, index) => (
                    <option key={index} value={sku}>
                      {sku}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback> */}
              </Form.Group>
            </Row>
            {/* shubham */}

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Portal SKU Code</th>
                  <th>Product Code</th>
                  <th>Product Description</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <Form.Select
                        value={row.portalSKU}
                        onChange={(e) =>
                          handlePortalSKUChange(e.target.value, index)
                        }
                      >
                        <option value="">Select Portal SKU</option>
                        {uniquePortalSKUs.map((sku, i) => (
                          <option key={i} value={sku}>
                            {sku}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={row.skuCode}
                        disabled
                        readOnly
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={row.productDescription}
                        disabled
                        readOnly
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={row.quantity}
                        onChange={(e) =>
                          handleQuantityChange(e.target.value, index)
                        }
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveRow(index)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label></Form.Label>

                <Button onClick={handleAddRow}>Add New Product</Button>
                {/* <Form.Select
                  required
                  value={skucode} // Set the selected value
                  onChange={(e) => setSkucode(e.target.value)} // Handle value change
                >
                  <option value="">Select SKUCode</option> */}
                {/* Map over filteredSellerSKUList and create options */}
                {/* {filteredSkucodeList.map((sku, index) => (
                    <option key={index} value={sku}>
                      {sku}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback> */}
              </Form.Group>
              {/* <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Product Description</Form.Label>
                <Form.Select
                  required
                  value={productDescription} // Set the selected value
                  onChange={(e) => setProductDescription(e.target.value)} // Handle value change
                >
                  <option value="">Select Product Description</option>
                  {/* Map over filteredItemDescriptionList and create options */}
              {/*
                  {filteredItemDescriptionList.map((description, index) => (
                    <option key={index} value={description}>
                      {description}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Quantity"
                  value={qty}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group> */}
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Ship by Date</Form.Label>
                <div className="custom-date-picker">
                  <DatePicker
                    selected={shipByDate}
                    onChange={(date) => setShipbyDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select Date"
                    className="form-control" // Apply Bootstrap form control class
                  />
                </div>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Dispatched</Form.Label>
                <Form.Select
                  required
                  value={dispatched} // Set the selected value
                  onChange={(e) => setDispatched(e.target.value)} // Handle value change
                >
                  <option value="">Select Dispatched</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Form.Select>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Courier</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Courier"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Order Cancel</Form.Label>
                <Form.Select
                  required
                  value={cancel} // Set the selected value
                  onChange={(e) => setCancel(e.target.value)} // Handle value change
                >
                  <option value="">Select If Order Canceled</option>
                  <option value="Order Not Canceled">Order Not Canceled</option>
                  <option value="Order Canceled">Order Canceled</option>
                </Form.Select>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>AWB No</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="AWB No"
                  value={awbNo}
                  onChange={(e) => setAwbNo(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Order Status</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Order Status"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Location</Form.Label>
                <Form.Select
                  required
                  onChange={(e) => setLocation(e.target.value)}
                  value={location}
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.locationId} value={loc.locationName}>
                      {loc.locationName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <div className="buttons">
              {rowSelected ? (
                <Button onClick={handleRowSubmit}>Edit</Button>
              ) : (
                <Button type="submit" onClick={handleSubmit}>
                  Submit
                </Button>
              )}
              <span style={{ margin: "0 10px" }}>or</span>
              <input
                type="file"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
              <span style={{ margin: "auto" }}></span>
              <Button
                variant="contained"
                tabIndex={-1}
                style={{
                  height: "33px",
                  backgroundColor: "orange",
                  color: "white",
                  fontWeight: "bolder",
                }}
                onClick={downloadTemplate}
              >
                {<CloudUploadIcon style={{ marginBottom: "5px" }} />} Download
                Template
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
          sx={{ backgroundColor: "#E5E7E9" }}
        >
          <h4>List View of Orders</h4>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ overflowX: "auto" }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("date")}
                      ></SwapVertIcon>
                      Date
                      <input
                        type="text"
                        placeholder="Search by date"
                        value={searchTermDate}
                        onChange={(e) => setSearchTermDate(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("orderNo")}
                      ></SwapVertIcon>
                      Order No
                      <input
                        type="text"
                        placeholder="Search by order no"
                        value={searchTermOrderNo}
                        onChange={(e) => setSearchTermOrderNo(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("portal")}
                      ></SwapVertIcon>
                      Portal
                      <input
                        type="text"
                        placeholder="Search by portal"
                        value={searchTermPortal}
                        onChange={(e) => setSearchTermPortal(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("portalOrderNo")}
                      ></SwapVertIcon>
                      Portal Order No
                      <input
                        type="text"
                        placeholder="Search by portal order no"
                        value={searchTermPortalOrderNo}
                        onChange={(e) =>
                          setSearchTermPortalOrderNo(e.target.value)
                        }
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("portalOrderLineId")}
                      ></SwapVertIcon>
                      Portal Order Line Id
                      <input
                        type="text"
                        placeholder="Search by portal order line id"
                        value={searchTermPortalLineId}
                        onChange={(e) =>
                          setSearchTermPortalLineId(e.target.value)
                        }
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("portalSKU")}
                      ></SwapVertIcon>
                      Portal SKU
                      <input
                        type="text"
                        placeholder="Search by portal SKU"
                        value={searchTermPortalSKU}
                        onChange={(e) => setSearchTermPortalSKU(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("skucode")}
                      ></SwapVertIcon>
                      SKUCode
                      <input
                        type="text"
                        placeholder="Search by seller SKU"
                        value={searchTermSkucode}
                        onChange={(e) => setSearchTermSkucode(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("productDescription")}
                      ></SwapVertIcon>
                      Product Description
                      <input
                        type="text"
                        placeholder="Search by product description"
                        value={searchTermProductDescription}
                        onChange={(e) =>
                          setSearchTermProductDescription(e.target.value)
                        }
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("qty")}
                      ></SwapVertIcon>
                      Quantity
                      <input
                        type="text"
                        placeholder="Search by quantity"
                        value={searchTermQuantity}
                        onChange={(e) => setSearchTermQuantity(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("shipByDate")}
                      ></SwapVertIcon>
                      Ship by Date
                      <input
                        type="text"
                        placeholder="Search by ship by date"
                        value={searchTermShibByDate}
                        onChange={(e) =>
                          setSearchTermShibByDate(e.target.value)
                        }
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("dispatched")}
                      ></SwapVertIcon>
                      Dispatched
                      <input
                        type="text"
                        placeholder="Search by dispatched"
                        value={searchTermDispatched}
                        onChange={(e) =>
                          setSearchTermDispatched(e.target.value)
                        }
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("courier")}
                      ></SwapVertIcon>
                      Courier
                      <input
                        type="text"
                        placeholder="Search by courier"
                        value={searchTermCourier}
                        onChange={(e) => setSearchTermCourier(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("cancel")}
                      ></SwapVertIcon>
                      Order Cancel
                      <input
                        type="text"
                        placeholder="Search by cancel"
                        value={searchTermCancel}
                        onChange={(e) => setSearchTermCancel(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("awbNo")}
                      ></SwapVertIcon>
                      AWB No
                      <input
                        type="text"
                        placeholder="Search by awbNo"
                        value={searchTermAwbNo}
                        onChange={(e) => setSearchTermAwbNo(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <span>
                      <SwapVertIcon
                        style={{ cursor: "pointer", marginRight: "2%" }}
                        variant="link"
                        onClick={() => requestSort("orderStatus")}
                      ></SwapVertIcon>
                      Order Status
                      <input
                        type="text"
                        placeholder="Search by order status"
                        value={searchTermOrderStatus}
                        onChange={(e) =>
                          setSearchTermOrderStatus(e.target.value)
                        }
                      />
                    </span>
                  </th>

                  <th>
                    <SwapVertIcon
                      style={{ cursor: "pointer", marginRight: "2%" }}
                      variant="link"
                      onClick={() => requestSort("location")}
                    ></SwapVertIcon>
                    Location
                    <span style={{ margin: "0 10px" }}>
                      <input
                        type="text"
                        placeholder="Search by location"
                        value={searchTermLocation}
                        onChange={(e) => setSearchTermLocation(e.target.value)}
                      />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((order) => (
                  <tr key={order.orderId} onClick={() => handleRowClick(order)}>
                    <td style={{ width: "50px", textAlign: "center" }}>
                      <button
                        style={{
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          height: "100%",
                          padding: "0",
                          border: "none",
                          background: "none",
                        }}
                        className="delete-icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Stop propagation of the click event
                          handleDelete(order.orderId); // Call handleDelete function
                        }}
                      >
                        <DeleteIcon style={{ color: "#F00" }} />
                      </button>
                    </td>
                    <td>
                      {(() => {
                        const date = new Date(order.date);
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                      })()}
                    </td>
                    <td>{order.orderNo ?? ""}</td>
                    <td>{order.itemPortalMapping?.portal ?? ""}</td>
                    <td>{order.portalOrderNo ?? ""}</td>
                    <td>{order.portalOrderLineId ?? ""}</td>
                    <td>{order.itemPortalMapping?.portalSkuCode ?? ""}</td>
                    <td>{order.items[0]?.skucode ?? ""}</td>
                    <td>{order.itemPortalMapping?.item?.description ?? ""}</td>
                    <td>{order.qty ?? ""}</td>
                    <td>
                      {(() => {
                        const date = new Date(order.shipByDate);
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                      })()}
                    </td>
                    <td>{order.dispatched ?? ""}</td>
                    <td>{order.courier ?? ""}</td>
                    <td>{order.cancel ?? ""}</td>
                    <td>{order.awbNo ?? ""}</td>
                    <td>{order.orderStatus ?? ""}</td>
                    <td>{order.location ? order.location.locationName : ""}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="contained"
              tabIndex={-1}
              style={{
                height: "33px",
                backgroundColor: "#5463FF",
                color: "white",
                fontWeight: "bolder",
              }}
              onClick={exportToExcel}
            >
              {<FileDownloadIcon style={{ marginBottom: "5px" }} />} Export to
              Excel
            </Button>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {rowsPerPageDropdown}

              <Pagination>
                {Array.from({
                  length: Math.ceil(filteredData.length / itemsPerPage),
                }).map((_, index) => (
                  <Pagination.Item
                    key={index}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
                  >
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
}

export default ImportOrderForm;
