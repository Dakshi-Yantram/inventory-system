// import React, { useEffect, useState } from "react";
// import { Button, Paper } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// export default function QCform({ title, qcType, referenceId }) {
//   const navigate = useNavigate();
//   const [rows, setRows] = useState([]);

//   // 🔒 Column A auto-loaded from server
//   useEffect(() => {
//     fetch(`http://localhost:3000/qc/template/${qcType}`)
//       .then(res => res.json())
//       .then(res => {
//         const prepared = res.data.map(r => ({
//           ...r,
//           actual_result: "",
//           status: "PASS",
//           remarks: ""
//         }));
//         setRows(prepared);
//       });

//   }, [qcType]);

//   const handleChange = (i, field, value) => {
//     const updated = [...rows];
//     updated[i][field] = value;
//     setRows(updated);
//   };

//   const submitQC = async () => {
//     const payload = {
//       qc_type: qcType,
//       reference_id: referenceId,
//       parameters: rows
//     };

//     const res = await fetch("http://localhost:3000/qc/save", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });

//     const data = await res.json();

//     if (data.success) {
//       alert("QC submitted successfully");
//       navigate(-1);
//     } else {
//       alert("QC submission failed");
//     }
//   };

//   return (
//     <div className="page-container">
//       <Paper elevation={4} className="qc-card">
//         <Button onClick={() => navigate(-1)}>⬅ Back</Button>
//         <h3>{title}</h3>

//         <table className="qc-table">
//           <thead>
//             <tr>
//               <th>Parameter</th>
//               <th>Acceptance Criteria</th>
//               <th>Test Method</th>
//               <th>Actual Result</th>
//               <th>Status</th>
//               <th>Remarks</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r, i) => (
//               <tr key={i}>
//                 <td>{r.parameter_name}</td>
//                 <td>{r.acceptance_criteria}</td>
//                 <td>{r.test_method}</td>
//                 <td>
//                   <input
//                     value={r.actual_result}
//                     onChange={e => handleChange(i, "actual_result", e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <select
//                     value={r.status}
//                     onChange={e => handleChange(i, "status", e.target.value)}
//                   >
//                     <option value="PASS">PASS</option>
//                     <option value="FAIL">FAIL</option>
//                   </select>
//                 </td>
//                 <td>
//                   <input
//                     value={r.remarks}
//                     onChange={e => handleChange(i, "remarks", e.target.value)}
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <Button variant="contained" onClick={submitQC}>
//           Submit QC
//         </Button>
//       </Paper>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function QCform({ title, qcType, referenceId }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  // 🔹 Load QC template
  useEffect(() => {
    fetch(`http://localhost:3000/qc/template/${qcType}`)
      .then(res => res.json())
      .then(res => {
        const prepared = (res.data || []).map(r => ({
          ...r,
          actual_result: "",
          status: "PASS",
          remarks: ""
        }));
        setRows(prepared);
      });
  }, [qcType]);

  const handleChange = (i, field, value) => {
    const updated = [...rows];
    updated[i][field] = value;
    setRows(updated);
  };

  // ✅ FINAL submit QC
  const submitQC = async () => {
    try {
      // 🔎 DEBUG: rows check
      console.log("ROWS SENT:", rows, Array.isArray(rows));

      // 🔹 STEP 1: Flask system QC
      const qcCheckRes = await fetch("http://localhost:3000/qc/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial_no: referenceId,
          qcType: qcType
        })
      });

      const qcCheckData = await qcCheckRes.json();
      console.log("QC CHECK RESPONSE:", qcCheckData);

      if (qcCheckData.data?.qc_status !== "PASS") {
        alert("System QC Failed. QC cannot be submitted.");
        return;
      }

      // 🔹 STEP 2: Save QC
      const payload = {
        qc_type: qcType,
        reference_id: referenceId,
        parameters: rows
      };

      console.log("SAVE PAYLOAD:", payload);

      const res = await fetch("http://localhost:3000/qc/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("SAVE RESPONSE:", data);

      if (data.success) {
        alert("QC submitted successfully");
        navigate(-1);
      } else {
        alert(data.error || "QC submission failed");
      }

    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert("Error while submitting QC");
    }
  };

  return (
    <div className="page-container">
      <Paper elevation={4} className="qc-card">
        <Button onClick={() => navigate(-1)}>⬅ Back</Button>
        <h3>{title}</h3>

        <table className="qc-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Acceptance Criteria</th>
              <th>Test Method</th>
              <th>Actual Result</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="6" align="center">No QC parameters found</td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.parameter_name}</td>
                  <td>{r.acceptance_criteria}</td>
                  <td>{r.test_method}</td>
                  <td>
                    <input
                      value={r.actual_result}
                      onChange={e =>
                        handleChange(i, "actual_result", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={r.status}
                      onChange={e =>
                        handleChange(i, "status", e.target.value)
                      }
                    >
                      <option value="PASS">PASS</option>
                      <option value="FAIL">FAIL</option>
                    </select>
                  </td>
                  <td>
                    <input
                      value={r.remarks}
                      onChange={e =>
                        handleChange(i, "remarks", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Button variant="contained" onClick={submitQC}>
          Submit QC
        </Button>
      </Paper>
    </div>
  );
}
