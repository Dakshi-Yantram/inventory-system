import React, { useEffect, useState } from "react";
import axios from "axios";

function BomHistory({ ipAddress }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`http://${ipAddress}/bom-history/1`)
      .then(res => setHistory(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>BOM Change History</h2>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Part</th>
            <th>Old Qty</th>
            <th>New Qty</th>
            <th>Type</th>
            <th>User</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {history.map((h, i) => (
            <tr key={i}>
              <td>{h.part_id}</td>
              <td>{h.old_qty}</td>
              <td>{h.new_qty}</td>
              <td>{h.change_type}</td>
              <td>{h.changed_by}</td>
              <td>{new Date(h.changed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BomHistory;
