// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function ProcurementSummary() {
//   const role = localStorage.getItem("role");   // "admin", "staff", "vendor"

//   const [summary, setSummary] = useState([]);

//   const project_id = 1;     // change later dynamically
//   const monthlyQty = 100;   // change later dynamically

//   useEffect(() => {
//     fetchSummary();
//   }, []);

//   const fetchSummary = async () => {
//     try {
//       const res = await axios.post("http://localhost:3000/procurement-summary", {
//         project_id,
//         monthlyQty
//       });
//       setSummary(res.data);
//     } catch (err) {
//       console.log("Error:", err);
//     }
//   };

//   return (
//     <div style={{ padding: "30px" }}>
//       <h2>Procurement Summary</h2>

//       <table border="1" cellPadding="8" width="70%">
//         <thead>
//           <tr>
//             <th>Part ID</th>
//             <th>Material</th>

//             {role !== "vendor" && <th>Required</th>}
//             {role !== "vendor" && <th>Available</th>}

//             <th>To Buy</th>
//             <th>Vendor</th>
//             <th>Price</th>
//             <th>Total Cost</th>
//           </tr>
//         </thead>

//         <tbody>
//           {summary.map((item, index) => (
//             <tr key={index}>
//               <td>{item.part_id}</td>
//               <td>{item.material_name}</td>

//               {role !== "vendor" && <td>{item.required}</td>}
//               {role !== "vendor" && <td>{item.available}</td>}

//               <td style={{ color: item.toBuy > 0 ? "red" : "green" }}>
//                 {item.toBuy}
//               </td>

//               <td>{item.vendor_name || "-"}</td>
//               <td>{item.price || "-"}</td>
//               <td>{item.price ? item.price * item.toBuy : "-"}</td>
//             </tr>

//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default ProcurementSummary;


import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ API function (Modular)
const fetchProcurementSummary = async (project_id, monthlyQty) => {
  return axios.post("http://localhost:3000/procurement-summary", {
    project_id,
    monthlyQty
  });
};

// ✅ Row component (Modular)
function SummaryRow({ item, role }) {
  return (
    <tr>
      <td>{item.part_id}</td>
      <td>{item.material_name}</td>

      {role !== "vendor" && <td>{item.required}</td>}
      {role !== "vendor" && <td>{item.available}</td>}

      <td style={{ color: item.toBuy > 0 ? "red" : "green" }}>
        {item.toBuy}
      </td>

      <td>{item.vendor_name || "-"}</td>
      <td>{item.price || "-"}</td>
      <td>{item.price ? item.price * item.toBuy : "-"}</td>
    </tr>
  );
}

// ✅ Table component (Modular)
function SummaryTable({ summary, role }) {
  return (
    <table border="1" cellPadding="8" width="70%">
      <thead>
        <tr>
          <th>Part ID</th>
          <th>Material</th>

          {role !== "vendor" && <th>Required</th>}
          {role !== "vendor" && <th>Available</th>}

          <th>To Buy</th>
          <th>Vendor</th>
          <th>Price</th>
          <th>Total Cost</th>
        </tr>
      </thead>

      <tbody>
        {summary.map((item, index) => (
          <SummaryRow key={index} item={item} role={role} />
        ))}
      </tbody>
    </table>
  );
}

// ✅ MAIN COMPONENT
function ProcurementSummary() {
  const role = localStorage.getItem("role");
  const [summary, setSummary] = useState([]);

  const project_id = 1;
  const monthlyQty = 100;

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await fetchProcurementSummary(project_id, monthlyQty);
      setSummary(res.data);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Procurement Summary</h2>
      <SummaryTable summary={summary} role={role} />
    </div>
  );
}

export default ProcurementSummary;
