// =================== FULL UPDATED CODE ===================

import React, { useState, useReducer, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { createFilterOptions } from "@mui/material/Autocomplete";


// ---------- DIGIT LIMIT FUNCTION ----------
const allowOnly7Digits = (value) => {
  let v = value.replace(/\D/g, "");
  if (v === "0") return "";
  v = v.replace(/^0+/, "");
  return v.slice(0, 7);
};

// ---------- MATERIAL TYPES ----------
const TYPE_OPTIONS = ["Capacitor", "Resistor", "IC", "Diode", "Transistor"];

// ---------- REDUCER ----------
const initialState = { isSubmitted: false, isLoading: false, error: null };

const formReducer = (state, action) => {
  switch (action.type) {
    case "SUBMIT_FORM":
      return { ...state, isLoading: true, error: null };
    case "SUBMIT_SUCCESS":
      return { ...state, isSubmitted: true, isLoading: false, error: null };
    case "SUBMIT_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

// ---------- TYPE SHORT CODE ----------
const getTypeCode = (type) => {
  const map = {
    Capacitor: "CAP",
    Resistor: "RES",
    IC: "IC",
    Diode: "DIO",
    Transistor: "TRA",
  };
  return map[type] || type?.substring(0, 3)?.toUpperCase() || "";
};

// ---------- FILE NAME FORMAT ----------
const formatFileName = (fileName) => {
  if (!fileName) return "";
  let clean = fileName.replace(/[()]/g, "").trim();
  if (clean.length <= 25) return clean;
  const ext = clean.split(".").pop();
  return clean.substring(0, 20) + "... " + ext;
};

// =============================================================
// ===================== RAW MATERIAL FORM =====================
// =============================================================
export default function RawMaterialForm({
  setRawMaterialPages,
  ipAddress,
  refreshData
}) {

  const [poNumber, setPoNumber] = useState("");
  const [showQRPage, setShowQRPage] = useState(false);
  const [batchLotId, setBatchLotId] = useState("");
  const pageName = "Material Form";   // sirf UI ke liye
  const [category, setCategory] = useState("");
  const [state, dispatch] = useReducer(formReducer, initialState);
  // ---------- STATES ----------
  const [batchNo, setBatchNo] = useState("");
  const [materialType, setMaterialType] = useState(null);
  const [packageType, setPackageType] = useState("");
  const [valueName, setValueName] = useState("");

  const [materialId, setMaterialId] = useState("");

  const [rawmaterialName, setRawMaterialName] = useState("");
  const [materialCategory, setMaterialCategory] = useState("");
  const [storageLocation, setStorageLocation] = useState(null);

  const [rawmaterialBarcode, setRawMaterialBarcode] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  const [formValues, setFormValues] = useState("");
  const [packageDetails, setPackageDetails] = useState("");
  const [description, setDescription] = useState("");
  const [generatedId, setGeneratedId] = useState("");

  const [issuedType, setIssuedType] = useState("");

  const [qtyOrdered, setQtyOrdered] = useState("");
  const [orderedDate, setOrderedDate] = useState("");
  const [poDate, setPoDate] = useState("");

  const [qtyReceived, setQtyReceived] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [lotDate, setLotDate] = useState("");

  const [qtyAccepted, setQtyAccepted] = useState("");
  const [qtyAcceptedDate, setQtyAcceptedDate] = useState("");

  const [supplier, setSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  const [invoiceFile, setInvoiceFile] = useState(null);
  const [poFile, setPoFile] = useState(null);

  const [quantityError, setQuantityError] = useState("");
  const [showRemarkBox, setShowRemarkBox] = useState(false);
  const [remark, setRemark] = useState("");

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [usageType, setUsageType] = useState("");
  // ---------- AUTO GENERATE MATERIAL ID ----------
  // ---------- AUTO GENERATE BATCH NUMBER ----------
  useEffect(() => {
    if (!category || !ipAddress) return;

    axios
      .get(`http://${ipAddress}/rawmaterial/preview-batch`, {
        params: { category }
      })
      .then((res) => {
        console.log("BATCH PREVIEW 👉", res.data);
        setBatchNumber(res.data.batchNo);
      })
      .catch(console.error);

  }, [category, ipAddress]);








  // ---------- AUTO BARCODE ----------
  // useEffect(() => {
  //   if (materialId) setRawMaterialBarcode(materialId);
  // }, [materialId]);

  // ---------- FETCH SUPPLIERS ----------
  // useEffect(() => {
  //   if (!ipAddress) return;

  //   axios.get(`http://${ipAddress}/suppliers`)
  //     .then((res) => {
  //       const list =
  //         res.data?.data ||
  //         res.data?.suppliers ||
  //         (Array.isArray(res.data) ? res.data : []);

  //       console.log("SUPPLIERS:", list); // 👈 debug

  //       setSuppliers(list); // ✅ THIS WAS MISSING
  //     })
  //     .catch(() => setSuppliers([]));
  // }, [ipAddress]);
  useEffect(() => {
    if (!ipAddress) return;

    axios.get(`http://${ipAddress}/suppliers`)
      .then(res => {
        console.log("SUPPLIERS 👉", res.data.data);
        setSuppliers(res.data.data);
      })
      .catch(() => setSuppliers([]));
  }, [ipAddress]);




  // ---------- FETCH CATEGORY ----------
  useEffect(() => {
    if (!ipAddress) return;
    axios
      .get(`http://${ipAddress}/rawmaterial/category`)
      .then((res) => setCategoryOptions(res.data.data || []))
      .catch(() => setCategoryOptions([]));
  }, [ipAddress]);
  useEffect(() => {
    if (!batchNumber || !materialType || !packageType || !valueName) {
      setMaterialId("");
      return;
    }

    const typeCode = getTypeCode(materialType);
    const formatValue = (val) => {
      if (!val) return "";

      return val
        .toUpperCase()
        .replace("UF", "U")
        .replace("NF", "N")
        .replace("PF", "P")
        .replace(/\s/g, "");
    };

    const formattedValue = formatValue(valueName);

    setMaterialId(
      `${batchNumber}${typeCode}${packageType}${formattedValue}`
    );
  }, [batchNumber, materialType, packageType, valueName]);


  // =============================================================
  // =============== UPDATED QUANTITY VALIDATION =================
  // =============================================================
  useEffect(() => {
    let error = "";

    const o = Number(qtyOrdered || 0);
    const r = Number(qtyReceived || 0);
    const a = Number(qtyAccepted || 0);

    if (!qtyOrdered || o <= 0) error = "Quantity Ordered must be > 0";
    else if (!qtyReceived || r <= 0) error = "Quantity Received must be > 0";
    else if (!qtyAccepted || a <= 0) error = "Quantity Accepted must be > 0";

    const mismatch =
      qtyOrdered &&
      qtyReceived &&
      qtyAccepted &&
      (o !== r || r !== a);

    setShowRemarkBox(!error && mismatch);
    setQuantityError(error);
  }, [qtyOrdered, qtyReceived, qtyAccepted]);

  useEffect(() => {
    if (!materialId || !supplier?.vendor_code || !orderedDate) {
      setBatchLotId("");
      return;
    }

    setBatchLotId(
      `${materialId}-${supplier.vendor_code}-${orderedDate.replaceAll("-", "")}`
    );
  }, [materialId, supplier, orderedDate]);





  const data = {
    material_id: materialId,
    batch_lot_id: batchLotId,   // 🔥 ADD THIS
    supplier_id: supplier,      // 🔥 vendor_id save hoga

    material_type: materialType,
    category: materialCategory,
    barcode_no: materialId,

    issued_type: issuedType,
    quantity_ordered: qtyOrdered,
    ordered_date: orderedDate,
    received_qty: qtyReceived,
    received_date: receivedDate,
    accepted_qty: qtyAccepted,
    accepted_date: qtyAcceptedDate,

    description,
    remark,
  };

  // ---------- PRINT QR ----------
  const handlePrintQR = () => {
    if (!rawmaterialBarcode) return alert("No QR found.");
    const win = window.open("", "_blank");
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${rawmaterialBarcode}`;
    win.document.write(`
      <html>
      <body style="text-align:center; margin-top:40px;">
        <h3>Material QR Code</h3>
        <img src="${qrSrc}" />
        <p>${rawmaterialBarcode}</p>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };
  const filterOptions = createFilterOptions({
    stringify: (option) =>
      `${option.supplier_name || option.name} ${option.vendor_id}`,
    trim: true,
  });

  // =============================================================
  // ========================= SUBMIT ============================
  // =============================================================
  const handelRawMaterialFormSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "SUBMIT_FORM" });

    // ---------- VALIDATIONS ----------
    // if (!rawmaterialName.trim()) {
    //   dispatch({ type: "SUBMIT_ERROR", payload: "Material Name Required" });
    //   return;
    // }

    if (quantityError) {
      dispatch({ type: "SUBMIT_ERROR", payload: quantityError });
      return;
    }

    if (showRemarkBox && !remark.trim()) {
      dispatch({
        type: "SUBMIT_ERROR",
        payload: "Reason of mismatch is required",
      });
      return;
    }
    // ================= ADD CATEGORY IF NEW =================
    if (
      category &&
      !categoryOptions.some(
        (c) => c.category_name?.toLowerCase() === category.toLowerCase()
      )
    ) {
      console.log("🆕 NEW CATEGORY DETECTED:", category);

      await axios.post(`http://${ipAddress}/category/add`, {
        category_name: category,
        prefix: category.substring(0, 2).toUpperCase()
      });

      // refresh category list (important!)
      const res = await axios.get(`http://${ipAddress}/rawmaterial/category`);
      setCategoryOptions(res.data.data || []);
    }


    // ---------- DATA ----------
    const data = {
      material_id: materialId,
      material_name: rawmaterialName,
      material_type: materialType,
      category: materialCategory,

      values: formValues,
      package: packageDetails || packageType,

      barcode_no: materialId, // 🔥 barcode same as materialId

      issued_type: issuedType,

      quantity_ordered: qtyOrdered,
      ordered_date: orderedDate,

      received_qty: qtyReceived,
      received_date: receivedDate,

      accepted_qty: qtyAccepted,
      accepted_date: qtyAcceptedDate,

      supplier_name: supplier,
      description,
      remark,
    };

    const formData = new FormData();

    // ===== BASIC IDENTIFIERS =====
    formData.append("material_id", materialId);
    formData.append("batch_no", batchNumber);
    formData.append("material_name", rawmaterialName);

    formData.append("material_type", materialType);

    formData.append("category", String(category));
    // Raw/Semi/Finished
    formData.append("material_group", materialCategory); // Electronic etc
    formData.append("storage_location", storageLocation);

    formData.append("material_value", valueName);
    formData.append("package", packageType);
    formData.append("barcode_no", materialId);

    formData.append("issued_type", issuedType);
    formData.append("supplier_id", supplier?.id || "");
    formData.append("supplier_name", supplier?.name || "");
    formData.append("po_number", poNumber || "");

    formData.append("po_date", poDate || "");

    formData.append("quantity_ordered", qtyOrdered);
    formData.append("received_qty", qtyReceived);
    formData.append("received_date", receivedDate);
    formData.append("accepted_qty", qtyAccepted);
    formData.append("accepted_date", qtyAcceptedDate);

    formData.append("description", description || "");
    formData.append("remark", remark || "");

    // if (invoiceFile) formData.append("invoice_file", invoiceFile);
    // if (poFile) formData.append("po_file", poFile);

    // ---------- SUBMIT ----------
    try {
      console.log("🚀 API CALL START");

      const res = await axios.post(
        `http://${ipAddress}/rawmaterial/add`,
        formData,
        { timeout: 10000 } // ⏱ 10 sec max wait
      );

      console.log("✅ API SUCCESS:", res.data);

      dispatch({ type: "SUBMIT_SUCCESS" });

      setRawMaterialBarcode(materialId);
      setShowQRPage(true);

      if (refreshData) refreshData();

    } catch (err) {
      console.error("❌ API ERROR FULL:", err);

      dispatch({
        type: "SUBMIT_ERROR",
        payload:
          err.code === "ECONNABORTED"
            ? "Server not responding (timeout)"
            : err.response?.data?.message || "Save Failed",
      });
    }


  };
  // ================= QR SUCCESS PAGE =================
  if (showQRPage) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Material Added Successfully</h2>

        <QRCodeCanvas value={rawmaterialBarcode} size={180} />

        <p style={{ marginTop: 10 }}>{rawmaterialBarcode}</p>

        <div style={{ marginTop: 20 }}>
          <Button variant="contained" onClick={handlePrintQR}>
            Print / Save QR
          </Button>
        </div>

        <div style={{ marginTop: 20 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowQRPage(false);
              setRawMaterialPages(0);
            }}
          >
            Back to Stock
          </Button>
        </div>
      </div>
    );
  }


  // =============================================================
  // ============================ UI =============================
  // =============================================================
  return (
    <div style={{ padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h1>Material Form</h1>



          <div style={{ display: "flex", gap: 10 }}>
            <Button
              variant="outlined"
              size="small"
              href="/sample-files/raw-material-sample.xlsx"
              target="_blank"
            >
              📥 Sample Excel
            </Button>

            <Button variant="contained" onClick={() => setRawMaterialPages(0)}>
              Back
            </Button>
          </div>
        </div>


        <form onSubmit={handelRawMaterialFormSubmit}>
          {/* All UI same — not removing anything */}

          {/* ID Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px 220px 180px 180px 300px",
              gap: 12,
              marginTop: 40,
              alignItems: "center",
            }}
          >
            <TextField
              label="Batch Number"
              value={batchNumber}   // 👈 MUST
              InputProps={{ readOnly: true }}
              fullWidth
            />



            {/* <Autocomplete
              freeSolo
              options={categoryOptions}
              getOptionLabel={(opt) =>
                typeof opt === "string" ? opt : opt.category_name
              }
              onChange={(e, v) => {
                if (!v) return;

                // existing category
                if (typeof v === "object") {
                  setCategory(v.category_name);
                }
                // new typed category
                else {
                  setCategory(v);
                }
              }}
              onInputChange={(e, value) => {
                setCategory(value); // 👈 allow typing
              }}
              renderInput={(params) => (
                <TextField {...params} label="Category *" />
              )}
            /> */}
            <Autocomplete
              size="small"
              options={[
                "Raw Material",
                "Semi Finished",
                "Finished Goods",
                "Stationery",
              ]}
              value={category}
              onChange={(e, newValue) => {
                if (newValue) setCategory(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category *"
                  placeholder="Select Category"
                />
              )}
            />




            <Autocomplete
              options={["Capacitor", "Resistor", "IC", "Diode", "Transistor"]}
              value={materialType}
              onChange={(e, v) => setMaterialType(v)}
              renderInput={(params) => (
                <TextField {...params} label="Material Type" />
              )}
            />



            <TextField
              label="Package (0805)"
              required
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
              sx={{ width: 180 }}
            />

            <TextField
              label="Value (10uF)"
              required
              value={valueName}
              onChange={(e) => setValueName(e.target.value)}
              sx={{ width: 180 }}
            />

            <TextField
              label="Part ID"
              value={materialId}
              InputProps={{ readOnly: true }}
            />


          </div>
          <TextField
            label="Batch / LOT ID"
            value={batchLotId}
            InputProps={{ readOnly: true }}
            sx={{ width: "100%", marginTop: 3 }}
          />
          {/* DESCRIPTION */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 260px  1fr",
              gap: 12,
              marginTop: 18,
              alignItems: "center",
            }}
          >
            {/* <Autocomplete
              freeSolo
              options={categoryOptions.map((c) => c.category)}
              value={materialCategory || ""}
              onInputChange={(e, v) => setMaterialCategory(v || "")}
              renderInput={(params) => (
                <TextField {...params} label="Category" />
              )}
            /> */}



            <Autocomplete
              size="small"
              options={[
                "Main Store",
                "Store-A / Rack-1",
                "Store-B / Rack-3",
                "Assembly Area",
                "Audit Room",
              ]}
              value={storageLocation}
              onChange={(e, v) => setStorageLocation(v)}
              renderInput={(params) => (
                <TextField {...params} label="Storage Location *" />
              )}
              sx={{ width: 260 }}
            />

            <TextField
              label="Package Details"
              value={packageDetails}
              onChange={(e) => setPackageDetails(e.target.value)}
            />
            {/* <TextField
              label="Material Name"
              value={rawmaterialName}
              onChange={(e) => setRawMaterialName(e.target.value)}
              required
            /> */}

            <TextField
              label="Description"
              multiline
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ width: 400 }}
            />
          </div>
          <TextField
            select
            label="Usage Type"
            value={usageType}
            onChange={(e) => setUsageType(e.target.value)}
            sx={{ width: 220, marginTop: 3 }}
          >
            <MenuItem value="One Time">One Time</MenuItem>
            <MenuItem value="Recurring">Recurring</MenuItem>
          </TextField>


          {/* ISSUED TYPE */}
          {/* ================= P/O SECTION ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 220px 160px 220px",
              gap: 16,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {/* Issued Type */}
            <TextField
              select
              label="Issued Type"
              value={issuedType}
              onChange={(e) => setIssuedType(e.target.value)}
              fullWidth
            >
              <MenuItem value="Walk-in">Walk-in</MenuItem>
              <MenuItem value="Verbal">Verbal</MenuItem>
              <MenuItem value="P/O No. Issued By Yantram">
                P/O No. Issued By Yantram
              </MenuItem>
            </TextField>

            {/* P/O Number */}
            <TextField
              label="P/O Number"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              disabled={issuedType !== "P/O No. Issued By Yantram"}
              fullWidth
            />

            {/* Upload P/O */}
            <Button
              variant="outlined"
              component="label"
              disabled={issuedType !== "P/O No. Issued By Yantram"}
              sx={{ height: 40 }}
            >
              Upload P/O
              <input
                type="file"
                hidden
                onChange={(e) => setPoFile(e.target.files[0])}
              />
            </Button>

            {/* P/O Date */}
            <TextField
              type="date"
              label="P/O Date"
              InputLabelProps={{ shrink: true }}
              value={poDate}
              onChange={(e) => setPoDate(e.target.value)}
              disabled={issuedType !== "P/O No. Issued By Yantram"}
              fullWidth
            />


            {/* Supplier (next row aligned) */}
            {/* <Autocomplete
              options={suppliers}
              value={supplier}
              getOptionLabel={(opt) => opt?.name || ""}
              isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
              onChange={(e, v) => setSupplier(v)}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {option.name} ({option.vendor_code})
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Supplier" />
              )}
            /> */}

            <Autocomplete
              options={suppliers}
              value={supplier}
              isOptionEqualToValue={(opt, val) => opt.id === val?.id}
              getOptionLabel={(opt) => opt?.name || ""}
              onChange={(e, v) => setSupplier(v)}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {option.name} ({option.vendor_code})
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Supplier" />
              )}
            />





            <TextField
              label="Vendor ID"
              value={supplier?.vendor_code || ""}
              InputProps={{ readOnly: true }}
            />


            {/* 
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Supplier" />
            )}
             */}

            {/* Attached file name */}
            {poFile && (
              <div
                style={{
                  gridColumn: "3 / span 2",
                  background: "#eef3ff",
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={poFile.name}
              >
                📄 P/O Attached: {poFile.name}
              </div>
            )}
          </div>


          {/* QUANTITY SECTION */}
          <h3 style={{ marginTop: 20 }}>Quantity Details</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 20 }}>
              <TextField
                label="Qty Ordered"
                value={qtyOrdered}
                onChange={(e) => setQtyOrdered(allowOnly7Digits(e.target.value))}
                sx={{ width: 220 }}
              />
              <TextField
                type="date"
                label="Ordered Date"
                InputLabelProps={{ shrink: true }}
                sx={{ width: 220 }}
                value={orderedDate}
                onChange={(e) => setOrderedDate(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 20 }}>
              <TextField
                label="Qty Received"
                value={qtyReceived}
                onChange={(e) => setQtyReceived(allowOnly7Digits(e.target.value))}
                sx={{ width: 220 }}
              />
              <TextField
                type="date"
                label="Received Date"
                InputLabelProps={{ shrink: true }}
                sx={{ width: 220 }}
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 20 }}>
              <TextField
                label="Qty Accepted"
                value={qtyAccepted}
                onChange={(e) => setQtyAccepted(allowOnly7Digits(e.target.value))}
                sx={{ width: 220 }}
              />
              <TextField
                type="date"
                label="Accepted Date"
                InputLabelProps={{ shrink: true }}
                sx={{ width: 220 }}
                value={qtyAcceptedDate}
                onChange={(e) => setQtyAcceptedDate(e.target.value)}
              />
            </div>
          </div>

          {/* INVOICE UPLOAD */}
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12 }}>
            <Button variant="outlined" component="label">
              Upload Invoice
              <input type="file" hidden onChange={(e) => setInvoiceFile(e.target.files[0])} />
            </Button>

            {invoiceFile && (
              <div style={{ background: "#e8fff2", padding: "6px 10px", borderRadius: 6 }}>
                📄 <b>Invoice Attached:</b> {formatFileName(invoiceFile.name)}
              </div>
            )}
          </div>

          {/* REMARK BOX */}
          {showRemarkBox && (
            <TextField
              label="Reason for mismatch"
              multiline
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              sx={{ width: 350, marginTop: 16 }}
              required
            />
          )}

          {/* STATUS */}
          <div style={{ marginTop: 16 }}>
            {state.error && <div style={{ color: "red" }}>{state.error}</div>}
            {state.isSubmitted && <div style={{ color: "green" }}>Saved Successfully!</div>}
          </div>

          {/* SUBMIT */}
          <div style={{ marginTop: 16 }}>
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </div>
        </form>
      </div >
    </div >
  );
}

// =================== END COMPLETE UPDATED FILE ===================
