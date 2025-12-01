// import React, { useState, useEffect } from 'react'
// import Button from '@mui/material/Button';
// import './CompleteStock.css'
// import {
//   DataGrid,
//   GridToolbarContainer,
//   GridToolbarColumnsButton,
//   GridToolbarFilterButton,
//   GridToolbarExport,
//   GridToolbarDensitySelector,
//   GridToolbar
// } from '@mui/x-data-grid';
// import { width } from '@mui/system';
// import CompleteStockForm from './CompleteStockForm';
// import Sidebar from '../../Sidebar';
// import NextCompleteForm from './NextCompleteForm';
// import axios from 'axios';




// let btnRawMaterial = [
//   {
//     id: 1,
//     title: 'Add Material'
//   }
// ]
// let btnBack = [
//   {
//     id: 1,
//     back: 'Back'
//   }
// ]



// function ComplteStock(props) {
//   const { setPages } = props
//   const [completeStockPages, setCompleteStockPages] = useState(0)
//   const [completestockdata, setCompletestockdata] = useState('')

//   useEffect(() => {
//     getCompleteStockFormData();
//   }, []);

//   async function getCompleteStockFormData() {
//     try {
//       const response = await axios.get('http://localhost:3000/getcompletestockdata');
//       // Assuming the server is running on the same host
//       setCompletestockdata(response.data.data)
//       console.log(response.data.data)
//       // console.log('materialFormData' + materialFormData)
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   }

//   const columns = [
//     { field: 'stock_id', headerName: 'Stock ID', width: 90 },
//     { field: 'stock_material_id', headerName: 'Stock Material ID', width: 210 },
//     { field: 'material_name', headerName: 'Material Name', width: 150 },
//     { field: 'invoice_number', headerName: 'Invoice Number', width: 170 },
//     { field: 'MRID', headerName: 'MRID', width: 120 },
//     { field: 'opening_stock', headerName: 'Opening Stock', width: 130 },
//     { field: 'closing_balance', headerName: 'Closing Balance', width: 130 },
//     { field: 'received_qty_data', headerName: 'Received Qty', width: 130 },
//   ];

//   const rows = Array.isArray(completestockdata)
//     ? completestockdata.map((item, index) => ({
//       id: index, // Use the array index as a simple unique identifier
//       stock_id: item.stock_id,
//       stock_material_id: item.stock_material_id,
//       material_name: item.material_name,
//       invoice_number: item.invoice_number,
//       MRID: item.MRID,
//       opening_stock: item.opening_stock,
//       closing_balance: item.closing_balance,
//       received_qty_data: item.received_qty_data.map((receivedItem, idx) => ({
//         id: `${index}_${idx}`, // Create a unique ID for nested received_qty_data items
//         material_id: receivedItem.material_id,
//         received_qty: receivedItem.received_qty,
//       })),
//     }))
//     : [];

//   return (
//     <div className='complete-stock-container'>
//       {completeStockPages === 1 ? (
//         <CompleteStockForm setCompleteStockPages={setCompleteStockPages} />
//       ) : (
//         <div className='complete-stock-home-container'>
//           <div className='raw-material-add-div'>
//             <h1>Complete Stock</h1>
//             {btnRawMaterial.map((item) => (
//               <Button
//                 variant='contained'
//                 key={item.id}
//                 onClick={() => setCompleteStockPages(item.id)}
//               >
//                 {item.title}
//               </Button>
//             ))}
//           </div>
//           <div className='complete-stock-dashboard'>
//             <div style={{ height: 450, width: '100%' }}>
//               <DataGrid
//                 columns={columns}
//                 rows={rows}
//                 pageSize={5}
//                 rowsPerPageOptions={[5, 10, 20]}
//                 pagination
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default ComplteStock





// <div className='approve-details'>
//   <form action=''>
//     {approveRow.TemplateData.map((item) => {
//       const matchingStockData = stockData.filter(
//         (stockItem) => stockItem.material_name === item.material_name
//       );
//       const isQtyError = item.remainingQty < 0;

