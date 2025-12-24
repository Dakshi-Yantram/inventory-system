// Stock.jsx
import React, { useState } from "react";
import ComplteStock from "./ComplteStock";
import RawDataTable from "./RawDataTable";

function Stock({ ipAddress }) {
  const [activePage, setActivePage] = useState(null);

  const handleCategorySelect = (page) => {
    console.log("NAVIGATING TO:", page);
    setActivePage(page);
  };

  if (activePage === "Complete Stock") {
    return (
      <ComplteStock
        ipAddress={ipAddress}
        onCategorySelect={handleCategorySelect}
      />
    );
  }

  return (
    <RawDataTable
      ipAddress={ipAddress}
      category={activePage}
      goBack={() => setActivePage("Complete Stock")}
      onCategoryChange={(newCategory) => setActivePage(newCategory)}
    />
  );
}

export default Stock;
