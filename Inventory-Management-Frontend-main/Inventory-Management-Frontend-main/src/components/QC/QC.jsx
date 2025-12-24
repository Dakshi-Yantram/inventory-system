import React, { useEffect, useState } from "react";
import { Button, Stack, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./QC.css";

export default function QC() {
  const navigate = useNavigate();
  const [qcType, setQcType] = useState("RAW");
  const [data, setData] = useState([]);

  const fetchQC = (type) => {
    fetch(`http://localhost:3000/qc/list/${type}`)
      .then(res => res.json())
      .then(res => setData(res.data || []));
  };

  useEffect(() => {
    fetchQC(qcType);
  }, [qcType]);

  return (
    <div className="page-container">
      <Paper elevation={3} className="qc-card">
        <h2>QC Dashboard</h2>

        <Stack direction="row" spacing={2} className="qc-actions">
          <Button onClick={() => navigate("/qc/raw")} variant="contained">Raw Material QC</Button>
          <Button onClick={() => navigate("/qc/inprocess")} variant="contained">In-Process QC</Button>
          <Button onClick={() => navigate("/qc/final")} variant="contained">Final Product QC</Button>
        </Stack>

        <Stack direction="row" spacing={2} className="qc-actions">
          <Button onClick={() => setQcType("RAW")}>RAW</Button>
          <Button onClick={() => setQcType("INPROCESS")}>IN-PROCESS</Button>
          <Button onClick={() => setQcType("FINAL")}>FINAL</Button>
        </Stack>

        <h3>{qcType} QC Records</h3>

        <table className="qc-table">
          <thead>
            <tr>
              <th>Reference ID</th>
              <th>Observation</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" align="center">No QC records found</td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i}>
                  <td>{row.reference_id}</td>
                  <td>{row.observation}</td>
                  <td className={row.status === "PASS" ? "pass" : "fail"}>
                    {row.status}
                  </td>
                  <td>{row.remarks}</td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Paper>
    </div>
  );
}