//       return (
//         <div className='approve-form' key={item.material_name}>
//           <TextField
//             disabled
//             id={`material-name-${item.material_name}`}
//             label='Material Name'
//             value={item.material_name}
//             sx={{
//               '& > :not(style)': { m: 1, width: 200 },
//             }}
//           />
//           <TextField
//             disabled
//             id={`issued-qty-${item.material_name}`}
//             label='Issue Qty'
//             value={item.issued_qty}
//             sx={{
//               '& > :not(style)': { m: 1, width: 100 },
//             }}
//           />
//           <Autocomplete
//             id={`stock-material-id-${item.material_name}`}
//             freeSolo
//             options={matchingStockData.map((stockItem) => stockItem.stock_material_id)}
//             sx={{
//               '& > :not(style)': { m: 1, width: 300 },
//             }}
//             onInputChange={(event, newValue) => setSelectedStockMaterialId(newValue)}
//             renderInput={(params) => <TextField {...params} label='Stock Material IDs' />}
//           />
//           <TextField
//             disabled
//             label='Instock Qty'
//             value={item.instockQty}
//             defaultValue='0'
//             sx={{
//               '& > :not(style)': { m: 1, width: 100 },
//             }}
//           />
//           <TextField
//             id={`enter-qty-${item.material_name}`}
//             label='Approve Qty'
//             value={item.enterQtyToApprove}
//             onChange={(e) => handleEnterQtyChange(e, item)}
//             error={isQtyError}
//             helperText={isQtyError ? 'Remaining Qty cannot be negative' : ''}
//             sx={{
//               '& > :not(style)': { m: 1, width: 130 },
//             }}
//           />
//           <TextField
//             disabled
//             id={`remaining-qty-${item.material_name}`}
//             label='Remaining Qty'
//             value={item.remainingQty}
//             defaultValue='0'
//             sx={{
//               '& > :not(style)': { m: 1, width: 100 },
//             }}
//           />
//         </div>
//       );
//     })}
//   </form>
// </div>

{/* <form action=''>
                    {approveRow.TemplateData.map((item) => {
                        const matchingStockData = stockData.filter(
                            (stockItem) => stockItem.material_name === item.material_name
                        );
                        const isQtyError = item.remainingQty < 0;

                        return (
                            <div className='approve-form' key={item.material_name}>
                                <TextField
                                    disabled
                                    id={`material-name-${item.material_name}`}
                                    label='Material Name'
                                    value={item.material_name}
                                    sx={{
                                        '& > :not(style)': { m: 1, width: 200 },
                                    }}
                                />
                                <TextField
                                    disabled
                                    id={`issued-qty-${item.material_name}`}
                                    label='Issue Qty'
                                    value={item.issued_qty}
                                    sx={{
                                        '& > :not(style)': { m: 1, width: 100 },
                                    }}
                                />
                                <Autocomplete
                                    id={`stock-material-id-${item.material_name}`}
                                    freeSolo
                                    options={matchingStockData.map((stockItem) => stockItem.stock_material_id)}
                                    sx={{
                                        '& > :not(style)': { m: 1, width: 300 },
                                    }}
                                    onInputChange={(event, newValue) => setSelectedStockMaterialId(newValue)}
                                    renderInput={(params) => <TextField {...params} label='Stock Material IDs' />}
                                />
                                <TextField
                                    disabled
                                    label='Instock Qty'
                                    value={item.instockQty}
                                    defaultValue='0'
                                    sx={{
                                        '& > :not(style)': { m: 1, width: 100 },
                                    }}
                                />
                                <TextField
                                    id={`enter-qty-${item.material_name}`}
                                    label='Approve Qty'
                                    value={item.enterQtyToApprove}
                                    onChange={(e) => handleEnterQtyChange(e, item)}
                                    error={isQtyError}
                                    helperText={isQtyError ? 'Remaining Qty cannot be negative' : ''}
                                    sx={{
                                        '& > :not(style)': { m: 1, width: 130 },
                                    }}
                                />
                                <TextField
                                    disabled
                                    id={`remaining-qty-${item.material_name}`}
                                    label='Remaining Qty'
                                    value={item.remainingQty}
                                    defaultValue='0'
                                    sx={{
                                        '& > :not(style)': { m: 1, width: 100 },
                                    }}
                                />
                                <button
                                    type="button" // Add this line to specify the button type
                                    onClick={handleAddButtonClickApprove}
                                    disabled={item.remainingQty === 0}
                                >
                                    Add
                                </button>

                            </div>

                        );
                    })}
                </form> */}

