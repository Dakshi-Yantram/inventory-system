import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import './request.css'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function ApprovePage(props) {
    const { setRequestPage, approveRow, setApproveRow, ipAddress } = props;
    const [stockData, setStockData] = useState([]);
    const [selectedStockMaterialId, setSelectedStockMaterialId] = useState('');
    const [instockQty, setInstockQty] = useState('');
    const [closingBalance, setClosingBalance] = useState('');
    const [enterQtyToApprove, setEnterQtyToApprove] = useState('');
    const [open, setOpen] = React.useState(false);
    const [denyReason, setDenyReason] = useState('');

    // Event handler to update the state when the user enters text
    const handleDenyReasonChange = (event) => {
        setDenyReason(event.target.value);
    };


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`http://${ipAddress}/getcompletestockdata`);
                setStockData(response.data.data);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        fetchData();
    }, []);

    const handleDeny = async () => {
        // Perform actions needed when Deny button is clicked
        // For example, send a request to update the database
        try {
            await axios.post(`http://${ipAddress}/denyRequest`, {
                approveRowData: approveRow.MRID,
                denyReason: denyReason
            });
            setRequestPage(0);
        } catch (error) {
            console.error('Error denying request:', error);
        }
    };

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

    // console.log(`apoprove template data  ${JSON.stringify(approveRow)}`)
    console.log(denyReason)
    // console.log(`stock diosdfjhdsflkjata : ${JSON.stringify(stockData)}`)
    return (
        <div>
            <div className='Request-add-div'>
                <h1>Approve Page</h1>
                <Button variant='contained' className='add-vendor' onClick={() => setRequestPage(0)}>
                    Back
                </Button>
            </div>
            <div className='request-dashboard'>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        columns={[
                            { field: 'material_name', hideable: false, width: 200, },
                            { field: 'issued_qty', width: 140, },
                            {
                                field: 'instock_qty',
                                width: 140,
                                valueGetter: instockQtyGetter,
                            },
                            {
                                field: 'remaining_qty',
                                width: 140,
                                valueGetter: (params) => {
                                    const instockQty = closingBalanceSumByMaterial[params.row.material_name] || 0;
                                    const issuedQty = params.row.issued_qty || 0;
                                    return instockQty - issuedQty;
                                },
                                cellClassName: (params) => {
                                    const remainingQty = params.value || 0;
                                    return remainingQty < 0 ? 'red-text' : ''; // Apply 'red-text' class if remainingQty is less than 0
                                },
                            },


                        ]}
                        rows={approveRow.TemplateData}
                        getRowId={(row) => row.id}
                        // onRowClick={(e) => handleRowClick(e, 1)}
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
                </div>
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-around'
            }}>
                <Button variant='contained' onClick={handleClickOpen}>
                    Deny
                </Button>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Request deny"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Do you want to deny this request?
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Deny reason"
                                fullWidth
                                variant="standard"
                                value={denyReason}  // Set the value of the TextField from the state
                                onChange={handleDenyReasonChange}  // Handle text input changes
                            />
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button variant='contained' className='add-vendor' onClick={handleDeny}>
                            Deny
                        </Button>
                    </DialogActions>
                </Dialog>
                <Button variant='contained' className='add-vendor' onClick={() => setRequestPage(3)}>
                    Approve
                </Button>
            </div>
        </div>
    );
}

export default ApprovePage
