import React, { useEffect, useState } from "react";

export default function EmployeeList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/hr/employees")   // 👈 SAME API
      .then(res => res.json())
      .then(res => setData(res.data || []));
  }, []);

  return (
    <div className="page-container">
      <h3>Employee List</h3>

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Type</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" align="center">
                No employees found
              </td>
            </tr>
          ) : (
            data.map((e, i) => (
              <tr key={i}>
                <td>{e.employee_name}</td>
                <td>{e.email}</td>
                <td>{e.department}</td>
                <td>{e.position}</td>
                <td>{e.employment_type}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