// {approveRow.TemplateData.map((item) => {

//     const matchingStockData = stockData.filter(
//         (stockItem) => stockItem.material_name === item.material_name
//     );

//     return (

//         <div key={item.material_name}>
//             <div className='approve-material-details'>
//                 <span>
//                     <h3>Material Name:</h3>
//                     <p>{item.material_name}</p>

//                 </span>
//                 <span>
//                     <h3>Issue Quanity:</h3>
//                     <p>{item.issued_qty}</p>
//                 </span>
//                 <span>
//                     <h3>Remaining qty:</h3>
//                     <p>so</p>
//                 </span>
//             </div>
//             <div>
//                 <h2>Stock Material IDs:</h2>
//                 {/* <p>{JSON.stringify(matchingStockData)}</p> */}
//                 {matchingStockData.map((stockItem) => (
//                     <div key={stockItem.stock_material_id} style={{
//                         display: 'flex'
//                     }}>
//                         <p>{stockItem.stock_material_id}</p>
//                         <TextField
//                             label={`Approve Qty`}
//                             type="number"
//                             value={item.enterQtyToApprove}
//                             onChange={(e) => handleEnterQtyChange(e, item)}
//                         />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// })}











// import React, { useState, useEffect } from 'react'
// import Button from '@mui/material/Button';
// import './CompleteStock.css'
// import {
//   DataGrid,
//   GridToolbarContainer,
//   GridToolbarColumnsButton,
//   GridToolbarFilterButton,
//   GridToolbarExport,
//   GridToolbarDensitySelector,
//   GridToolbar
// } from '@mui/x-data-grid';
// import { width } from '@mui/system';
// import CompleteStockForm from './CompleteStockForm';
// import Sidebar from '../../Sidebar';
// import NextCompleteForm from './NextCompleteForm';
// import axios from 'axios';




// let btnRawMaterial = [
//   {
//     id: 1,
//     title: 'Add Material'
//   }
// ]
// let btnBack = [
//   {
//     id: 1,
//     back: 'Back'
//   }
// ]



// function ComplteStock(props) {
//   const { setPages } = props
//   const [completeStockPages, setCompleteStockPages] = useState(0)
//   const [completestockdata, setCompletestockdata] = useState('')

//   useEffect(() => {
//     getCompleteStockFormData();
//   }, []);

//   async function getCompleteStockFormData() {
//     try {
//       const response = await axios.get('http://localhost:3000/getcompletestockdata');
//       // Assuming the server is running on the same host
//       setCompletestockdata(response.data.data)
//       console.log(response.data.data)
//       // console.log('materialFormData' + materialFormData)
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   }


//   console.log(`complete stock ${JSON.stringify(completestockdata)}`)
//   return (
//     <div className='complete-stock-container'>
//       {completeStockPages == 1 ? <CompleteStockForm setCompleteStockPages={setCompleteStockPages} /> : <div className='complete-stock-home-container'>
//         <div className="raw-material-add-div">
//           <h1>Complete Stock</h1>
//           {btnRawMaterial.map((item) => {
//             return <Button variant="contained" key={item.id} onClick={() => setCompleteStockPages(item.id)}>{item.title}</Button>
//           })}
//         </div>
//         <div className="complete-stock-dashboard">
//           <div style={{ height: 450, width: '100%' }}>
//             <DataGrid
//               columns={[
//                 { field: 'stock_id', hideable: false, width: '90' },
//                 { field: 'stock_material_id', width: '210' },
//                 { field: 'material_name', width: '150' },
//                 { field: 'invoice_number', width: '170' },
//                 { field: 'MRID', width: '120' },
//                 { field: 'opening_stock', width: '130' },
//                 { field: 'closing_balance', width: '130' },
//               ]}
//               rows={completestockdata}
//               getRowId={(row) => row.stock_id}
//               getRowHeight={() => 'auto'}
//               getEstimatedRowHeight={() => 200}
//               sx={{
//                 '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': {
//                   py: 1,
//                 },
//                 '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': {
//                   py: '16px',
//                 },
//                 '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': {
//                   py: '26px',
//                 },
//               }}

