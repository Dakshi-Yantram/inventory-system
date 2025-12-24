import React from "react";
import CustomerForm from "../Customer/CustomerForm";


const CustomerPage = () => {
  const ipAddress = "localhost:3000";

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Customer</h2>

      {/* FORM COMPONENT */}
      <CustomerForm ipAddress={ipAddress} />
    </div>
  );
};

export default CustomerPage;
