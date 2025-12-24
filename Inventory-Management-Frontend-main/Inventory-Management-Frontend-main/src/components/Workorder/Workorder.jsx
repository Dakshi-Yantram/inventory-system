import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import "./WorkOrder.css";

export default function WorkOrder({ ipAddress }) {
  const navigate = useNavigate();   // ✅ FIX
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!ipAddress) return;

    axios
      .get(`http://${ipAddress}/workorder`)
      .then((res) => {
        setRows(res.data || []);
      })
      .catch((err) => console.error("WORK ORDER ERROR:", err));
  }, [ipAddress]);

  const columns = [
    { field: "wo_id", headerName: "WO ID", width: 120 },
    { field: "product_name", headerName: "Product Name", width: 200 },
    { field: "planned_qty", headerName: "Planned Qty", width: 130 },
    { field: "completed_qty", headerName: "Completed Qty", width: 150 },
    { field: "bom_id", headerName: "BOM ID", width: 240 },
    { field: "status", headerName: "Status", width: 140 },
    {
      field: "created_at",
      headerName: "Created Date",
      width: 150,
      valueGetter: (params) =>
        params.value
          ? new Date(params.value).toLocaleDateString()
          : "",
    },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      renderCell: () => (
        <Button variant="outlined" size="small">
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "#eef5ff",
          borderRadius: "6px",
          marginBottom: "12px",
        }}
      >
        <h2 style={{ margin: 0 }}>Work Order Page</h2>

        <Button
          variant="contained"
          onClick={() => navigate("/work-order/create")}
        >
          + CREATE WORK ORDER
        </Button>
      </div>

      {/* TABLE */}
      <div className="page-card" style={{ height: 420 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          disableRowSelectionOnClick
        />
      </div>
    </>
  );
}
