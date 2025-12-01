import React, { useState, useEffect } from 'react'
import './Procurement.css'
import Button from '@mui/material/Button';
import {
    GridRowModes,
    DataGrid,
    GridToolbarContainer,
    GridActionsCellItem,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';



function ProcurementDataTable(props) {
    const { projectTemplateData ,ipAddress} = props;
    return (
        <div className="procurement-dashboard">
            <div style={{ height: 470, width: '100%' }}>
                <DataGrid
                    columns={[
                        {
                            field: 'sr_no', hideable: false, width: 70, headerName: 'Sr.NO',
                            // valueGetter: (params) => { return (params.row.MRID) }
                        },
                        {
                            field: 'material_name', hideable: false, width: 140, headerName: 'Material Name',
                            // valueGetter: (params) => { return (params.row.MRID) }
                        },

                        { field: 'value', width: 140, headerName: 'Value', },
                        {
                            field: 'package', width: 140, headerName: 'Package',
                            // valueGetter: (params) => { return (params.row.Date.split('T')[0]) }
                        },
                        {
                            field: 'qty_pcb', width: 140, headerName: 'QTY/PCB',
                        },
                        {
                            field: 'ExtraPercentage', width: 140, headerName: 'Extra % order',
                        },
                        {
                            field: 'totalQty', width: 140, headerName: 'Total Qty',
                        },
                        {
                            field: 'finalQty', width: 140, headerName: 'Final Qty',
                        },

                    ]}
                    rows={projectTemplateData}
                    getRowId={(row) => row.project_id + "-" + row.material_name}

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
    )
}

export default ProcurementDataTable
