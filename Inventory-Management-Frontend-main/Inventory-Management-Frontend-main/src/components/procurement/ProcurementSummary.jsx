import React, { useEffect, useState } from 'react'
import './Procurement.css'
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from '@mui/x-data-grid-generator';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import axios from 'axios';

let procurementTable = {
  width: '77vw',
}

let rows = []


let btnBack = [
  {
    id: 1,
    title: 'Back',
  },

]

function ProcurementSummary(props) {
  // console.log(props)
  const { setProcurementPage, result, ipAddress } = props;
  const [summaryResult, setSummaryResult] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://${ipAddress}/getcompletestockdata`);
        setStockData(response.data.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const handelProcurementSummary = async () => {
    try {
      const response = await axios.post(`http://${ipAddress}/procurementSummary`, result, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const latestStockIds = {};
        stockData.forEach((stockItem) => {
          const stockMaterialId = stockItem.stock_material_id;
          latestStockIds[stockMaterialId] = Math.max(latestStockIds[stockMaterialId] || 0, stockItem.stock_id);
        });

        const uniqueStockObjects = stockData.filter((stockItem) => stockItem.stock_id === latestStockIds[stockItem.stock_material_id]);

        const closingBalanceSumByMaterial = {};
        uniqueStockObjects.forEach((stockItem) => {
          const materialName = stockItem.material_name;
          closingBalanceSumByMaterial[materialName] = (closingBalanceSumByMaterial[materialName] || 0) + stockItem.closing_balance;
        });

        const projectDataWithSerial = response.data.closingBalances.map((item, index) => ({
          ...item,
          sr_no: index + 1,
          closing_balance: closingBalanceSumByMaterial[item.materialName] || 0,
          instock_qty: closingBalanceSumByMaterial[item.materialName] || 0,
          finalOrder: (item.finalQty - (closingBalanceSumByMaterial[item.materialName] || 0)),
        }));

        setProcessedData(projectDataWithSerial);
        setSummaryResult(projectDataWithSerial);
      } else {
        console.error(`Failed to fetch data`, response.data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (stockData.length > 0) {
      handelProcurementSummary();
    }
  }, [stockData, result]);

  console.log(`processedData: ${JSON.stringify(processedData)}`);

  const handleRowClick = (e, index) => {
    // Placeholder for row click handling
    console.log(`Row clicked: ${index}`);
  };
  console.log(`summary results : ${JSON.stringify(summaryResult)}`)

  return (
    <div>
      <div className='procurement-head-add'>
        <h1>ProcurementSummary</h1>
        {btnBack.map((item) => {
          return <Button variant="contained" key={item.id} onClick={() => setProcurementPage(0)}>{item.title}</Button>
        })}
      </div>
      <div className="summary-dashboard">
        <div style={{ height: 470, width: '100%' }}>
          <DataGrid
            columns={[
              {
                field: 'sr_no', hideable: false, width: 140, headerName: 'Sr.no'
              },

              { field: 'materialName', width: 140, headerName: 'Material Name' },
              {
                field: 'Package', width: 140, headerName: 'Package'
              },
              {
                field: 'Value', width: 140, headerName: 'value'
              },
              {
                field: 'finalQty', width: 140, headerName: 'Final Qty'
              },
              {
                field: 'instock_qty', width: 140, headerName: 'Instock Balance',
              },
              {
                field: 'finalOrder', width: 140, headerName: 'Final ordering Qty',
                valueGetter: (params) => { return (params.row.finalQty - params.row.instock_qty) }
              },
            ]}
            rows={processedData}
            getRowId={(row) => row.materialName}
            onRowClick={(e) => handleRowClick(e, 1)}
            getRowHeight={() => 'auto'}
            getEstimatedRowHeight={() => 200}
            sx={{
              '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': {
                py: 1,
              },
              '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': {
                py: '16px',
              },
              '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': {
                py: '26px',
              },
            }}
          />
          {/* {selectedRow && <VendorDetails row={selectedRow} />} */}
        </div>
      </div>
    </div>
  )
}

export default ProcurementSummary
