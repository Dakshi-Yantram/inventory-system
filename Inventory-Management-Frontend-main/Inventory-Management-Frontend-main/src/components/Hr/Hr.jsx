import React, { useState } from "react";
import AddEmployee from "./Addemployee";
import RelieveEmployee from "./Relieveemployee";
import EmployeeList from "./Employeelist";
import { Button } from "@mui/material";

export default function Hr() {
  const [view, setView] = useState("LIST");

  return (
    <div style={{ padding: 20 }}>
      <h2>HR Management</h2>

      <Button onClick={() => setView("LIST")}>Employee List</Button>
      <Button onClick={() => setView("ADD")} sx={{ ml: 1 }}>
        Add Employee
      </Button>
      <Button onClick={() => setView("RELIEVE")} sx={{ ml: 1 }}>
        Relieve Employee
      </Button>

      <div style={{ marginTop: 20 }}>
        {view === "LIST" && <EmployeeList />}
        {view === "ADD" && <AddEmployee />}
        {view === "RELIEVE" && <RelieveEmployee />}
      </div>
    </div>
  );
}
