import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function MRIDTooltip() {
  return (
    <Tooltip title="MRID = Material Requisition ID (Issued material tracking number)">
      <InfoOutlinedIcon
        style={{ cursor: "pointer", fontSize: "18px" }}
        color="primary"
      />
    </Tooltip>
  );
}
