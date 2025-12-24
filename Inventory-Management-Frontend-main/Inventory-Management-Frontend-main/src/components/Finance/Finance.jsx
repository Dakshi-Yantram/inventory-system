import React, { useEffect, useState } from "react";
import { Button, Stack, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Finance() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/finance/summary")
      .then(res => res.json())
      .then(setSummary);
  }, []);

  return (
    <div className="page-container">
      <h2>Finance Dashboard</h2>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" onClick={() => navigate("/finance/customer-billing")}>
          Customer Billing
        </Button>
        <Button variant="contained" onClick={() => navigate("/finance/vendor-payments")}>
          Vendor Payments
        </Button>
        <Button variant="contained" onClick={() => navigate("/finance/expenses")}>
          Expenses
        </Button>
        <Button variant="outlined" onClick={() => navigate("/finance/summary")}>
          Finance Summary
        </Button>
      </Stack>

      {summary && (
        <Stack direction="row" spacing={3}>
          <Paper sx={{ p: 2 }}>Revenue: ₹{summary.revenue}</Paper>
          <Paper sx={{ p: 2 }}>Expenses: ₹{summary.expenses}</Paper>
          <Paper sx={{ p: 2 }}>Profit: ₹{summary.profit}</Paper>
        </Stack>
      )}
    </div>
  );
}
