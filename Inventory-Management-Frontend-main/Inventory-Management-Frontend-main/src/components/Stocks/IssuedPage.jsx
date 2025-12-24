import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

function IssuedPage({ setRawMaterialPages }) {

  const [issuedType, setIssuedType] = useState("");

  return (
    <div className="raw-material-form-container">

      {/* HEADER */}
      <div className="raw-material-add-div">
        <h1>Issued</h1>

        <Button
          variant="contained"
          onClick={() => setRawMaterialPages(0)}
        >
          Back
        </Button>
      </div>

      {/* DROPDOWN */}
      <div style={{ marginTop: "40px" }}>
        <TextField
          select
          label="Select Issued Type"
          value={issuedType}
          onChange={(e) => setIssuedType(e.target.value)}
          sx={{ width: 300 }}
        >
          <MenuItem value="Walk-in">Walk-in</MenuItem>
          <MenuItem value="Verbal">Verbal</MenuItem>
            <MenuItem value="P/O No. Issued By Yantram">P/O No.</MenuItem>
        </TextField>
      </div>

    </div>
  );
}

export default IssuedPage;
