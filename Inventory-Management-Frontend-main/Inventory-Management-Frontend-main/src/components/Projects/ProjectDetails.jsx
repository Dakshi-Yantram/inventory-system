import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import Button from '@mui/material/Button';



let btnBack = [
    {
      id: 1,
      title: 'Back',
    },
  
  ]


function ProjectDetails(props) {
    const { setProjectPages, setViewRow, viewRow, projectPages ,ipAddress} = props;
    const [projectDetails, setProjectDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getRequestData();
    }, []);

    async function getRequestData() {
        try {
            const response = await axios.post(`http://${ipAddress}/projectDetailsDashBoard`, { viewRow });
            const projectDataWithSerial = response.data.projectTemplateData.map((item, index) => ({
                ...item,
                sr_no: index + 1,
            }));
            setProjectDetails(projectDataWithSerial);
        } catch (error) {
            console.error('Error fetching project details:', error);
            setError('Failed to fetch project details');
        } finally {
            setLoading(false);
        }
    }
    console.log(viewRow)

    return (
        <div className='project-details-container'>
            <div className='project-head'>
                <h1>Project Details</h1>
                {btnBack.map((item) => {
                    return <Button variant="contained" key={item.id} onClick={() => setProjectPages(0)}>{item.title}</Button>
                })}
            </div>
            <div className="details-dashboard">
                <h2 className='project-name-in-dashboard'>project Name:- {viewRow.ProjectName}</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <div style={{ height: 470, width: '100%' }}>
                        <DataGrid
                            columns={[
                                { field: 'sr_no', hideable: false, width: 140, headerName: 'Sr.No' },
                                // { field: 'projectName', width: 240, headerName: 'Project Name' },
                                { field: 'material_name', width: 240, headerName: 'Material Name' },
                                { field: 'qty_pcb', width: 240, headerName: 'QTY/PCB' },
                                { field: 'ExtraPercentage', width: 240, headerName: 'Extra Percentage' },
                            ]}
                            rows={projectDetails}
                            getRowId={(row) => row.ID}
                            getRowHeight={() => 'auto'}
                            getEstimatedRowHeight={() => 250}
                            sx={{
                                '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: 1 },
                                '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: '16px' },
                                '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: '26px' },
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectDetails;