//             />
//           </div>
//         </div>
//       </div>}


//     </div >
//   )
// }

// export default ComplteStock




const stockData = [
    {
        "stock_id": 64, "opening_stock": 0, " ": 22, "invoice_number": "fakedata",
        "MRID": null, "stock_material_id": "fakedata_2_charger-pcb-vTrack", "material_name": "V-Track Charger",
        "invoice_date": "2023-11-07T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z",
        "material_id": "charger-pcb-vTrack", "received_qty": 22
    },


    { "stock_id": 65, "opening_stock": 0, "closing_balance": 33, "invoice_number": "fakedata", "MRID": null, "stock_material_id": "fakedata_2_toy-motor-v011-b1", "material_name": "TOY Motor", "invoice_date": "2023-11-07T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z", "material_id": "toy-motor-v011-b1", "received_qty": 33 },
    { "stock_id": 66, "opening_stock": 22, "closing_balance": 44, "invoice_number": "2904", "MRID": null, "stock_material_id": "2904_2_charger-pcb-vTrack", "material_name": "V-Track Charger", "invoice_date": "2023-11-01T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z", "material_id": "charger-pcb-vTrack", "received_qty": 22 },
    { "stock_id": 67, "opening_stock": 0, "closing_balance": 45, "invoice_number": "2904", "MRID": null, "stock_material_id": "2904_2_M-USB-V011-B1", "material_name": "USB Module", "invoice_date": "2023-11-01T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z", "material_id": "M-USB-V011-B1", "received_qty": 45 },
    { "stock_id": 68, "opening_stock": 33, "closing_balance": 83, "invoice_number": "2904", "MRID": null, "stock_material_id": "2904_2_toy-motor-v011-b1", "material_name": "TOY Motor", "invoice_date": "2023-11-01T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z", "material_id": "toy-motor-v011-b1", "received_qty": 50 },
    { "stock_id": 69, "opening_stock": 0, "closing_balance": 300, "invoice_number": "data345", "MRID": null, "stock_material_id": "data345_2_DC-100RPM-V023-AI", "material_name": "DC motor 100rpm", "invoice_date": "2023-11-09T18:30:00.000Z", "submit_date": "2023-11-16T18:30:00.000Z", "material_id": "DC-100RPM-V023-AI", "received_qty": 300 },
    { "stock_id": 70, "opening_stock": 45, "closing_balance": 245, "invoice_number": "data345", "MRID": null, "stock_material_id": "data345_2_M-USB-V011-B1", "material_name": "USB Module", "invoice_date": "2023-11-09T18:30:00.000Z", "submit_date": "2023-11-16T18:30:00.000Z", "material_id": "M-USB-V011-B1", "received_qty": 200 }
];

console.log(stockData);


