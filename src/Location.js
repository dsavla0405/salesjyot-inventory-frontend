import React, { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import * as XLSX from "xlsx"; // Library for exporting Excel
import "bootstrap/dist/css/bootstrap.min.css";
import DeleteIcon from "@mui/icons-material/Delete";
import Pagination from "react-bootstrap/Pagination";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useDispatch, useSelector } from "react-redux";

function LocationForm() {
  const user = useSelector((state) => state.user); // Access user data from Redux store

  const [validated, setValidated] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [apiData, setApiData] = useState([]);
  const [rowSelected, setRowSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermLocationName, setSearchTermLocationName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPageOptions = [10, 20, 50]; // Customize the number of items per page
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const apiUrl = process.env.REACT_APP_API_URL;

  const fileInputRef = useRef();
  const [excelData, setExcelData] = useState([]);
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

  const filteredData = apiData.filter((location) => {
    return (
      location.locationName &&
      location.locationName
        .toLowerCase()
        .includes(searchTermLocationName.toLowerCase())
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/locations/user/email`, {
        params: { email: user.email },
        withCredentials: true,
      })
      .then((response) => setApiData(response.data))
      .catch((error) => console.error(error));
  }, [user]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (excelData.length > 0) {
      excelData.forEach((row) => {
        {
          row.userEmail = user.email;
        }
        postData(row);
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      setExcelData([]);
      return; // Don’t proceed with manual form if Excel prese
    }

    if (!locationName) {
      toast.error("Location name is required");
      event.stopPropagation();
      setValidated(true);
      return;
    }

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const formData = { locationName, userEmail: user.email };

    if (rowSelected && selectedItem) {
      axios
        .put(`${apiUrl}/api/locations/${selectedItem.locationId}`, formData, {
          withCredentials: true,
        })
        .then((response) => {
          toast.success("Location updated successfully");
          setApiData((prevData) =>
            prevData.map((item) =>
              item.locationId === selectedItem.locationId ? response.data : item
            )
          );
          resetForm();
        })
        .catch((error) =>
          toast.error(`Failed to update location: ${error.message}`)
        );
    } else {
      axios
        .post(`${apiUrl}/api/locations`, formData, { withCredentials: true })
        .then((response) => {
          toast.success("Location added successfully");
          setApiData([...apiData, response.data]);
          resetForm();
        })
        .catch((error) =>
          toast.error(`Failed to add location: ${error.message}`)
        );
    }
  };

  const resetForm = () => {
    setLocationName("");
    setValidated(false);
    setRowSelected(false);
    setSelectedItem(null);
  };

  const handleRowSubmit = () => {
    console.log("handleRowSubmit triggered");
    console.log(selectedItem);
    if (!locationName) {
      toast.error("Location name is required");
      return;
    }
    if (rowSelected && selectedItem) {
      const formData = {
        locationName,
      };
      console.log("form data: ", formData);
      console.log("id: ", selectedItem.locationId);
      axios
        .put(`${apiUrl}/api/locations/${selectedItem.locationId}`, formData, {
          withCredentials: true,
        })
        .then((response) => {
          console.log("PUT request successful:", response);
          toast.success("Supplier updated successfully", {
            autoClose: 2000, // Close after 2 seconds
          });
          setApiData((prevData) =>
            prevData.map((item) =>
              item.locationId === selectedItem.locationId ? response.data : item
            )
          ); // Update the specific item

          setValidated(false);
          setRowSelected(false);
          setLocationName("");
        })
        .catch((error) => {
          console.error("Error sending PUT request:", error);
          toast.error(
            "Failed to update supplier: " + error.response.data.message
          );
        });
    }
  };

  const handleRowClick = (location) => {
    setLocationName(location.locationName);
    setRowSelected(true);
    setSelectedItem(location);
  };

  const handleDelete = (id) => {
    axios
      .delete(`${apiUrl}/api/locations/${id}`, { withCredentials: true })
      .then(() => {
        toast.success("Location deleted successfully");
        setApiData((prevData) =>
          prevData.filter((location) => location.locationId !== id)
        );
      })
      .catch((error) =>
        toast.error(`Failed to delete location: ${error.message}`)
      );
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(apiData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
    XLSX.writeFile(workbook, "Locations.xlsx");
  };

  // Download template for importing
  const downloadTemplate = () => {
    const templateData = [{ locationName: "" }];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "LocationTemplate.xlsx");
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
          const hasMissing = !item.locationName;
          if (hasMissing) invalidRows.push(rowNumber);

          return { locationName: item.locationName };
        })
        .filter((row) => row !== null);

      if (invalidRows.length > 0) {
        toast.error(
          `Mandatory field  (Location) is missing in rows: ${invalidRows.join(
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
      //     locationName: item.locationName,
      //     userEmail: user.email,
      //   };
      //   console.log(formattedData);
      //   postData(formattedData);
      // });
    };

    reader.readAsBinaryString(file);
  };

  const postData = (data) => {
    axios
      .post(`${apiUrl}/api/locations`, data, { withCredentials: true })
      .then((response) => {
        console.log("Data posted successfully:", response);
        toast.success("Location added successfully.");
        setApiData((prevData) => [...prevData, response.data]);
      })
      .catch((error) => {
        console.error("Error posting data:", error);
      });
  };

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="title">
        <h1>Location </h1>
      </div>

      <Accordion defaultExpanded>
        <AccordionSummary
          className="acc-summary"
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ backgroundColor: "#E5E7E9" }}
        >
          <h4>Location Form</h4>
        </AccordionSummary>
        <AccordionDetails>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>
                  Location Name <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Location Name"
                  name="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <div className="buttons">
              {rowSelected ? (
                <Button id="edit" onClick={handleRowSubmit}>
                  Edit
                </Button>
              ) : (
                <Button id="submit" type="submit" onClick={handleSubmit}>
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
          id="panel-header"
          sx={{ backgroundColor: "#E5E7E9" }}
        >
          <h4>List View of Locations</h4>
        </AccordionSummary>
        <AccordionDetails>
          <Form.Control
            type="text"
            placeholder="Search Locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />

          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>
                  <SwapVertIcon
                    style={{ cursor: "pointer", marginRight: "2%" }}
                    variant="link"
                    onClick={() => requestSort("locationName")}
                  ></SwapVertIcon>
                  Location Name
                  <span style={{ margin: "0 10px" }}>
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={searchTermLocationName}
                      onChange={(e) =>
                        setSearchTermLocationName(e.target.value)
                      }
                    />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((location) => (
                <tr
                  key={location.locationId}
                  onClick={() => handleRowClick(location)}
                >
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
                        handleDelete(location.locationId); // Call handleDelete function
                      }}
                    >
                      <DeleteIcon style={{ color: "#F00" }} />
                    </button>
                  </td>
                  <td>{location.locationName}</td>
                </tr>
              ))}
            </tbody>
          </Table>
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

export default LocationForm;
