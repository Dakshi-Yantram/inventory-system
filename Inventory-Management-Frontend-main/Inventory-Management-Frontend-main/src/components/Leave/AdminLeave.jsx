import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminLeave({ ipAddress }) {
  const [leaves, setLeaves] = useState([]);

  const loadLeaves = () => {
    axios.get(`http://${ipAddress}/leaveRequests`).then(res => setLeaves(res.data));
  };

  useEffect(loadLeaves, []);

  const approve = async (id) => {
    await axios.post(`http://${ipAddress}/approveLeave`, { id });
    loadLeaves();
  };

  const reject = async (id) => {
    await axios.post(`http://${ipAddress}/rejectLeave`, { id });
    loadLeaves();
  };

  return (
    <div>
      <h2>Leave Requests</h2>

      <table border="1">
        <tr>
          <th>Employee</th>
          <th>Type</th>
          <th>From</th>
          <th>To</th>
          <th>Reason</th>
          <th>Status</th>
          <th>Action</th>
        </tr>

        {leaves.map(l => (
          <tr key={l.id}>
            <td>{l.EmployeeName}</td>
            <td>{l.leave_type}</td>
            <td>{l.start_date}</td>
            <td>{l.end_date}</td>
            <td>{l.reason}</td>
            <td>{l.status}</td>
            <td>
              <button onClick={() => approve(l.id)}>Approve</button>
              <button onClick={() => reject(l.id)}>Reject</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}

export default AdminLeave;
