import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

export default function SerialNumbers({ ipAddress }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`http://${ipAddress}/serial-numbers`)
      .then((res) => {
        console.log("SERIAL API DATA:", res.data);
        setRows(res.data.data || []);
      })
      .catch((err) => console.error(err));
  }, [ipAddress]);

  const columns = [
    { field: "serial_no", headerName: "Serial No", width: 180 },
    { field: "work_order_id", headerName: "Work Order", width: 120 },
    { field: "bom_id", headerName: "BOM ID", width: 160 },
    { field: "lot_id", headerName: "Lot ID", width: 180 },
    { field: "customer_id", headerName: "Customer", width: 140 },
    { field: "customer_po", headerName: "Customer PO", width: 140 },
    {
      field: "manufacturing_date",
      headerName: "MFG Date",
      width: 130,
      valueGetter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : "",
    },
    { field: "status", headerName: "Status", width: 120 },
  ];

  return (
    <div style={{ height: 420 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}   // 🔥 VERY IMPORTANT
        pageSize={10}
        rowsPerPageOptions={[10, 25]}
      />
    </div>
  );
}
