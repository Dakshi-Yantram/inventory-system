import React, { useState } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CustomerBillingAdd() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_id: "",
    customer_po: "",
    qty: "",
    amount: "",
    status: "PAID"
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveBilling = async () => {
    await axios.post(
      "http://localhost:3000/finance/customer-billing/add",
      form
    );

    alert("Billing Added ✅");
    navigate("/finance/customer-billing");
  };

  return (
    <div className="page-container">
      <h3>Add Customer Billing</h3>

      <TextField label="Customer ID" name="customer_id" onChange={handleChange} fullWidth margin="dense" />
      <TextField label="PO Number" name="customer_po" onChange={handleChange} fullWidth margin="dense" />
      <TextField label="Quantity" name="qty" onChange={handleChange} fullWidth margin="dense" />
      <TextField label="Amount" name="amount" onChange={handleChange} fullWidth margin="dense" />

      <TextField
        select
        label="Status"
        name="status"
        value={form.status}
        onChange={handleChange}
        fullWidth
        margin="dense"
      >
        <MenuItem value="PAID">PAID</MenuItem>
        <MenuItem value="PENDING">PENDING</MenuItem>
      </TextField>

      <Button variant="contained" sx={{ mt: 2 }} onClick={saveBilling}>
        SAVE BILLING
      </Button>
    </div>
  );
}