{
    approveRow.TemplateData.map((item) => {

        const matchingStockData = stockData.filter(
            (stockItem) => stockItem.material_name === item.material_name
        );

        return (
            <div key={item.material_name} className='approve-main-container'>
                <div className='approve-material-details'>
                    <span>
                        <h3>Material Name:</h3>
                        <h3>{item.material_name}</h3>

                    </span>
                    <span>
                        <h3>Issue Quanity:</h3>
                        <h3>{item.issued_qty}</h3>
                    </span>
                    <span>
                        <h3>Remaining qty:</h3>
                        <h3>{item.remainingQty}</h3>
                    </span>
                </div>
                <div>
                    <h2>Stock Material IDs:</h2>
                    {/* <p>{JSON.stringify(matchingStockData)}</p> */}
                    {matchingStockData.map((stockItem) => (
                        <div key={stockItem.stock_material_id} className='div-stock-mat-id'>
                            <p>{stockItem.stock_material_id}</p>
                            <TextField
                                label={`Approve Qty`}
                                type="number"
                                value={item.enterQtyToApprove}
                                onChange={(e) => handleEnterQtyChange(e, item)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    })
}


// with row feilds

// {approveRow.TemplateData.map((item) => {
//     const matchingStockData = stockData.filter(
//         (stockItem) => stockItem.material_name === item.material_name
//     );
//     const isQtyError = item.remainingQty < 0;

//     return (
//         <div className='approve-form' key={item.material_name}>
//             <TextField
//                 disabled
//                 id={`material-name-${item.material_name}`}
//                 label='Material Name'
//                 value={item.material_name}
//                 sx={{
//                     '& > :not(style)': { m: 1, width: 200 },
//                 }}
//             />
//             <TextField
//                 disabled
//                 id={`issued-qty-${item.material_name}`}
//                 label='Issue Qty'
//                 value={item.issued_qty}
//                 sx={{
//                     '& > :not(style)': { m: 1, width: 100 },
//                 }}
//             />
//             <Autocomplete
//                 id={`stock-material-id-${item.material_name}`}
//                 freeSolo
//                 options={matchingStockData.map((stockItem) => stockItem.stock_material_id)}
//                 sx={{
//                     '& > :not(style)': { m: 1, width: 300 },
//                 }}
//                 onInputChange={(event, newValue) => setSelectedStockMaterialId(newValue)}
//                 renderInput={(params) => <TextField {...params} label='Stock Material IDs' />}
//             />
//             <TextField
//                 disabled
//                 label='Instock Qty'
//                 value={item.instockQty}
//                 defaultValue='0'
//                 sx={{
//                     '& > :not(style)': { m: 1, width: 100 },
//                 }}
//             />
//             <TextField
//                 id={`enter-qty-${item.material_name}`}
//                 label='Approve Qty'
//                 value={item.enterQtyToApprove}
//                 onChange={(e) => handleEnterQtyChange(e, item)}
//                 error={isQtyError}
//                 helperText={isQtyError ? 'Remaining Qty cannot be negative' : ''}
//                 sx={{
//                     '& > :not(style)': { m: 1, width: 130 },
//                 }}
//             />
//             <TextField
//                 disabled
//                 id={`remaining-qty-${item.material_name}`}
//                 label='Remaining Qty'
//                 value={item.remainingQty}
//                 defaultValue='0'
//                 sx={{
//                     '& > :not(style)': { m: 1, width: 100 },
//                 }}
//             />
//             <button
//                 type="button"
//                 onClick={() => handleAddButtonClickApprove(item)}
//                 disabled={item.remainingQty === 0}
//             >
//                 Add
//             </button>   

//         </div>

//     );
// })}



// updateTempalte: [{ "stock_id": 64, "opening_stock": 0, "closing_balance": 22, "invoice_number": "fakedata", "MRID": null, "stock_material_id": "fakedata_2_charger-pcb-vTrack", "material_name": "V-Track Charger", "invoice_date": "2023-11-07T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z", "material_id": "charger-pcb-vTrack", "received_qty": 22, "enterQtyToApprove": "022" },
// { "stock_id": 65, "opening_stock": 0, "closing_balance": 33, "invoice_number": "fakedata", "MRID": null, "stock_material_id": "fakedata_2_toy-motor-v011-b1", "material_name": "TOY Motor", "invoice_date": "2023-11-07T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z", "material_id": "toy-motor-v011-b1", "received_qty": 33 },
// { "stock_id": 66, "opening_stock": 22, "closing_balance": 44, "invoice_number": "2904", "MRID": null, "stock_material_id": "2904_2_charger-pcb-vTrack", "material_name": "V-Track Charger", "invoice_date": "2023-11-01T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z", "material_id": "charger-pcb-vTrack", "received_qty": 22, "enterQtyToApprove": "032" },
// { "stock_id": 67, "opening_stock": 0, "closing_balance": 45, "invoice_number": "2904", "MRID": null, "stock_material_id": "2904_2_M-USB-V011-B1", "material_name": "USB Module", "invoice_date": "2023-11-01T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z", "material_id": "M-USB-V011-B1", "received_qty": 45 },
// { "stock_id": 68, "opening_stock": 33, "closing_balance": 83, "invoice_number": "2904", "MRID": null, "stock_material_id": "2904_2_toy-motor-v011-b1", "material_name": "TOY Motor", "invoice_date": "2023-11-01T18:30:00.000Z", "submit_date": "2023-11-15T18:30:00.000Z", "material_id": "toy-motor-v011-b1", "received_qty": 50 },
// { "stock_id": 69, "opening_stock": 0, "closing_balance": 300, "invoice_number": "data345", "MRID": null, "stock_material_id": "data345_2_DC-100RPM-V023-AI", "material_name": "DC motor 100rpm", "invoice_date": "2023-11-09T18:30:00.000Z", "submit_date": "2023-11-16T18:30:00.000Z", "material_id": "DC-100RPM-V023-AI", "received_qty": 300, "enterQtyToApprove": "043" },
// { "stock_id": 70, "opening_stock": 45, "closing_balance": 245, "invoice_number": "data345", "MRID": null, "stock_material_id": "data345_2_M-USB-V011-B1", "material_name": "USB Module", "invoice_date": "2023-11-09T18:30:00.000Z", "submit_date": "2023-11-16T18:30:00.000Z", "material_id": "M-USB-V011-B1", "received_qty": 200 }]

// Newdata:[
//   {
//     "stock_id": 64,
//     "opening_stock": 0,
//     "closing_balance": 22,
//     "invoice_number": "fakedata",
//     "MRID": null,
//     "stock_material_id": "fakedata_2_charger-pcb-vTrack",
//     "material_name": "V-Track Charger",
//     "invoice_date": "2023-11-07T18:30:00.000Z",
//     "submit_date": "2023-11-15T18:30:00.000Z",
//     "material_id": "charger-pcb-vTrack",
//     "received_qty": 22,
//     "enterQtyToApprove": ""
//   },
//   {
//     "stock_id": 65,
//     "opening_stock": 0,
//     "closing_balance": 33,
//     "invoice_number": "fakedata",
//     "MRID": null,
//     "stock_material_id": "fakedata_2_toy-motor-v011-b1",
//     "material_name": "TOY Motor",
//     "invoice_date": "2023-11-07T18:30:00.000Z",
//     "submit_date": "2023-11-15T18:30:00.000Z",
//     "material_id": "toy-motor-v011-b1",
//     "received_qty": 33
//   },
//   {
//     "stock_id": 66,
//     "opening_stock": 22,
//     "closing_balance": 44,
//     "invoice_number": "2904",
//     "MRID": null,
//     "stock_material_id": "2904_2_charger-pcb-vTrack",
//     "material_name": "V-Track Charger",
//     "invoice_date": "2023-11-01T18:30:00.000Z",
//     "submit_date": "2023-11-15T18:30:00.000Z",
//     "material_id": "charger-pcb-vTrack",
//     "received_qty": 22
//   },
//   {
//     "stock_id": 67,
//     "opening_stock": 0,
//     "closing_balance": 45,
//     "invoice_number": "2904",
//     "MRID": null,
//     "stock_material_id": "2904_2_M-USB-V011-B1",
//     "material_name": "USB Module",
//     "invoice_date": "2023-11-01T18:30:00.000Z",
//     "submit_date": "2023-11-15T18:30:00.000Z",
//     "material_id": "M-USB-V011-B1",
//     "received_qty": 45
//   },
//   {
//     "stock_id": 68,
//     "opening_stock": 33,
//     "closing_balance": 83,
//     "invoice_number": "2904",
//     "MRID": null,
//     "stock_material_id": "2904_2_toy-motor-v011-b1",
//     "material_name": "TOY Motor",
//     "invoice_date": "2023-11-01T18:30:00.000Z",
//     "submit_date": "2023-11-15T18:30:00.000Z",
//     "material_id": "toy-motor-v011-b1",
//     "received_qty": 50
//   },
//   {
//     "stock_id": 69,
//     "opening_stock": 0,
//     "closing_balance": 300,
//     "invoice_number": "data345",
//     "MRID": null,
//     "stock_material_id": "data345_2_DC-100RPM-V023-AI",
//     "material_name": "DC motor 100rpm",
//     "invoice_date": "2023-11-09T18:30:00.000Z",
//     "submit_date": "2023-11-16T18:30:00.000Z",
//     "material_id": "DC-100RPM-V023-AI",
//     "received_qty": 300
//   },
//   {
//     "stock_id": 70,
//     "opening_stock": 45,
//     "closing_balance": 245,
//     "invoice_number": "data345",
//     "MRID": null,
//     "stock_material_id": "data345_2_M-USB-V011-B1",
//     "material_name": "USB Module",
//     "invoice_date": "2023-11-09T18:30:00.000Z",
//     "submit_date": "2023-11-16T18:30:00.000Z",
//     "material_id": "M-USB-V011-B1",
//     "received_qty": 200
//   },
//   {
//     "stock_id": 94,
//     "opening_stock": 22,
//     "closing_balance": 10,
//     "invoice_number": "fakedata",
//     "MRID": "MR86792392",
//     "stock_material_id": "fakedata_2_charger-pcb-vTrack",
//     "material_name": "V-Track Charger",
//     "invoice_date": "2023-11-07T18:30:00.000Z",
//     "submit_date": "2023-11-15T18:30:00.000Z",
//     "material_id": "charger-pcb-vTrack",
//     "received_qty": 22
//   },
//   {
//     "stock_id": 95,
//     "opening_stock": 44,
//     "closing_balance": 36,
//     "invoice_number": "2904",
//     "MRID": "MR86792392",
//     "stock_material_id": "2904_2_charger-pcb-vTrack",
//     "material_name": "V-Track Charger",
//     "invoice_date": "2023-11-01T18:30:00.000Z",
//     "submit_date": "2023-11-15T18:30:00.000Z",
//     "material_id": "charger-pcb-vTrack",
//     "received_qty": 22
//   },
//   {
//     "stock_id": 96,
//     "opening_stock": 300,
//     "closing_balance": 270,
//     "invoice_number": "data345",
//     "MRID": "MR86792392",
//     "stock_material_id": "data345_2_DC-100RPM-V023-AI",
//     "material_name": "DC motor 100rpm",
//     "invoice_date": "2023-11-09T18:30:00.000Z",
//     "submit_date": "2023-11-16T18:30:00.000Z",
//     "material_id": "DC-100RPM-V023-AI",
//     "received_qty": 300
//   },
//   {
//     "stock_id": 97,
//     "opening_stock": 44,
//     "closing_balance": -1,
//     "invoice_number": "2904",
//     "MRID": "MR14823598",
//     "stock_material_id": "2904_2_charger-pcb-vTrack",
//     "material_name": "V-Track Charger",
//     "invoice_date": "2023-11-01T18:30:00.000Z",
//     "submit

// _date": "2023-11-15T18:30:00.000Z",
//     "material_id": "charger-pcb-vTrack",
//     "received_qty": 22
//   }
// ]
{
    procurementPage === 1 ? <ProcurementAdd setProcurementPage={setProcurementPage} /> :
        procurementPage === 2 ? <ProcurementSummary setProcurementPage={setProcurementPage} /> :
            <div className='main-procurement-container'>
            </div>
}

