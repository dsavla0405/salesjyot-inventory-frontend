import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Item.css";
import { Table, FormControl } from "react-bootstrap";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as XLSX from "xlsx";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import { IoIosRefresh } from "react-icons/io";
import { saveAs } from "file-saver";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "react-bootstrap/Pagination";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useDispatch, useSelector } from "react-redux";

function Item() {
  const user = useSelector((state) => state.user);

  console.log("user email in item = " + user.email);

  const [validated, setValidated] = useState(false);
  const [Supplier, setSupplier] = useState("");
  const [skucode, setSKUCode] = useState("");
  const [description, setDescription] = useState("");
  const [packOf, setPackof] = useState("");
  const [parentSKU, setParentSKU] = useState("");
  const [group1, setGroup1] = useState("");
  const [group2, setGroup2] = useState("");
  const [group3, setGroup3] = useState("");
  const [sizeRange, setSizeRange] = useState("");
  const [size, setSize] = useState("");
  const [unit, setUnit] = useState("");
  const [barcode, setBarcode] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [mrp, setMRP] = useState("");
  const [sellerSKUCode, setSellerSKUcode] = useState("");
  const [img, setImg] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliersList, setSuppliersList] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [formData, setFormData] = useState({});
  const [parentSKUs, setParentSKUs] = useState([]);
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTermDescription, setSearchTermDescription] = useState("");
  const [searchTermPackOf, setSearchTermPackOf] = useState("");
  const [searchTermParentSKU, setSearchTermParentSKU] = useState("");
  const [searchTermGroup1, setSearchTermGroup1] = useState("");
  const [searchTermGroup2, setSearchTermGroup2] = useState("");
  const [searchTermGroup3, setSearchTermGroup3] = useState("");
  const [searchTermSizeRange, setSearchTermSizeRange] = useState("");
  const [searchTermSize, setSearchTermSize] = useState("");
  const [searchTermUnit, setSearchTermUnit] = useState("");
  const [searchTermBarcode, setSearchTermBarcode] = useState("");
  const [searchTermSellingPrice, setSearchTermSellingPrice] = useState("");
  const [searchTermMRP, setSearchTermMRP] = useState("");
  const [searchTermSellerSKU, setSearchTermSellerSKU] = useState("");
  const [searchTermSKUCode, setSearchTermSKUCode] = useState("");
  const [searchTermImg, setSearchTermImg] = useState("");
  const [searchTermSupplier, setSearchTermSupplier] = useState("");
  const [isRotating, setIsRotating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const rowsPerPageOptions = [10, 20, 50, 100];
  const apiUrl = process.env.REACT_APP_API_URL;
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
  const filteredData = apiData.filter((item) => {
    return (
      (!searchTermSupplier ||
        (item.suppliers &&
          item.suppliers.length > 0 &&
          item.suppliers[0].supplierName &&
          item.suppliers[0].supplierName
            .toLowerCase()
            .includes(searchTermSupplier.toLowerCase()))) &&
      (!searchTermDescription ||
        (item.description &&
          item.description
            .toLowerCase()
            .includes(searchTermDescription.toLowerCase()))) &&
      (!searchTermPackOf ||
        (item.packOf &&
          item.packOf
            .toLowerCase()
            .includes(searchTermPackOf.toLowerCase()))) &&
      (!searchTermGroup1 ||
        (item.group1 &&
          item.group1
            .toLowerCase()
            .includes(searchTermGroup1.toLowerCase()))) &&
      (!searchTermGroup2 ||
        (item.group2 &&
          item.group2
            .toLowerCase()
            .includes(searchTermGroup2.toLowerCase()))) &&
      (!searchTermGroup3 ||
        (item.group3 &&
          item.group3
            .toLowerCase()
            .includes(searchTermGroup3.toLowerCase()))) &&
      (!searchTermSizeRange ||
        (item.sizeRange &&
          item.sizeRange
            .toLowerCase()
            .includes(searchTermSizeRange.toLowerCase()))) &&
      (!searchTermSize ||
        (item.size &&
          item.size
            .toString()
            .toLowerCase()
            .includes(searchTermSize.toLowerCase()))) &&
      (!searchTermUnit ||
        (item.unit &&
          item.unit.toLowerCase().includes(searchTermUnit.toLowerCase()))) &&
      (!searchTermParentSKU ||
        (item.parentSKU &&
          item.parentSKU
            .toLowerCase()
            .includes(searchTermParentSKU.toLowerCase()))) &&
      (!searchTermBarcode ||
        (item.barcode &&
          item.barcode
            .toLowerCase()
            .includes(searchTermBarcode.toLowerCase()))) &&
      (!searchTermSellingPrice ||
        (item.sellingPrice &&
          item.sellingPrice
            .toString()
            .toLowerCase()
            .includes(searchTermSellingPrice.toLowerCase()))) &&
      (!searchTermMRP ||
        (item.mrp &&
          item.mrp
            .toString()
            .toLowerCase()
            .includes(searchTermMRP.toLowerCase()))) &&
      (!searchTermSellerSKU ||
        (item.sellerSKUCode &&
          item.sellerSKUCode
            .toLowerCase()
            .includes(searchTermSellerSKU.toLowerCase()))) &&
      (!searchTermSKUCode ||
        (item.skucode &&
          item.skucode
            .toLowerCase()
            .includes(searchTermSKUCode.toLowerCase()))) &&
      (searchTermImg === null ||
        searchTermImg === "" ||
        (item.img &&
          item.img.toLowerCase().includes(searchTermImg.toLowerCase())))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // Check for required fields individually with specific error messages
    if (!Supplier) {
      toast.error("Supplier is required");
      event.stopPropagation();
      setValidated(true);
      return;
    }

    if (!skucode) {
      toast.error("SKU Code is required");
      event.stopPropagation();
      setValidated(true);
      return;
    }

    if (!description) {
      toast.error("Description is required");
      event.stopPropagation();
      setValidated(true);
      return;
    }

    if (!sellerSKUCode) {
      toast.error("Seller/Supplier SKU Code is required");
      event.stopPropagation();
      setValidated(true);
      return;
    }

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      let formData = {
        skucode,
        description,
        packOf,
        parentSKU,
        group1,
        group2,
        group3,
        sizeRange,
        size,
        unit,
        barcode,
        sellingPrice,
        mrp,
        sellerSKUCode,
        img,
        userEmail: user.email,
      };

      // Include suppliers only if the suppliers array is not empty
      if (suppliers.length > 0) {
        formData.suppliers = suppliers;
      } else {
        // If suppliers array is empty, include an empty array
        formData.suppliers = [];
      }

      console.log(formData);

      axios
        .post(`${apiUrl}/item/supplier`, formData, { withCredentials: true })
        .then((response) => {
          console.log("POST request successful:", response);
          toast.success("Item added successfully", {
            autoClose: 2000, // Close after 2 seconds
          });
          setValidated(false);
          setApiData([...apiData, response.data]);
          setBarcode("");
          setDescription("");
          setGroup1("");
          setGroup2("");
          setGroup3("");
          setMRP("");
          setPackof("");
          setParentSKU("");
          setSellerSKUcode("");
          setSellingPrice("");
          setSize("");
          setSizeRange("");
          setSKUCode("");
          setUnit("");
          setSupplier("");
          setImg("");
          setSuppliers([]); // Reset suppliers list to an empty array
          console.log("Suppliers reset to empty array:", suppliers);
        })
        .catch((error) => {
          console.error("Error sending POST request:", error);
          toast.error("Failed to add item: " + error.response.data.message);
        });
    }
  };

  const handleRefresh = () => {
    fetchData();
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
    }, 1000);
  };

  useEffect(() => {
    // Fetch initial data
    fetchData();
  }, [user]);

  const fetchData = () => {
    axios
      .get(`${apiUrl}/supplier/user/email`, {
        params: { email: user.email },
        withCredentials: true,
      })
      .then((response) => {
        setSuppliersList(response.data);
        setParentSKUs(response.data.skucode);
      })
      .catch((error) => {
        console.error("Error fetching supplier data:", error);
      });

    axios
      .get(`${apiUrl}/item/supplier/user/email`, {
        params: { email: user.email }, // Pass the email as a query parameter
        withCredentials: true, // Include credentials if needed
      })
      .then((response) => {
        const filteredData = response.data.filter(
          (item) => typeof item === "object"
        );
        setApiData(filteredData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleSupplierChange = (event, name) => {
    if (name) {
      const selectedSupplier = suppliersList.find(
        (supplier) => supplier.supplierName === name
      );
      if (selectedSupplier) {
        console.log("Selected Supplier:", selectedSupplier);
        setSupplier(selectedSupplier.supplierName); // Update the selected supplier name
        setSupplierId(selectedSupplier.supplierId); // Update the supplier ID

        // Add the selected supplier to the suppliers list
        setSuppliers((prevSuppliers) => {
          const updatedSuppliers = [selectedSupplier];
          console.log("Updated Suppliers:", updatedSuppliers);
          return updatedSuppliers;
        });
      } else {
        console.error("Supplier not found for name:", name);
        setSupplier(null); // Clear the selected supplier
        setSupplierId(""); // Clear the supplierId
        setSuppliers([]); // Reset suppliers to an empty array if no supplier is found
      }
    } else {
      // Handle case when no value is selected
      setSupplier(null); // Clear the selected supplier
      setSupplierId(""); // Clear the supplierId
      setSuppliers([]); // Reset suppliers to an empty array if no value is selected
    }
  };

  const handleSKUCodeChange = (event, value1) => {
    if (value1) {
      console.log("Selected Parent SKU:", value1);
      setParentSKU(value1); // Update the selected SKU object
    } else {
      setParentSKU(null); // Clear the selected parent SKU if no value is selected
    }
  };

  const uniqueSKUCodes = [
    ...new Set(
      apiData
        .filter((item) => item.skucode !== null)
        .map((item) => item.skucode)
    ),
  ];
  const uniqueGroup1 = [
    ...new Set(
      apiData.filter((item) => item.group1 !== null).map((item) => item.group1)
    ),
  ];
  const uniqueGroup2 = [
    ...new Set(
      apiData.filter((item) => item.group2 !== null).map((item) => item.group2)
    ),
  ];
  const uniqueGroup3 = [
    ...new Set(
      apiData.filter((item) => item.group3 !== null).map((item) => item.group3)
    ),
  ];

  const uniqueUnit = [
    ...new Set(
      apiData.filter((item) => item.unit !== null).map((item) => item.unit)
    ),
  ];

  const initialParentSKU =
    parentSKU && uniqueSKUCodes.includes(parentSKU) ? parentSKU : null;

  useEffect(() => {
    console.log("apidata = ", apiData); // Print apiData whenever it changes
  }, [apiData]);

  const handleRowClick = (item) => {
    axios
      .get(`${apiUrl}/item/supplier/${item.itemId}`, { withCredentials: true })
      .then((response) => {
        // Check if the response is successful
        if (response.status !== 200) {
          throw new Error("Failed to fetch supplier");
        }

        // Extract supplier information from the response data
        const suppliers = response.data.suppliers;

        // Find the first supplier (assuming there's only one supplier in the list)
        const supplier = suppliers.length > 0 ? suppliers[0] : null;

        if (supplier) {
          const { supplierName, supplierId } = supplier;
          // Set supplier information
          setSupplier(supplierName);
          setSupplierId(supplierId);
        } else {
          // Handle case where no supplier is found
          console.error("No supplier found for item:", item.itemId);
        }

        // Set the suppliers state with the response data
        setSuppliers(suppliers);
      })
      .catch((error) => {
        console.error("Error fetching supplier:", error);
        // Handle error
      });

    setSupplier(Supplier);
    setSKUCode(item.skucode);
    setDescription(item.description);
    setPackof(item.packOf);
    setParentSKU(item.parentSKU);
    setGroup1(item.group1);
    setGroup2(item.group2);
    setGroup3(item.group3);
    setSizeRange(item.sizeRange);
    setSize(item.size);
    setUnit(item.unit);
    setBarcode(item.barcode);
    setSellingPrice(item.sellingPrice);
    setMRP(item.mrp);
    setSellerSKUcode(item.sellerSKUCode);
    setImg(item.img || "");
    setRowSelected(true);
    setSelectedItem(item);
  };

  const handleRowSubmit = () => {
    // Check for required fields individually with specific error messages
    if (!Supplier) {
      toast.error("Supplier is required");
      return;
    }

    if (!skucode) {
      toast.error("SKU Code is required");
      return;
    }

    if (!description) {
      toast.error("Description is required");
      return;
    }

    if (!sellerSKUCode) {
      toast.error("Seller/Supplier SKU Code is required");
      return;
    }

    if (rowSelected && selectedItem) {
      console.log("selected item: " + JSON.stringify(selectedItem));

      // Store the current value of suppliers
      const currentSuppliers = suppliers;

      const formData = {
        // Prepare the updated item object with the changes
        ...selectedItem,

        skucode,
        description,
        packOf,
        parentSKU,
        group1,
        group2,
        group3,
        sizeRange,
        size,
        unit,
        barcode,
        sellingPrice,
        mrp,
        sellerSKUCode,
        img,
        suppliers: suppliers.length > 0 ? suppliers : currentSuppliers, // Ensure suppliers are included correctly
      };

      console.log(formData);

      axios
        .put(`${apiUrl}/item/supplier/${selectedItem.itemId}`, formData, {
          withCredentials: true,
        })
        .then((response) => {
          console.log("PUT request successful:", response);
          toast.success("Item updated successfully", {
            autoClose: 2000, // Close after 2 seconds
          });
          setApiData((prevData) =>
            prevData.map((item) =>
              item.itemId === selectedItem.itemId ? response.data : item
            )
          ); // Update the specific item

          setValidated(false);
          setRowSelected(false);
          setSelectedItem(response.data); // Update selectedItem with the response data
          // Clear form fields
          setSupplier("");
          setSKUCode("");
          setDescription("");
          setPackof("");
          setParentSKU("");
          setGroup1("");
          setGroup2("");
          setGroup3("");
          setSizeRange("");
          setSize("");
          setUnit("");
          setSellerSKUcode("");
          setBarcode("");
          setSellingPrice("");
          setMRP("");
          setImg("");
        })
        .catch((error) => {
          console.error("Error sending PUT request:", error);
          toast.error("Failed to update item: " + error.response.data.message);
          // Restore the previous value of suppliers in case of error
          setSuppliers(currentSuppliers);
        });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      jsonData.forEach((item) => {
        let formData = {
          skucode: item.skucode,
          description: item.description,
          packOf: item.packOf,
          parentSKU: item.parentSKU,
          group1: item.group1,
          group2: item.group2,
          group3: item.group3,
          sizeRange: item.sizeRange,
          size: item.size,
          unit: item.unit,
          barcode: item.barcode,
          sellingPrice: item.sellingPrice,
          mrp: item.mrp,
          sellerSKUCode: item.sellerSKUCode,
          img: item.img,
          userEmail: user.email,
        };

        // Fetch supplier based on supplier name
        axios
          .get(`${apiUrl}/supplier/name/${item.supplierName}`, {
            withCredentials: true,
          })
          .then((response) => {
            console.log("response data for supplier = " + response.data);
            if (response.data.length === 0) {
              toast.error("Supplier not found with name: " + item.supplierName);
              return;
            }
            console.log("response data  = " + response.data);
            // Add suppliers to formData
            formData.suppliers = [response.data];

            // Post formData
            axios
              .post(`${apiUrl}/item/supplier`, formData, {
                withCredentials: true,
              })
              .then((response) => {
                console.log("POST request successful:", response);
                toast.success("Item added successfully", {
                  autoClose: 2000, // Close after 2 seconds
                });

                // Update the state with the new API data
                setApiData((prevApiData) => [...prevApiData, response.data]);
              })
              .catch((error) => {
                console.error("Error sending POST request:", error);
                toast.error(
                  "Failed to add item: " +
                    (error.response?.data?.message || error.message)
                );
              });
          })
          .catch((error) => {
            console.error("Error fetching supplier:", error);
            toast.error(
              "Failed to fetch supplier: " +
                (error.response?.data?.message || error.message)
            );
          });
      });
    };

    reader.readAsBinaryString(file);
  };

  const fetchSupplier = async (supplierName, phone) => {
    try {
      const response = await axios.get(
        `${apiUrl}/supplier/${supplierName}/${phone}`,
        { withCredentials: true }
      );
      console.log("Supplier fetched successfully:", response.data);
      return [response.data]; // Return an array with the supplier
    } catch (error) {
      console.error("Error fetching supplier:", error);
      throw error;
    }
  };

  const postData = async (data) => {
    try {
      const response = await axios.post(`${apiUrl}/item/supplier`, data, {
        withCredentials: true,
      });
      console.log("Data posted successfully:", response);
      setApiData((prevData) => [...prevData, response.data]);
      toast.success("Item added successfully");
    } catch (error) {
      console.error("Error posting data:", error);
      toast.error("Failed to add item");
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        skucode: "",
        description: "",
        packOf: "",
        parentSKU: "",
        group1: "",
        group2: "",
        group3: "",
        sizeRange: "",
        size: "",
        unit: "",
        barcode: "",
        sellingPrice: "",
        mrp: "",
        sellerSKUCode: "",
        img: "",
        supplierName: "",
        phone: "",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    }

    saveAs(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
      "itemTemplate.xlsx"
    );
  };

  const handleParentSKUChange = (event) => {
    setParentSKU(event.target.value); // Update the parent SKU value
  };

  const handleDelete = (id) => {
    console.log("Deleting row with id:", id);
    // Remove the row from the table

    axios
      .delete(`${apiUrl}/item/supplier/${id}`, { withCredentials: true })
      .then((response) => {
        // Handle success response
        console.log("Row deleted successfully.");
        toast.success("Item deleted successfully", {
          autoClose: 2000, // Close after 2 seconds
        });
        setApiData((prevData) => prevData.filter((row) => row.itemId !== id));
      })
      .catch((error) => {
        // Handle error
        console.error("Error deleting row:", error);
        toast.error("Failed to delete item: " + error.response.data.message);
      });
    console.log("After deletion, apiData:", apiData);
  };

  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create an array of data for the Excel sheet
    const data = currentItems.map((item) => ({
      Supplier: item.suppliers
        .map((supplier) => supplier.supplierName)
        .join(", "),
      SKUCode: item.skucode || "",
      Description: item.description || "",
      PackOf: item.packOf || "",
      ParentSKU: item.parentSKU || "",
      Group1: item.group1 || "",
      Group2: item.group2 || "",
      Group3: item.group3 || "",
      SizeRange: item.sizeRange || "",
      Size: item.size || "",
      Unit: item.unit || "",
      SellerSKUCode: item.sellerSKUCode || "",
      Barcode: item.barcode || "",
      SellingPrice: item.sellingPrice || "",
      MRP: item.mrp || "",
      ImageURL: item.img || "",
    }));

    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items");

    // Export the workbook
    XLSX.writeFile(workbook, "items.xlsx");
  };

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="title">
        <h1>Item</h1>
      </div>

      <Accordion defaultExpanded>
        <AccordionSummary
          className="acc-summary"
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: "#E5E7E9" }}
        >
          <h4>Item Form</h4>
        </AccordionSummary>
        <AccordionDetails>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>
                  Supplier <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Select
                  required
                  onChange={(e) => handleSupplierChange(e, e.target.value)}
                  value={Supplier} // Change 'supplier' to 'Supplier'
                >
                  <option value="">Select Supplier</option>
                  {suppliersList.map((supplier) => (
                    <option
                      key={supplier.supplierId}
                      value={supplier.supplierName}
                    >
                      {supplier.supplierName}
                    </option>
                  ))}
                </Form.Select>
                <Link to="/Supplier" target="_blank">
                  <span
                    style={{
                      float: "right",
                      fontSize: "small",
                      marginTop: "1%",
                      marginRight: "1%",
                    }}
                  >
                    + add supplier
                  </span>
                </Link>
                <IoIosRefresh
                  onClick={handleRefresh}
                  className={
                    isRotating ? "refresh-icon rotating" : "refresh-icon"
                  }
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>
                  SKUCode <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="SKUCode"
                  defaultValue=""
                  value={skucode}
                  onChange={(e) => setSKUCode(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>
                  Description <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Description"
                  defaultValue=""
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Packof</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Packof"
                  defaultValue=""
                  value={packOf}
                  onChange={(e) => setPackof(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>ParentSKU</Form.Label>

                <Form.Select
                  required
                  onChange={(e) => handleParentSKUChange(e, e.target.value)}
                  value={parentSKU} // Change 'supplier' to 'Supplier'
                >
                  <option value="">Select Parent SKU Code</option>
                  {uniqueSKUCodes.map((item) => (
                    <option key={item.itemId} value={item.parentSKU}>
                      {item}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Group1</Form.Label>
                <input
                  className="form-control"
                  list="uniqeGroup1"
                  onChange={(e) => setGroup1(e.target.value)}
                  placeholder="Group 1"
                  value={group1}
                />
                <datalist id="uniqeGroup1">
                  {uniqueGroup1.map((op) => (
                    <option key={op}>{op}</option>
                  ))}
                </datalist>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Group2</Form.Label>
                <input
                  className="form-control"
                  list="uniqeGroup2"
                  onChange={(e) => setGroup2(e.target.value)}
                  placeholder="Group 2"
                  value={group2}
                />
                <datalist id="uniqeGroup2">
                  {uniqueGroup2.map((op) => (
                    <option key={op}>{op}</option>
                  ))}
                </datalist>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Group3</Form.Label>
                <input
                  className="form-control"
                  list="uniqeGroup3"
                  onChange={(e) => setGroup3(e.target.value)}
                  placeholder="Group 3"
                  value={group3}
                />
                <datalist id="uniqeGroup3">
                  {uniqueGroup3.map((op) => (
                    <option key={op}>{op}</option>
                  ))}
                </datalist>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>SizeRange</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="SizeRange"
                  defaultValue=""
                  value={sizeRange}
                  onChange={(e) => setSizeRange(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Size</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Size"
                  defaultValue=""
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Unit</Form.Label>
                <input
                  className="form-control"
                  list="uniqueUnit"
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Unit"
                  value={unit}
                />
                <datalist id="uniqueUnit">
                  {uniqueUnit.map((op) => (
                    <option key={op}>{op}</option>
                  ))}
                </datalist>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>
                  Seller/Supplier SKUcode{" "}
                  <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Seller/Supplier SKUcode"
                  defaultValue=""
                  value={sellerSKUCode}
                  onChange={(e) => setSellerSKUcode(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Barcode</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Barcode"
                  defaultValue=""
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>SellingPrice</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="SellingPrice"
                  defaultValue=""
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>MRP</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="MRP"
                  defaultValue=""
                  value={mrp}
                  onChange={(e) => setMRP(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Image URL"
                  value={img}
                  onChange={(e) => setImg(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                {img && (
                  <div>
                    <img
                      src={img}
                      alt="item image"
                      style={{ width: "30%", height: "10%", margin: "1%" }}
                    />
                  </div>
                )}
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
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
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
          <h4>List View of Item</h4>
        </AccordionSummary>
        <AccordionDetails>
          {apiData && (
            <div style={{ overflowX: "auto" }}>
              <Table striped bordered hover className="custom-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>
                      Supplier
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by supplier"
                          value={searchTermSupplier}
                          onChange={(e) =>
                            setSearchTermSupplier(e.target.value)
                          }
                        />
                      </span>
                    </th>
                    <th>
                      SKU Code
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by SKUCode"
                          value={searchTermSKUCode}
                          onChange={(e) => setSearchTermSKUCode(e.target.value)}
                        />
                      </span>
                    </th>
                    <th>
                      Description
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by Description"
                          value={searchTermDescription}
                          onChange={(e) =>
                            setSearchTermDescription(e.target.value)
                          }
                        />
                      </span>
                    </th>
                    <th>
                      Pack Of
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by Pack of"
                          value={searchTermPackOf}
                          onChange={(e) => setSearchTermPackOf(e.target.value)}
                        />
                      </span>
                    </th>
                    <th>
                      Parent SKU
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by Parent SKUCode"
                          value={searchTermParentSKU}
                          onChange={(e) =>
                            setSearchTermParentSKU(e.target.value)
                          }
                        />
                      </span>
                    </th>
                    <th>
                      Group 1
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by group1"
                          value={searchTermGroup1}
                          onChange={(e) => setSearchTermGroup1(e.target.value)}
                        />
                      </span>
                    </th>
                    <th>
                      Group 2
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by group2"
                          value={searchTermGroup2}
                          onChange={(e) => setSearchTermGroup2(e.target.value)}
                        />
                      </span>
                    </th>
                    <th>
                      Group 3
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by group3"
                          value={searchTermGroup3}
                          onChange={(e) => setSearchTermGroup3(e.target.value)}
                        />
                      </span>
                    </th>
                    <th>
                      Size Range
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by size range"
                          value={searchTermSizeRange}
                          onChange={(e) =>
                            setSearchTermSizeRange(e.target.value)
                          }
                        />
                      </span>
                    </th>
                    <th>
                      Size
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by Size"
                          value={searchTermSize}
                          onChange={(e) => setSearchTermSize(e.target.value)}
                        />
                      </span>
                    </th>
                    <th>
                      Unit
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by Unit"
                          value={searchTermUnit}
                          onChange={(e) => setSearchTermUnit(e.target.value)}
                        />
                      </span>
                    </th>
                    <th>
                      Seller SKU Code
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by Seller SKUCode"
                          value={searchTermSellerSKU}
                          onChange={(e) =>
                            setSearchTermSellerSKU(e.target.value)
                          }
                        />
                      </span>
                    </th>
                    <th>
                      Barcode
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by Barcode"
                          value={searchTermBarcode}
                          onChange={(e) => setSearchTermBarcode(e.target.value)}
                        />
                      </span>
                    </th>
                    <th>
                      Selling Price
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by Selling Price"
                          value={searchTermSellingPrice}
                          onChange={(e) =>
                            setSearchTermSellingPrice(e.target.value)
                          }
                        />
                      </span>
                    </th>
                    <th>
                      MRP
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by MRP"
                          value={searchTermMRP}
                          onChange={(e) => setSearchTermMRP(e.target.value)}
                        />
                      </span>
                    </th>
                    <th>
                      Image URL
                      <span style={{ margin: "0 10px" }}>
                        <input
                          type="text"
                          placeholder="Search by img-url"
                          value={searchTermImg}
                          onChange={(e) => setSearchTermImg(e.target.value)}
                        />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.itemId} onClick={() => handleRowClick(item)}>
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
                            handleDelete(item.itemId); // Call handleDelete function
                          }}
                        >
                          <DeleteIcon style={{ color: "#F00" }} />
                        </button>
                      </td>
                      <td>
                        {/* Check if item.suppliers is defined and not null */}
                        {item.suppliers && item.suppliers.length > 0
                          ? // If item.suppliers is defined and not null and has a length greater than 0, map through each supplier
                            item.suppliers.map((supplier) => (
                              // Displaying the supplierName for each supplier
                              <div key={supplier.supplierId}>
                                {supplier.supplierName}
                              </div>
                            ))
                          : // If item.suppliers is undefined, null, or has a length of 0, render an empty string
                            ""}
                      </td>

                      <td>{item.skucode ? item.skucode : ""}</td>
                      <td>{item.description ? item.description : ""}</td>
                      <td>{item.packOf ? item.packOf : ""}</td>
                      <td>{item.parentSKU ? item.parentSKU : ""}</td>
                      <td>{item.group1 ? item.group1 : ""}</td>
                      <td>{item.group2 ? item.group2 : ""}</td>
                      <td>{item.group3 ? item.group3 : ""}</td>
                      <td>{item.sizeRange ? item.sizeRange : ""}</td>
                      <td>{item.size ? item.size : ""}</td>
                      <td>{item.unit ? item.unit : ""}</td>
                      <td>{item.sellerSKUCode ? item.sellerSKUCode : ""}</td>
                      <td>{item.barcode ? item.barcode : ""}</td>
                      <td>{item.sellingPrice ? item.sellingPrice : ""}</td>
                      <td>{item.mrp ? item.mrp : ""}</td>
                      <td>{item.img ? item.img : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
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

export default Item;
