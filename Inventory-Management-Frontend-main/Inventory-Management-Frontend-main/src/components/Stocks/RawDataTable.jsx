import * as React from "react";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import "./RawMaterial.css";
import { DataGrid } from "@mui/x-data-grid";
import RawMaterialForm from "./RawMaterialForm";
import axios from "axios";
import {
  MenuItem, Select, Autocomplete,
  Checkbox,
  TextField,
} from "@mui/material"; // 👈 upar import hona chahiye

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
      value={value || []}
      onChange={(e, newValue) => {
        const map = {
          "Material Form": "Raw Material",
          "Semi Finished": "Semi Finished",
          "Finished Goods": "Finished Goods",
          "Stationery": "Stationery",
        };


        const mappedValues = newValue.map(v => map[v]);
        onChange(mappedValues);
      }}
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


export default function RawDataTable({ ipAddress, category, goBack, onCategoryChange }) {
  const [rawMaterialPages, setRawMaterialPages] = useState(0);
  const [materialFormData, setMaterialFormData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [issueOpen, setIssueOpen] = useState(false);
  // ===============================
  // FETCH DATA (CATEGORY BASED)
  // ===============================
  useEffect(() => {
    if (!ipAddress || !category) return;
    fetchMaterials();
  }, [ipAddress, category]);

  async function fetchMaterials() {
    try {
      const apiCategory = mapCategoryForAPI(category);

      const res = await axios.get(
        `http://${ipAddress}/rawmaterial/list?category=${encodeURIComponent(apiCategory)}`
      );

      console.log("API DATA:", res.data.data);
      setMaterialFormData(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }
  const mapCategoryForAPI = (cat) => {
    if (cat === "Material Form") return "Raw Material";
    return cat;
  };


  // ===============================
  // CATEGORY OPTIONS
  // ===============================
  const CATEGORY_OPTIONS = [
    "Material Form",
    "Semi Finished",
    "Finished Goods",
    "Stationery",
  ];
  // ===============================
  // FILTER LOGIC (EXCEL STYLE)
  // ===============================
  const filteredRows =
    categoryFilter.length === 0
      ? materialFormData
      : materialFormData.filter((row) =>
        categoryFilter.some(
          (c) =>
            (row.category || "").trim().toLowerCase() ===
            (c || "").trim().toLowerCase()
        )
      );
  // ===============================
  // DELETE
  // ===============================
  const handleDeleteMaterial = async () => {
    console.log("DELETE ROW:", selectedRow);

    if (!selectedRow) {
      alert("Please select a row first");
      return;
    }

    if (!window.confirm("Delete this entry?")) return;

    try {
      await axios.delete(
        `http://${ipAddress}/rawmaterial/delete/${selectedRow.material_id}`
      );


      alert("Deleted successfully");
      fetchMaterials();
      setSelectedRow(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };



  // ===============================
  // STOCK CALCULATION
  // ===============================
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    axios
      .get(`http://${ipAddress}/getcompletestockdata`)
      .then((res) => setStockData(res.data.data || []));
  }, [ipAddress]);

  const latestStock = {};
  stockData.forEach((i) => {
    latestStock[i.stock_material_id] = Math.max(
      latestStock[i.stock_material_id] || 0,
      i.stock_id
    );
  });

  const inStockMap = {};
  stockData
    .filter((i) => i.stock_id === latestStock[i.stock_material_id])
    .forEach((i) => {
      inStockMap[i.material_name] =
        (inStockMap[i.material_name] || 0) + i.closing_balance;
    });

  const instockQtyGetter = (params) =>
    inStockMap[params.row.material_name] || 0;

  // ===============================
  // UI
  // ===============================
  return (
    <div className="raw-material-dashboard">
      {rawMaterialPages === 1 ? (
        <RawMaterialForm
          setRawMaterialPages={setRawMaterialPages}
          ipAddress={ipAddress}
          refreshData={fetchMaterials}

        />
      ) : (
        <>
          <div className="raw-material-add-div">
            <h1>{category}</h1>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>

              {/* ⬅ BACK TO COMPLETE STOCK */}
              <Button
                variant="outlined"
                onClick={goBack}
              >
                ⬅ Complete Stock
              </Button>

              {/* CATEGORY SWITCH */}
              <Autocomplete
                size="small"
                options={[
                  "Material Form",
                  "Semi Finished",
                  "Finished Goods",
                  "Stationery",
                ]}
                value={category}
                filterOptions={(options, state) =>
                  options.filter((opt) =>
                    opt.toLowerCase().startsWith(state.inputValue.toLowerCase())
                  )
                }
                onChange={(e, newValue) => {
                  if (newValue) onCategoryChange(newValue);
                }}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox checked={selected} sx={{ mr: 1 }} />
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select Category" />
                )}
                sx={{ minWidth: 200 }}
              />
              {/* <TextField
                label="Category"
                value={category}
                InputProps={{ readOnly: true }}
                sx={{ minWidth: 200 }}
              /> */}



              {/* RECEIVE */}
              <Button
                variant="contained"
                onClick={() => setRawMaterialPages(1)}
              >
                ➕ Receive {category}
              </Button>

              {/* ISSUE */}
              <Button
                variant="contained"
                color="warning"
                disabled={!selectedRow}
                onClick={async () => {
                  if (!window.confirm("Issue this material?")) return;

                  try {
                    await axios.delete(
                      `http://${ipAddress}/rawmaterial/delete/${selectedRow.material_id}`
                    );
                    alert("Material issued (deleted)");
                    fetchMaterials();   // refresh table
                    setSelectedRow(null);

                  } catch (err) {
                    console.error(err);
                    alert("Issue failed");
                  }
                }}
              >
                ➖ Issue {category}
              </Button>

            </div>
          </div>
          <div style={{ height: 470, width: "100%" }}>
            <DataGrid
              rows={filteredRows}
              getRowId={(row) => row.material_id}
              checkboxSelection
              onRowSelectionModelChange={(ids) => {
                if (!ids || ids.length === 0) {
                  setSelectedRow(null);
                  return;
                }

                const selectedId = ids[0];
                const row = materialFormData.find(
                  (r) => r.material_id === selectedId
                );

                setSelectedRow(row || null);
              }}
              columns={[
                { field: "material_id", width: 140, headerName: "Material ID" },
                { field: "material_name", width: 160, headerName: "Material Name" },
                { field: "material_type", width: 140, headerName: "Material Type" },
                { field: "category", width: 140, headerName: "Category" },
                { field: "material_value", width: 120, headerName: "Value" },
                { field: "package", width: 120, headerName: "Package" },
                { field: "barcode_no", width: 160, headerName: "Barcode" },
                { field: "quantity_ordered", width: 120, headerName: "Qty Ordered" },
                { field: "received_qty", width: 120, headerName: "Qty Received" },
                { field: "received_date", width: 130, headerName: "Received Date" },
                {
                  field: "instock_qty",
                  width: 120,
                  headerName: "In Stock",
                  valueGetter: instockQtyGetter,
                },
                { field: "issued_type", width: 160, headerName: "Issued Type" },
                { field: "supplier_name", width: 160, headerName: "Supplier" },
                { field: "po_date", width: 130, headerName: "PO Date" },
                { field: "accepted_qty", width: 120, headerName: "Accepted Qty" },
                { field: "accepted_date", width: 140, headerName: "Accepted Date" },
                { field: "description", width: 220, headerName: "Description" },
              ]}
              pageSize={25}
              pagination
            />

          </div>
        </>
      )}
    </div>
  );
}
