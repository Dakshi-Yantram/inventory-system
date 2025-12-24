import React, { useState } from "react";
import { TextField, Button, Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function WorkOrderCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    project_name: "",
    order_qty: "",
    available_stock: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 CORE LOGIC (boss ka rule)
  const calculateWOQty = () => {
    const order = Number(form.order_qty);
    const stock = Number(form.available_stock);

    if (stock >= order) return 0;
    if (stock > 0) return order - stock;
    return order;
  };

  const woQty = calculateWOQty();

  const submitWO = () => {
    alert(`Work Order will be created for ${woQty} units`);
    navigate("/work-order");
  };

  return (
    <Paper className="page-container" sx={{ p: 3, maxWidth: 500 }}>

      {/* 🔙 BACK BUTTON */}
      <Button
        variant="text"
        onClick={() => navigate("/work-order")}
        sx={{ mb: 1 }}
      >
        ← Back to Work Orders
      </Button>

      <h3>Create Work Order</h3>

      <TextField
        label="Project / Device Name"
        name="project_name"
        onChange={handleChange}
        fullWidth
        margin="dense"
      />

      <TextField
        label="Customer Order Quantity"
        name="order_qty"
        type="number"
        onChange={handleChange}
        fullWidth
        margin="dense"
      />

      <TextField
        label="Available Stock"
        name="available_stock"
        type="number"
        onChange={handleChange}
        fullWidth
        margin="dense"
      />

      <p style={{ marginTop: 10 }}>
        👉 <b>Work Order Qty:</b> {woQty}
      </p>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={submitWO}
          disabled={woQty === 0}
        >
          CREATE WORK ORDER
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate("/work-order")}
        >
          Cancel
        </Button>
      </Stack>
    </Paper>
  );
}
