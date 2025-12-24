import React, { useState } from "react";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CustomerForm({ ipAddress }) {
  const navigate = useNavigate();   // 👈 YAHAN AATA HAI

  const [form, setForm] = useState({
    customer_name: "",
    address: "",
    gst_number: "",
    pan_number: "",
    contact_person: "",
    phone_number: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `http://${ipAddress}/customer/add`,
        form
      );

      alert("Customer Created: " + res.data.customer_code);

      // ✅ SAVE ke baad CUSTOMER LIST khol do
      navigate("/customer");

    } catch (err) {
      alert("Error saving customer");
    }
  };

  return (
    <>
      <TextField
        label="Customer Name"
        name="customer_name"
        onChange={handleChange}
        fullWidth
        margin="dense"
      />

      <TextField
        label="Address"
        name="address"
        onChange={handleChange}
        fullWidth
        margin="dense"
      />

      <TextField
        label="GST Number"
        name="gst_number"
        onChange={handleChange}
        fullWidth
        margin="dense"
      />

      <TextField
        label="PAN Number"
        name="pan_number"
        onChange={handleChange}
        fullWidth
        margin="dense"
      />

      <TextField
        label="Contact Person"
        name="contact_person"
        onChange={handleChange}
        fullWidth
        margin="dense"
      />

      <TextField
        label="Phone Number"
        name="phone_number"
        onChange={handleChange}
        fullWidth
        margin="dense"
      />

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSubmit}
      >
        SAVE CUSTOMER
      </Button>
    </>
  );
}
