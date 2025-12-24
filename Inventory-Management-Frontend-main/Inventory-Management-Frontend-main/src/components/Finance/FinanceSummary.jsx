import React, { useEffect, useState } from "react";
import { Paper, Stack } from "@mui/material";

export default function FinanceSummary() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/finance/summary")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="page-container">
      <h3>Finance Summary</h3>

      <Stack spacing={2} sx={{ maxWidth: 400 }}>
        <Paper sx={{ p: 2 }}>Total Revenue: ₹{data.revenue}</Paper>
        <Paper sx={{ p: 2 }}>Total Expenses: ₹{data.expenses}</Paper>
        <Paper sx={{ p: 2 }}>Pending Customer Payments: ₹{data.pendingCustomers}</Paper>
        <Paper sx={{ p: 2 }}>Pending Vendor Payments: ₹{data.pendingVendors}</Paper>
        <Paper sx={{ p: 2, fontWeight: "bold" }}>
          Net Profit: ₹{data.profit}
        </Paper>
      </Stack>
    </div>
  );
}
