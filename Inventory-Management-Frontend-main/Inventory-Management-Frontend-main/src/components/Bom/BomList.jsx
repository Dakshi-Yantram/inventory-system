import React, { useEffect, useState } from "react";
import axios from "axios";

function BomList({ ipAddress }) {
  const [bom, setBom] = useState([]);

  useEffect(() => {
    axios
      .get(`http://${ipAddress}/bom`)
      .then((res) => {
        console.log("🔥 BOM API RESPONSE:", res.data);
        setBom(res.data.data);   // ✅ IMPORTANT
      })
      .catch(console.error);
  }, [ipAddress]);

  return (
    <table border="1" width="100%">
      <thead>
        <tr>
          <th>BOM ID</th>
          <th>LOT ID</th>
        </tr>
      </thead>

      <tbody>
        {bom && bom.length > 0 ? (
          bom.map((row, i) => (
            <tr key={i}>
              <td>{row.bom_id}</td>
              <td>{row.lot_id}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="2">No BOM Data</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default BomList;
