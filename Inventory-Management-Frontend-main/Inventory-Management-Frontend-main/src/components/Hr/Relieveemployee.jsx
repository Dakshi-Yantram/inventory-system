import React, { useEffect, useState } from "react";
import {
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem
} from "@mui/material";

export default function RelieveEmployee() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employee_id: "",
    relieving_date: "",
    reason: ""
  });
  const [file, setFile] = useState(null);

  // 🔹 Load employee dropdown
  useEffect(() => {
    fetch("http://localhost:3000/hr/employees/list")
      .then(res => res.json())
      .then(res => setEmployees(res.data || []));
  }, []);

  const submitRelieve = async () => {
    if (!form.employee_id || !form.relieving_date || !file) {
      alert("Please fill all required fields");
      return;
    }

    const fd = new FormData();
    fd.append("employee_id", form.employee_id);
    fd.append("relieving_date", form.relieving_date);
    fd.append("reason", form.reason);
    fd.append("resignation", file);

    await fetch("http://localhost:3000/hr/employee/relieve", {
      method: "POST",
      body: fd
    });

    alert("Employee relieved successfully ✅");
  };

  return (
    <Paper elevation={3} style={{ padding: 24, maxWidth: 600 }}>
      <h3>Relieve Employee</h3>

      <Grid container spacing={2}>
        {/* Employee dropdown */}
        <Grid item xs={12}>
          <TextField
            select
            label="Select Employee"
            fullWidth
            size="small"
            value={form.employee_id}
            onChange={e =>
              setForm({ ...form, employee_id: e.target.value })
            }
          >
            <MenuItem value="">Select Employee</MenuItem>
            {employees.map(emp => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.employee_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Relieving date */}
        <Grid item xs={12}>
          <TextField
            label="Date of Relieving"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.relieving_date}
            onChange={e =>
              setForm({ ...form, relieving_date: e.target.value })
            }
          />
        </Grid>

        {/* Reason */}
        <Grid item xs={12}>
          <TextField
            label="Reason for Relieving"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={form.reason}
            onChange={e =>
              setForm({ ...form, reason: e.target.value })
            }
          />
        </Grid>

        {/* Resignation upload */}
        <Grid item xs={12}>
          <Button variant="outlined" component="label" fullWidth>
            Upload Resignation Letter *
            <input
              type="file"
              hidden
              onChange={e => setFile(e.target.files[0])}
            />
          </Button>

          {file && (
            <p style={{ fontSize: 13, marginTop: 6, color: "green" }}>
              📄 {file.name}
            </p>
          )}
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="error"
        sx={{ mt: 3 }}
        onClick={submitRelieve}
      >
        Relieve Employee
      </Button>
    </Paper>
  );
}
