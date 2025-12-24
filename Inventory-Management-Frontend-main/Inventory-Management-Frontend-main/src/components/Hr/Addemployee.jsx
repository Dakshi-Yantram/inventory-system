import React, { useState } from "react";
import { Button, TextField, Autocomplete, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Hr.css";

export default function AddEmployee() {
    const navigate = useNavigate();   // ✅ ADD THIS

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        role: "",
        employmentType: "",
        compensation: "",
        currentAddress: "",
        permanentAddress: "",
        pan: "",
        dateOfJoining: "",
        reportingManager: ""
    });

    const [files, setFiles] = useState({
        resume: null,
        aadhar: null,
        pan: null,
        offerLetter: null
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const employmentOptions = [
        { label: "Full Time", value: "FULL_TIME" },
        { label: "Part Time", value: "PART_TIME" },
        { label: "Intern", value: "INTERN" }
    ];

    const handleFileChange = (e) => {
        setFiles({
            ...files,
            [e.target.name]: e.target.files[0]
        });
    };

    const handleSubmit = () => {
        if (
            !files.resume ||
            !files.aadhar ||
            !files.pan ||
            !files.offerLetter
        ) {
            alert("Please upload all required documents");
            return;
        }

        const fd = new FormData();

        Object.keys(form).forEach(key => {
            fd.append(key, form[key]);
        });

        fd.append("resume", files.resume);
        fd.append("aadhar", files.aadhar);
        fd.append("pan", files.pan);
        fd.append("offer_letter", files.offerLetter);

        fetch("http://localhost:3000/hr/employee/create", {
            method: "POST",
            body: fd
        })
            .then(res => res.json())
            .then(() => {
                alert("Employee saved successfully ✅");
                navigate("/hr");   // ✅ AUTO REDIRECT TO HR DASHBOARD
            })
            .catch(() => {
                alert("Error saving employee ❌");
            });
    };

    return (
        <Paper className="hr-form-container" elevation={3}>
            <h3 className="hr-title">Add Employee</h3>

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField label="Employee Name" name="name" size="small" fullWidth onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="Email" name="email" size="small" fullWidth onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="Phone" name="phone" size="small" fullWidth onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="PAN Card Number" name="pan" size="small" fullWidth onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="Current Address" name="currentAddress" size="small" fullWidth onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="Permanent Address" name="permanentAddress" size="small" fullWidth onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        label="Date of Joining"
                        type="date"
                        name="dateOfJoining"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="Reporting Manager" name="reportingManager" size="small" fullWidth onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="Department" name="department" size="small" fullWidth onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="Position / Role" name="role" size="small" fullWidth onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                    <Autocomplete
                        options={employmentOptions}
                        getOptionLabel={(option) => option.label}
                        value={employmentOptions.find(opt => opt.value === form.employmentType) || null}
                        onChange={(e, newValue) =>
                            setForm({ ...form, employmentType: newValue ? newValue.value : "" })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Employment Type" size="small" />
                        )}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="Compensation" name="compensation" size="small" fullWidth onChange={handleChange} />
                </Grid>
            </Grid>

            {/* FILE UPLOADS */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                    <Button variant="outlined" component="label" fullWidth>
                        Upload Resume *
                        <input type="file" hidden name="resume" onChange={handleFileChange} />
                    </Button>
                    {files.resume && <p className="file-name">📄 {files.resume.name}</p>}
                </Grid>

                <Grid item xs={6}>
                    <Button variant="outlined" component="label" fullWidth>
                        Upload Aadhar Card *
                        <input type="file" hidden name="aadhar" onChange={handleFileChange} />
                    </Button>
                    {files.aadhar && <p className="file-name">📄 {files.aadhar.name}</p>}
                </Grid>

                <Grid item xs={6}>
                    <Button variant="outlined" component="label" fullWidth>
                        Upload PAN Card *
                        <input type="file" hidden name="pan" onChange={handleFileChange} />
                    </Button>
                    {files.pan && <p className="file-name">📄 {files.pan.name}</p>}
                </Grid>

                <Grid item xs={6}>
                    <Button variant="outlined" component="label" fullWidth>
                        Upload Offer Letter *
                        <input type="file" hidden name="offerLetter" onChange={handleFileChange} />
                    </Button>
                    {files.offerLetter && <p className="file-name">📄 {files.offerLetter.name}</p>}
                </Grid>
            </Grid>

            <Button
                type="button"
                variant="contained"
                sx={{ mt: 3 }}
                onClick={handleSubmit}
            >
                Save Employee
            </Button>
        </Paper>
    );
}
