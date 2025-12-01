import React, { useState, useEffect } from 'react'
import Button from '@mui/material/Button';
import './CompleteStock.css'
import AddIcon from '@mui/icons-material/Add';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbar
} from '@mui/x-data-grid';
import { width } from '@mui/system';
import CompleteStockForm from './CompleteStockForm';
import Sidebar from '../../Sidebar';
import NextCompleteForm from './NextCompleteForm';
import axios from 'axios';




let btnRawMaterial = [
  {
    id: 1,
    title: 'Add Material'
  }
]
let btnBack = [
  {
    id: 1,
    back: 'Back'
  }
]



function ComplteStock(props) {
  const { setPages, ipAddress } = props
  const [completeStockPages, setCompleteStockPages] = useState(0)
  const [completestockdata, setCompletestockdata] = useState('')

  useEffect(() => {
    getCompleteStockFormData();
  }, []);

  async function getCompleteStockFormData() {
    try {
      const response = await axios.get(`http://${ipAddress}/getcompletestockdata`);
      // Assuming the server is running on the same host
      setCompletestockdata(response.data.data)
      // console.log(response.data.data)
      // console.log('materialFormData' + materialFormData)
    } catch (error) {
      console.error('Error:', error);
    }
  }

  console.log(`complete stock: ${JSON.stringify(completestockdata)}`)
  // console.log(`complete stock ${JSON.stringify(completestockdata)}`)
  return (
    <div className='complete-stock-container'>

      {completeStockPages == 1 ? <CompleteStockForm setCompleteStockPages={setCompleteStockPages} ipAddress={ipAddress} /> : <div className='complete-stock-home-container'>
        <div className="raw-material-add-div">
          <h1>Complete Stock</h1>
          {btnRawMaterial.map((item) => {
            return <Button variant="contained" key={item.id} onClick={() => setCompleteStockPages(item.id)}><AddIcon />{item.title}</Button>
          })}
        </div>
        <div className="complete-stock-dashboard">
          <div style={{ height: 470, width: '100%' }}>
            <DataGrid
              columns={[
                { field: 'stock_id', hideable: false, width: '90', headerName: 'Stock ID' },
                {
                  field: 'submit_date',
                  width: '130',
                  headerName: 'Submit Date',
                  valueGetter: (params) =>
                    params.row.submit_date ? params.row.submit_date.split("T")[0] : "-"
                },
                {
                  field: 'stock_material_id', width: '130', headerName: ' stock material ID',

                },
                { field: 'material_id', width: '160', headerName: 'Material ID' },
                { field: 'material_name', width: '160', headerName: 'Material Name' },
                { field: 'invoice_number', width: '160', headerName: 'Invoice Number' },

                {
                  field: 'invoice_date',
                  width: '130',
                  headerName: 'Invoice Date',
                  valueGetter: (params) =>
                    params.row.invoice_date ? params.row.invoice_date.split("T")[0] : "-"
                },
                { field: 'opening_stock', width: '130', headerName: 'Opening stock' },
                {
                  field: 'received_qty', width: '160', headerName: 'Received Qty',
                  valueGetter: (params) => {
                    // If MRID is null, set received_qty; otherwise, return null
                    return params.row.MRID === null ? params.row.received_qty : '-';
                  },
                },
                { field: 'approved_qty', width: '130', headerName: 'Issued Quantity' },
                { field: 'MRID', width: '120', headerName: 'MRID' },
                { field: 'closing_balance', width: '130', headerName: 'Closing Balance' },
                {
                  field: 'qr',
                  headerName: 'QR Code',
                  width: 120,
                  renderCell: (params) => (
                    <a
                      href={`http://${ipAddress}/getQR/${params.row.part_id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View QR
                    </a>
                  )
                },
                {
                  field: 'generate_qr',
                  headerName: 'Generate QR',
                  width: 140,
                  renderCell: (params) => (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        fetch(`http://${ipAddress}/assignQR`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ partId: params.row.part_id })
                        })
                          .then(() => alert("✅ QR Generated Successfully"))
                          .catch(() => alert("❌ Failed to generate QR"));
                      }}
                    >
                      Generate
                    </Button>
                  )
                }



              ]}
              rows={completestockdata}
              getRowId={(row) => row.id}
              getRowHeight={() => 'auto'}
              getEstimatedRowHeight={() => 200}
              pagination
              PageSize={25} // Set the default page size
              pageSizeOptions={[5, 10, 25, 50, 100, 120]}
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
          </div>
        </div>
      </div>}


    </div >
  )
}

export default ComplteStock
