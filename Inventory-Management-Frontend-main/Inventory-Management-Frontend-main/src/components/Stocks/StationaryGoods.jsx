import * as React from 'react';
import './CompleteStock.css'
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

import TableRow from '@mui/material/TableRow';

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import RawMaterialForm from './RawMaterialForm';
import axios from 'axios';


function CustomToolbar({ setFilterButtonEl }) {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton ref={setFilterButtonEl} />
    </GridToolbarContainer>
  );
}

let btnBack = [
  {
    id: 1,
    back: 'Back'
  }
]

function StationaryGoods(props) {
  const { setPages, ipAddress } = props
  const navigate = useNavigate();

  const [materialFormData, setMaterialFormData] = useState([])

  useEffect(() => {
    getMaterialFormData();
  }, []);

  async function getMaterialFormData() {
    try {
      const response = await axios.get(`http://${ipAddress}/rawmaterial/data`);
      // Assuming the server is running on the same host
      setMaterialFormData(response.data.data)
      // console.log(response.data.data)
      // console.log('materialFormData' + materialFormData)
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // instock logic

  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`http://{ipAddress}/getcompletestockdata`);
        setStockData(response.data.data);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    fetchData();
  }, []);


  const latestStockIds = {};
  stockData.forEach((stockItem) => {
    const stockMaterialId = stockItem.stock_material_id;
    latestStockIds[stockMaterialId] = Math.max(latestStockIds[stockMaterialId] || 0, stockItem.stock_id);
  });

  // Retrieve the complete object for each unique stock_id
  const uniqueStockObjects = stockData
    .filter((stockItem) => stockItem.stock_id === latestStockIds[stockItem.stock_material_id]);

  // Calculate the sum of closing balances for each material_name
  const closingBalanceSumByMaterial = {};
  uniqueStockObjects.forEach((stockItem) => {
    const materialName = stockItem.material_name;
    closingBalanceSumByMaterial[materialName] = (closingBalanceSumByMaterial[materialName] || 0) + stockItem.closing_balance;
  });

  console.log("Closing Balance Sum By Material:", closingBalanceSumByMaterial);

  // Set the same logic closingBalanceSumByMaterial as an instock_qty value in the valueGetter
  const instockQtyGetter = (params) => {
    const instockQty = closingBalanceSumByMaterial[params.row.material_name] || 0;
    return instockQty;
  };



  return (
    <div className='stationary-goods-container'>
      <div className="raw-material-add-div">
        <h1>Stationary goods</h1>
        {btnBack.map((item) => {
          return <Button variant="contained" key={item.id} onClick={() => navigate('/stock')}>{item.back}</Button>
        })}
      </div>
      <div style={{ height: 470, width: '100%' }} className='raw-material-form-div'>
        <DataGrid
          columns={[
            { field: 'material_id', hideable: false, width: '140', headerName: 'Material Id' },
            { field: 'material_name', width: '180', headerName: 'Material Name' },
            { field: 'category', width: '180', headerName: 'Category' },
            { field: 'barcode_no', width: '180', headerName: 'Barcode Number' },
            { field: 'instock_qty', width: '180', headerName: 'Instock qty', valueGetter: instockQtyGetter, },
          ]}
          rows={materialFormData.filter((row) => row.type == 'Stationary Goods')}
          // getRowId={(row) =>  row.materialFormData.material_id}
          getRowId={(row) => row.material_id}
          getRowHeight={() => 'auto'}
          getEstimatedRowHeight={() => 200}
          pagination
          PageSize={25} // Set the default page size
          pageSizeOptions={[5, 10, 25, 50, 100, 120]}
          slots={{
            toolbar: CustomToolbar,
          }}
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
  )
}

export default StationaryGoods
