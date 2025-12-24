import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CustomerList({ ipAddress }) {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `http://${ipAddress}/customer/list`
      );
      setCustomers(res.data.data || []);
    } catch (err) {
      alert("Failed to load customers");
    }
  };

  return (
    <Paper style={{ padding: 20 }}>
      <h3>Customer List</h3>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => navigate("/customer/add")}
      >
        + Add Customer
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Customer Name</b></TableCell>
            <TableCell><b>GST</b></TableCell>
            <TableCell><b>PAN</b></TableCell>
            <TableCell><b>Contact Person</b></TableCell>
            <TableCell><b>Phone</b></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c, i) => (
              <TableRow key={i}>
                <TableCell>{c.customer_name}</TableCell>
                <TableCell>{c.gst_number}</TableCell>
                <TableCell>{c.pan_number}</TableCell>
                <TableCell>{c.contact_person}</TableCell>
                <TableCell>{c.phone_number}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
