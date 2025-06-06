import { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import "bootstrap/dist/css/bootstrap.min.css";
import Table from "react-bootstrap/Table";
import "./Item.css";
import Header from "./Header";
import * as XLSX from "xlsx";
import axios from "axios";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Pagination from "react-bootstrap/Pagination";
import { saveAs } from "file-saver";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useDispatch, useSelector } from "react-redux";

function Storage() {
  const user = useSelector((state) => state.user); // Access user data from Redux store

  const apiUrl = process.env.REACT_APP_API_URL;
  const fileInputRef = useRef();
  const [excelData, setExcelData] = useState([]);
  const [validated, setValidated] = useState(false);
  const [binNumber, setBin] = useState("");
  const [rackNumber, setRack] = useState("");
  const [skucode, setSkucode] = useState("");
  const [qty, setQty] = useState("");
  const [apiData, setApiData] = useState([]);
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [skuList, setSkuList] = useState([]);
  const [searchTermRack, setSearchTermRack] = useState("");
  const [searchTermBin, setSearchTermBin] = useState("");
  const [searchTermSKU, setSearchTermSKU] = useState("");
  const [searchTermQty, setSearchTermQty] = useState("");
  const [itemImg, setItemImg] = useState("");
  const [locations, setLocations] = useState([]);
  const [searchTermLocation, setSearchTermLocation] = useState("");
  const [location, setLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const rowsPerPageOptions = [10, 20, 50];
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

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

  const filteredData = apiData.filter((supplier) => {
    return (
      supplier.binNumber &&
      supplier.binNumber.toLowerCase().includes(searchTermBin.toLowerCase()) &&
      supplier.rackNumber &&
      supplier.rackNumber
        .toLowerCase()
        .includes(searchTermRack.toLowerCase()) &&
      supplier.skucode &&
      supplier.skucode.toLowerCase().includes(searchTermSKU.toLowerCase()) &&
      (searchTermQty === null ||
        searchTermQty === "" ||
        (supplier.qty &&
          supplier.qty.toLowerCase().includes(searchTermQty.toLowerCase()))) &&
      (!searchTermLocation ||
        (supplier.location &&
          supplier.location.locationName
            .toLowerCase()
            .includes(searchTermLocation.toLowerCase())))
    );
  });

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

  const postData = (data) => {
    axios
      .post(`${apiUrl}/storage`, data, { withCredentials: true })
      .then((response) => {
        // Handle successful response
        console.log("Data posted successfully hereeee in 131:", response.data);
      })
      .catch((error) => {
        // Handle error
        console.error("Error posting data:", error);
      });
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
          const rowNumber = index + 2;
          const hasMissing = !item.skucode;
          if (hasMissing) invalidRows.push(rowNumber);

          return {
            binNumber: item.binNumber,
            rackNumber: item.rackNumber,
            skucode: item.skucode,
            qty: item.qty,
            userEmail: user.email,
            location: item.location,
          };
        })
        .filter((row) => row !== null);

      if (invalidRows.length > 0) {
        toast.error(
          `Mandatory fields (skucode) is missing in rows: ${invalidRows.join(
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

      // jsonData.forEach((item) => {
      //   const formattedData = {
      //     binNumber: item.binNumber,
      //     rackNumber: item.rackNumber,
      //     skucode: item.skucode,
      //     qty: item.qty,
      //     userEmail: user.email,
      //     // location: item.location,
      //   };
      //   axios
      //     .get(`${apiUrl}/api/locations/name/${item.location}`, {
      //       params: { email: user.email },
      //       withCredentials: true,
      //     })
      //     .then((response) => {
      //       const loc = response.data;
      //       formattedData.location = loc;
      //     });
      //   // Fetch item details using skucode
      //   axios
      //     .get(`${apiUrl}/item/supplier/search/skucode/${item.skucode}`, {
      //       params: { email: user.email },
      //       withCredentials: true,
      //     })
      //     .then((response) => {
      //       // Check if item exists
      //       if (!response.data || response.data.length === 0) {
      //         console.error("Item not found with SKU code: " + item.skucode);
      //         return;
      //       }

      //       console.log("found item with skucode: " + item.skucode);

      //       // Extract item from response data
      //       const fetchedItem = response.data;

      //       // Construct formData with fetched item in the items list
      //       const formData = {
      //         ...formattedData,
      //         items: [fetchedItem], // Add the fetched item to an items array
      //       };

      //       console.log("Form data:", formData);

      //       // Send data to server
      //       axios
      //         .post(`${apiUrl}/storage`, formData, {
      //           withCredentials: true,
      //         })
      //         .then((response) => {
      //           console.log("POST request successful:", response);
      //           setApiData([...apiData, response.data]);
      //           toast.success("Data imported successfully", {
      //             autoClose: 2000, // Close after 2 seconds
      //           });
      //         })
      //         .catch((error) => {
      //           console.error("Error sending POST request:", error);
      //           toast.error(
      //             "Failed to import data: " +
      //               (error.response?.data?.message || error.message)
      //           );
      //         });
      //     })
      //     .catch((error) => {
      //       console.error("Error fetching item:", error);
      //     });
      // });
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (excelData.length > 0) {
      excelData.forEach((formattedData) => {
        axios
          .get(`${apiUrl}/api/locations/name/${formattedData.location}`, {
            params: { email: user.email },
            withCredentials: true,
          })
          .then((response) => {
            const loc = response.data;
            formattedData.location = loc;
          });
        // Fetch item details using skucode
        axios
          .get(
            `${apiUrl}/item/supplier/search/skucode/${formattedData.skucode}`,
            {
              params: { email: user.email },
              withCredentials: true,
            }
          )
          .then((response) => {
            // Check if item exists
            if (!response.data || response.data.length === 0) {
              console.error(
                "Item not found with SKU code: " + formattedData.skucode
              );
              return;
            }

            console.log("found item with skucode: " + formattedData.skucode);

            // Extract item from response data
            const fetchedItem = response.data;

            // Construct formData with fetched item in the items list
            const formData = {
              ...formattedData,
              items: [fetchedItem], // Add the fetched item to an items array
            };

            console.log("Form data:", formData);

            // Send data to server
            axios
              .post(`${apiUrl}/storage`, formData, {
                withCredentials: true,
              })
              .then((response) => {
                console.log("POST request successful:", response);
                setApiData([...apiData, response.data]);
                toast.success("Data imported successfully", {
                  autoClose: 2000, // Close after 2 seconds
                });
              })
              .catch((error) => {
                console.error("Error sending POST request:", error);
                toast.error(
                  "Failed to import data: " +
                    (error.response?.data?.message || error.message)
                );
              });
          })
          .catch((error) => {
            console.error("Error fetching item:", error);
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
    } else {
      try {
        // Fetch location
        const locationResponse = await axios.get(
          `${apiUrl}/api/locations/name/${location}`,
          {
            params: { email: user.email },
            withCredentials: true,
          }
        );

        const loc = locationResponse.data; // Now loc should have the correct value
        console.log("loc = ", loc);

        // Fetch item based on supplier and supplier SKU code
        const itemResponse = await axios.get(
          `${apiUrl}/item/supplier/search/skucode/${skucode}`,
          {
            params: { email: user.email },
            withCredentials: true,
          }
        );

        if (itemResponse.data) {
          const itemId = itemResponse.data.itemId;
          const item = itemResponse.data;

          const formData = {
            binNumber,
            rackNumber,
            skucode,
            qty,
            location: loc, // Now this should be correctly populated
            items: [item],
            userEmail: user.email,
          };

          console.log("form data: ", formData);

          // Post storage
          const postResponse = await axios.post(
            `${apiUrl}/storage/${itemId}`,
            formData,
            {
              withCredentials: true,
            }
          );

          console.log("POST request successful 111111:", postResponse.data);
          toast.success("Storage added successfully", { autoClose: 2000 });

          setValidated(false);
          setApiData([...apiData, postResponse.data]);
          setBin("");
          setRack("");
          setSkucode("");
          setQty("");
          setItemImg("");
          setLocation("");
        } else {
          console.error(
            "No item found for the specified supplier and supplier SKU code."
          );
        }
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        toast.error(
          "Failed to add Storage: " +
            (error.response?.data?.message || error.message)
        );
      }
    }

    setValidated(false);
  };

  const handleRowSubmit = async () => {
    const locationResponse = await axios.get(
      `${apiUrl}/api/locations/name/${location}`,
      {
        params: { email: user.email },
        withCredentials: true,
      }
    );

    const loc = locationResponse.data; // Now loc should have the correct value
    // console.log("loc = ", loc);
    console.log("handleRowSubmit triggered");
    console.log(selectedItem);
    if (rowSelected && selectedItem) {
      const formData = {
        binNumber,
        rackNumber,
        skucode,
        qty,
        location: loc,
        userEmail: user.email,
      };
      console.log("------------------------LOcation iss-----" + location);
      console.log("form data: ", formData);
      console.log("id: ", selectedItem.storageId);
      axios
        .put(`${apiUrl}/storage/${selectedItem.storageId}`, formData, {
          withCredentials: true,
        })
        .then((response) => {
          console.log("PUT request successful:", response.data);
          toast.success("Storage updated successfully", {
            autoClose: 2000, // Close after 2 seconds
          });
          setApiData((prevData) =>
            prevData.map((item) =>
              item.storageId === selectedItem.storageId ? response.data : item
            )
          ); // Update the specific item

          setValidated(false);
          setRowSelected(false);
          setBin("");
          setRack("");
          setSkucode("");
          setQty("");
          setLocation("");
        })
        .catch((error) => {
          console.error("Error sending PUT request:", error);
          toast.error(
            "Failed to update Storage: " + error.response.data.message
          );
        });
    }
  };

  const handleRowClick = (storage) => {
    setBin(storage.binNumber);
    setRack(storage.rackNumber);
    setSkucode(storage.skucode);
    setLocation(storage.location.locationName);
    setQty(storage.qty);
    setRowSelected(true);
    setSelectedItem(storage);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase()); // Convert search term to lowercase
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/storage/user/email`, {
        params: { email: user.email },
        withCredentials: true,
      })
      .then((response) => setApiData(response.data))
      .catch((error) => console.error(error));
    console.log("apidata = " + JSON.stringify(apiData));

    axios
      .get(`${apiUrl}/item/supplier/user/email`, {
        params: { email: user.email },
        withCredentials: true,
      }) // Fetch SKU codes and descriptions from the items table
      .then((response) => {
        // Extract SKU codes and descriptions from the response data and filter out null or undefined values
        const skuData = response.data
          .filter((item) => item.skucode && item.description) // Filter out items where skucode or description is null or undefined
          .map((item) => ({
            skucode: item.skucode,
            description: item.description,
          }));
        // Set the SKU data list state
        setSkuList(skuData);
      })
      .catch((error) => console.error(error));

    axios
      .get(`${apiUrl}/api/locations/user/email`, {
        params: { email: user.email },
        withCredentials: true,
      })
      .then((response) => {
        console.log(JSON.stringify(response.data));
        setLocations(response.data);
      });
  }, [user]);

  const downloadTemplate = () => {
    const templateData = [
      { rackNumber: "", binNumber: "", skucode: "", qty: "", location: "" },
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
      "StorageTemplate.xlsx"
    );
  };

  const handleDelete = (id) => {
    console.log("Deleting row with id:", id);
    // Remove the row from the table

    axios
      .delete(`${apiUrl}/storage/${id}`, { withCredentials: true })
      .then((response) => {
        // Handle success response
        console.log("Row deleted successfully.");
        toast.success("Storage deleted successfully", {
          autoClose: 2000, // Close after 2 seconds
        });
        setApiData((prevData) =>
          prevData.filter((row) => row.storageId !== id)
        );
      })
      .catch((error) => {
        // Handle error
        console.error("Error deleting row:", error);
        toast.error("Failed to delete Storage: " + error.response.data.message);
      });

    console.log("After deletion, apiData:", apiData);
  };

  const getImg = (skucode) => {
    axios
      .get(`${apiUrl}/item/supplier/search/skucode/${skucode}`, {
        params: { email: user.email },
        withCredentials: true,
      })
      .then((response) => {
        setItemImg(response.data.img);
      })
      .catch((error) => {
        // Handle error
        console.error("Error getting img:", error);
      });
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
      "StorageData.xlsx"
    );
  };

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="title">
        <h1>Storage</h1>
      </div>

      <Accordion defaultExpanded>
        <AccordionSummary
          className="acc-summary"
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: "#E5E7E9" }}
        >
          <h4>Storage Form</h4>
        </AccordionSummary>
        <AccordionDetails>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Rack No</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Rack No"
                  name="Rack no"
                  value={rackNumber}
                  onChange={(e) => setRack(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>Bin No</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Bin No"
                  name="Bin No"
                  value={binNumber}
                  onChange={(e) => setBin(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>SKUCode</Form.Label>
                <Form.Select
                  required
                  onChange={(e) => {
                    setSkucode(e.target.value); // Update the state with the selected value
                    // Call your additional function here
                    getImg(e.target.value);
                  }}
                  value={skucode}
                >
                  <option value="">Select SKU Code</option>
                  {skuList.map((sku) => (
                    <option key={sku.skucode} value={sku.skucode}>
                      {sku.skucode} - {sku.description}
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
                  name="Quantity"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              {itemImg && (
                <img
                  alt="item image"
                  src={itemImg}
                  className="rotating1"
                  style={{
                    width: "200px",
                    height: "150px",
                    marginTop: "-50px",
                    marginLeft: "100px",
                  }}
                ></img>
              )}
            </Row>

            <Row className="mb-3">
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
          <h4>List View of Storage</h4>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ overflowX: "auto" }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <SwapVertIcon
                      style={{ cursor: "pointer", marginRight: "2%" }}
                      variant="link"
                      onClick={() => requestSort("rackNumber")}
                    ></SwapVertIcon>
                    Rack No
                    <span style={{ margin: "0 10px" }}>
                      <input
                        type="text"
                        placeholder="Search by rack"
                        value={searchTermRack}
                        onChange={(e) => setSearchTermRack(e.target.value)}
                      />
                    </span>
                  </th>
                  <th>
                    <SwapVertIcon
                      style={{ cursor: "pointer", marginRight: "2%" }}
                      variant="link"
                      onClick={() => requestSort("binNumber")}
                    ></SwapVertIcon>
                    Bin No
                    <span style={{ margin: "0 10px" }}>
                      <input
                        type="text"
                        placeholder="Search by bin"
                        value={searchTermBin}
                        onChange={(e) => setSearchTermBin(e.target.value)}
                      />
                    </span>
                  </th>

                  <th>
                    <SwapVertIcon
                      style={{ cursor: "pointer", marginRight: "2%" }}
                      variant="link"
                      onClick={() => requestSort("skucode")}
                    ></SwapVertIcon>
                    SKUCode
                    <span style={{ margin: "0 10px" }}>
                      <input
                        type="text"
                        placeholder="Search by SKU"
                        value={searchTermSKU}
                        onChange={(e) => setSearchTermSKU(e.target.value)}
                      />
                    </span>
                  </th>

                  <th>
                    <SwapVertIcon
                      style={{ cursor: "pointer", marginRight: "2%" }}
                      variant="link"
                      onClick={() => requestSort("qty")}
                    ></SwapVertIcon>
                    Quantity
                    <span style={{ margin: "0 10px" }}>
                      <input
                        type="text"
                        placeholder="Search by qty"
                        value={searchTermQty}
                        onChange={(e) => setSearchTermQty(e.target.value)}
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
                {filteredData.map((storage) => (
                  <tr key={storage.id} onClick={() => handleRowClick(storage)}>
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
                          handleDelete(storage.storageId); // Call handleDelete function
                        }}
                      >
                        <DeleteIcon style={{ color: "#F00" }} />
                      </button>
                    </td>
                    <td>
                      {storage.rackNumber !== null ? storage.rackNumber : ""}
                    </td>
                    <td>
                      {storage.binNumber !== null ? storage.binNumber : ""}
                    </td>
                    <td>{storage.skucode !== null ? storage.skucode : ""}</td>
                    <td>{storage.qty !== null ? storage.qty : ""}</td>{" "}
                    {/* Conditionally render qty */}
                    <td>
                      {storage.location ? storage.location.locationName : ""}
                    </td>
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

export default Storage;
