import React from "react";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function VendorPayments() {
  const navigate = useNavigate();

  return (
    <div className="page-container">

      {/* 🔙 BACK BUTTON */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <h3>Vendor Payments</h3>
      <p>Vendor invoice & payment tracking</p>
    </div>
  );
}
