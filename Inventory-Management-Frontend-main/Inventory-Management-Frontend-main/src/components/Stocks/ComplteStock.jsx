// ComplteStock.js
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Checkbox,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import AddIcon from "@mui/icons-material/Add";

import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

import "./CompleteStock.css";
import CompleteStockForm from "./CompleteStockForm";

/* -------------------------------------------------------------------
     GOOGLE STYLE CATEGORY FILTER (Autocomplete + Checkbox)
-------------------------------------------------------------------- */

const CategoryHeaderFilter = ({ value, onChange }) => {
  return (
    <Autocomplete
      multiple
      size="small"
      options={[
        "Material Form",
        "Semi Finished",
        "Finished Goods",
        "Stationery",
      ]}
      disableCloseOnSelect

      // ✅ YE LINE ADD KARNI HAI
      filterOptions={(options, state) =>
        options.filter((opt) =>
          opt.toLowerCase().startsWith(state.inputValue.toLowerCase())
        )
      }

      value={value}
      onChange={(e, newValue) => onChange(newValue)}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox checked={selected} sx={{ mr: 1 }} />
          {option}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} placeholder="Filter Category" />
      )}
      sx={{ minWidth: 180 }}
    />
  );
};


/* -------------------------------------------------------------------
     MAIN STOCK COMPONENT
-------------------------------------------------------------------- */

function ComplteStock({ ipAddress, onCategorySelect }) {
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedViewCategory, setSelectedViewCategory] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [completeStockPages, setCompleteStockPages] = useState(0);
  const [completestockdata, setCompletestockdata] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [materialHistory, setMaterialHistory] = useState([]);


  useEffect(() => {
    getCompleteStockFormData();
  }, []);

  async function getCompleteStockFormData() {
    try {
      const response = await axios.get(`http://localhost:3000/getcompletestockdata`);
      setCompletestockdata(response.data?.data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleCategoryHeaderFilter = (list) => {
    setCategoryFilter(list);

    if (list.length === 1) {
      setSelectedViewCategory(list[0]); // ✅ THIS ENABLES BUTTON
    } else {
      setSelectedViewCategory(null);    // ❌ disable if 0 or 2+
    }
  };



  const handleDeleteMaterial = async () => {
    if (!selectedRow) {
      alert("Select a row first!");
      return;
    }

    console.log("DELETING STOCK ID:", selectedRow.stock_id);

    try {
      await axios.delete(
        `http://localhost:3000/deleteMaterial/${selectedRow.stock_id}`
      );
      alert("Deleted successfully!");
      getCompleteStockFormData();
      setSelectedRow(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };



  const handleMaterialClick = async (partId) => {
    try {
      const res = await axios.get(`http://localhost:3000/materialHistory/${partId}`);
      setMaterialHistory(res.data || []);
      setHistoryOpen(true);
    } catch (error) {
      console.log("Error loading history:", error);
    }
  };

  const filteredRows =
    categoryFilter.length === 0
      ? completestockdata
      : completestockdata.filter((row) =>
        categoryFilter.some(
          (c) =>
            row.category?.toLowerCase() === c.toLowerCase()
        )
      );


  return (
    <div className="complete-stock-container">
      {completeStockPages === 1 ? (
        <CompleteStockForm
          setCompleteStockPages={setCompleteStockPages}
          ipAddress={ipAddress}
        />
      ) : (
        <div className="complete-stock-home-container">
          {/* HEADER */}
          <div
            className="raw-material-add-div"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <h1>Available Stock</h1>

            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                variant="outlined"
                disabled={!selectedViewCategory}
                onClick={() => onCategorySelect(selectedViewCategory)}
              >
                {selectedViewCategory
                  ? `View ${selectedViewCategory}`
                  : "Select category to view"}
              </Button>
              <Button variant="contained" onClick={() => setCompleteStockPages(1)}>
                <AddIcon /> Add / Receive Material
              </Button>
              <Button variant="contained" color="warning" disabled={!selectedRow} onClick={handleDeleteMaterial}>
                Issue Material
              </Button>
            </div>
          </div>

          {/* TABLE */}
          <div className="complete-stock-dashboard" style={{ overflow: "visible" }}>
            <div style={{ height: 470, width: "100%" }}>
              <DataGrid
                checkboxSelection
                rows={filteredRows}
                getRowId={(row) => row.id}
                onRowSelectionModelChange={(ids) => {
                  const id = ids?.[0];
                  const row = filteredRows.find((r) => r.id === id);
                  setSelectedRow(row || null);
                }}
                columns={[
                  { field: "stock_id", width: 90, headerName: "Stock ID" },

                  {
                    field: "submit_date",
                    width: 130,
                    headerName: "Stock Received",
                    valueGetter: (params) =>
                      params.row.submit_date ? params.row.submit_date.split("T")[0] : "-",
                  },

                  { field: "stock_material_id", width: 140, headerName: "Storage Location" },

                  {
                    field: "material_name",
                    headerName: "Material Name",
                    width: 200,
                    renderCell: (params) => (
                      <span
                        style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => handleMaterialClick(params.row.part_id)}
                      >
                        {params.value}
                      </span>
                    ),
                  },

                  { field: "invoice_number", width: 140, headerName: "Invoice Number" },

                  {
                    field: "invoice_date",
                    width: 130,
                    headerName: "Invoice Date",
                    valueGetter: (params) =>
                      params.row.invoice_date ? params.row.invoice_date.split("T")[0] : "-",
                  },

                  { field: "opening_stock", width: 130, headerName: "Opening Stock" },

                  {
                    field: "received_qty",
                    width: 150,
                    headerName: "Received Qty",
                    valueGetter: (params) =>
                      params.row.MRID === null ? params.row.received_qty : "-",
                  },

                  { field: "approved_qty", width: 150, headerName: "Issued Quantity" },

                  { field: "closing_balance", width: 150, headerName: "Closing Balance" },


                  {
                    field: "category",
                    headerName: "Item Category",
                    width: 220,
                    sortable: false,
                    renderHeader: () => (
                      <CategoryHeaderFilter
                        value={categoryFilter}
                        onChange={handleCategoryHeaderFilter}
                      />

                      // />
                    ),


                  }
                ]}
                headerHeight={70}   // ⭐ ADD THIS
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    overflow: "visible",
                  },
                  "& .MuiDataGrid-columnHeader": {
                    overflow: "visible",
                  },
                }}
              />
              {categoryFilter.length > 1 && (
                <div
                  style={{
                    padding: "6px 12px",
                    fontSize: 13,
                    color: "#555",
                    background: "#f5f7fb",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  🔹 Showing {categoryFilter.length} categories together
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY POPUP */}
      <Dialog open={historyOpen} fullWidth maxWidth="lg" onClose={() => setHistoryOpen(false)}>
        <DialogTitle>Material History</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Opening</TableCell>
                <TableCell>Closing</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {materialHistory.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {row.invoice_date
                      ? new Date(row.invoice_date).toLocaleDateString()
                      : new Date(row.request_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{row.invoice_number || "-"}</TableCell>
                  <TableCell>{row.ProjectName || "-"}</TableCell>
                  <TableCell>{row.requested_by || "-"}</TableCell>
                  <TableCell>{row.opening_stock}</TableCell>
                  <TableCell>{row.closing_balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ComplteStock;
