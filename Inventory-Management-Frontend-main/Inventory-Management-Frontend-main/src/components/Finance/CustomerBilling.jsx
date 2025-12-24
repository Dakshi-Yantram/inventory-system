import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CustomerBilling() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/finance/customer-billing")
      .then(res => res.json())
      .then(res => setData(res.data || []));
  }, []);

  return (
    <div className="page-container">
      <h3>Customer Billing</h3>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => navigate("/finance/customer-billing/add")}
      >
        + Add Billing
      </Button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>PO</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5">No records</td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i}>
                <td>{row.customer_id}</td>
                <td>{row.customer_po}</td>
                <td>{row.qty}</td>
                <td>{row.amount}</td>
                <td>{row.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
