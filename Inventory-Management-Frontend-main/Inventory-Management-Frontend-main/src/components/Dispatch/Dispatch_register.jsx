import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

export default function Dispatch_register({ ipAddress }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get(`http://${ipAddress}/dispatch/register`)
      .then((res) => {
        console.log("DISPATCH REGISTER API 👉", res.data);
        setRows(res.data.data || []);
      })
      .catch((err) => console.error("API ERROR ❌", err));
  }, [ipAddress]);

  const columns = [
    { field: "customer_po", headerName: "Customer PO", width: 160 },
    { field: "customer_id", headerName: "Customer", width: 150 },
    { field: "total_units", headerName: "Total Units", width: 120 },
    {
      field: "dispatch_date",
      headerName: "Dispatch Date",
      width: 200,
      valueGetter: (p) =>
        p.value ? new Date(p.value).toLocaleString() : ""
    }
  ];

  return (
    <div style={{ height: 400 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row, i) => i}
        pageSize={10}
      />
    </div>
  );
}
