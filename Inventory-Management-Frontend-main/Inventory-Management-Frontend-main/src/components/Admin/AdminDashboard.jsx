import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://192.168.1.8:3000";

function AdminDashboard() {
  const [stock, setStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [audit, setAudit] = useState([]);

  useEffect(() => {
    axios.get(`${API}/dashboard/stock`).then(res => setStock(res.data));
    axios.get(`${API}/dashboard/lowstock`).then(res => setLowStock(res.data));
    axios.get(`${API}/dashboard/invoices`).then(res => setInvoices(res.data));
    axios.get(`${API}/audit`).then(res => setAudit(res.data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      <h3>📦 Live Stock</h3>
      <table border="1" width="100%">
        <thead><tr><th>Part</th><th>Material</th><th>Stock</th></tr></thead>
        <tbody>
          {stock.map((s, i) => (
            <tr key={i}>
              <td>{s.part_id}</td>
              <td>{s.material_name}</td>
              <td>{s.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>⚠ Low Stock</h3>
      <table border="1" width="100%">
        <thead><tr><th>Part</th><th>Qty</th></tr></thead>
        <tbody>
          {lowStock.map((s, i) => (
            <tr key={i}>
              <td>{s.part_id}</td>
              <td>{s.closing_balance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>🧾 Latest Invoices</h3>
      <table border="1" width="100%">
        <thead><tr><th>Invoice</th><th>Date</th></tr></thead>
        <tbody>
          {invoices.map((i, k) => (
            <tr key={k}>
              <td>{i.invoice_number}</td>
              <td>{i.submit_date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>📋 Audit Trail</h3>
      <table border="1" width="100%">
        <thead><tr><th>User</th><th>Action</th><th>Part</th><th>Time</th></tr></thead>
        <tbody>
          {audit.map((a, k) => (
            <tr key={k}>
              <td>{a.username}</td>
              <td>{a.action}</td>
              <td>{a.part_id}</td>
              <td>{new Date(a.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
