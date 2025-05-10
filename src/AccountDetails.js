import React from "react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Button } from "react-bootstrap";
import { useMemo } from "react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
const AccountDetails = () => {
  const [validated, setValidated] = useState(false);
  const user = useSelector((state) => state.user); // Access user data from Redux store

  const [FirstName, LastName] = useMemo(() => {
    const parts = (user.name || "").split(" ");
    return [parts[0] || "", parts[1] || ""];
  }, [user.name]);

  const [PhoneNumber, setPhoneNumber] = useState("");
  const [CompanyName, setCompanyName] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${apiUrl}/loggedInUser/getDetails`, {
          params: { email: user.email },
          withCredentials: true,
        });
        // setDetails({
        //   phone: response.data.phone,
        //   companyName: response.data.companyName,
        // });

        setPhoneNumber(response.data.phone);
        setCompanyName(response.data.companyName);
      } catch (err) {
        console.error("API error:", err);
      }
    };

    fetchUserDetails();
  }, []); // ← Empty array = run once on mount

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false || !PhoneNumber || !CompanyName) {
      event.stopPropagation();
      setValidated(true);
      return;
    } else {
      const formData = {
        email: user.email,
        password: "uwysdfoshd2382573023-49eifhsldj",
        companyName: CompanyName,
        firstName: FirstName,
        lastName: LastName,
        phone: PhoneNumber,
      };

      updateUserDetails(formData);
    }
  };

  const updateUserDetails = async (formData) => {
    try {
      const response = await axios.post(
        `${apiUrl}/loggedInUser/updateDetails`,
        formData,
        {
          withCredentials: true,
        }
      );
      toast.success("Details updated successfully", { autoClose: 2000 });
    } catch (error) {
      toast.error(
        "Failed to update details: " + error.response?.data?.message ||
          error.message
      );
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      {/* AccountDetails:{user.email} */}
      <div className="title">
        <h1>Personsal Details</h1>
      </div>
      <Form noValidate validated={validated}>
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="Emailid">
            <Form.Label>Email ID </Form.Label>
            <Form.Control
              type="text"
              placeholder="Email Id"
              // defaultValue=""
              readOnly
              value={user.email}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="Firstname">
            <Form.Label>First Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="First Name"
              // defaultValue=""
              value={FirstName}
              readOnly
              // onChange={(e) => setFirstName(e.target.value)}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="4" controlId="Lastname">
            <Form.Label>Last Name </Form.Label>
            <Form.Control
              type="text"
              placeholder="Last Name"
              // defaultValue=""
              value={LastName}
              readOnly
              // onChange={(e) => setLastName(e.target.value)}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="4" controlId="Phonenumber">
            <Form.Label>Phone Number:</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Phone Number"
              // defaultValue=""
              value={PhoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="4" controlId="Companyname">
            <Form.Label>Company Name:</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Company Name"
              // defaultValue=""
              value={CompanyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <div>
          <Button type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
};

export default AccountDetails;
