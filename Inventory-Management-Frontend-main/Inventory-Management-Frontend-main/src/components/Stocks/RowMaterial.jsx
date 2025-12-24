import RawDataTable from "./RawDataTable";

function RowMaterial({ ipAddress, category }) {
  return (
    <div className="raw-material-container">
      <RawDataTable
        ipAddress={ipAddress}
        category={category}
      />
    </div>
  );
}

export default RowMaterial;
