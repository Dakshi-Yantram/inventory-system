import React, { useEffect, useState } from "react";
import axios from "axios";

function ApplyLeave({ ipAddress }) {
    const [employees, setEmployees] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [form, setForm] = useState({
        employee_id: "",
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: ""
    });

    useEffect(() => {
        axios.get(`http://${ipAddress}/employee`)
            .then(res => {
                console.log("EMPLOYEES:", res.data.data);
                setEmployees(res.data.data);
            });

        axios.get(`http://${ipAddress}/leave/types`)
            .then(res => {
                console.log("LEAVE TYPES:", res.data);
                setLeaveTypes(res.data);
            });
    }, []);

    const submitLeave = async () => {

        if (!form.employee_id || !form.leave_type_id || !form.start_date || !form.end_date || !form.reason) {
            alert("⚠ Please fill all fields");
            return;
        }

        try {
            await axios.post(`http://${ipAddress}/leave/apply`, form);
            alert("✅ Leave Applied Successfully");

            setForm({
                employee_id: "",
                leave_type_id: "",
                start_date: "",
                end_date: "",
                reason: ""
            });

        } catch (err) {
            console.error(err.response?.data || err);
            alert("❌ Failed to apply leave. Check server logs.");
        }
    };



    return (
        <div style={{ width: "400px", margin: "auto" }}>
            <h2>Apply Leave</h2>

            <select
                value={form.employee_id}
                onChange={e => setForm({ ...form, employee_id: e.target.value })}
            >
                <option value="">Select Employee</option>
                {employees.map(e => (
                    <option key={e.EmployeeID} value={e.EmployeeID}>
                        {e.EmployeeName}
                    </option>
                ))}

            </select>

            <br /><br />

            <select
                value={form.leave_type_id}
                onChange={e => setForm({ ...form, leave_type_id: e.target.value })}
            >
                <option value="">Select Leave Type</option>
                {leaveTypes.map(l => (
                    <option key={l.id} value={l.id}>
                        {l.type_name}
                    </option>
                ))}
            </select>

            <br /><br />

            <input
                type="date"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
            />

            <input
                type="date"
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
            />

            <textarea
                value={form.reason}
                placeholder="Reason"
                onChange={e => setForm({ ...form, reason: e.target.value })}
            />

            <br /><br />
            <button onClick={submitLeave}>Apply</button>
        </div>
    );
}

export default ApplyLeave;
