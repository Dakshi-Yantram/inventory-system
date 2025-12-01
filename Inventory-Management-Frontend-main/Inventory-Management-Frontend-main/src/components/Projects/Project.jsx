import React, { useState, useReducer, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { DataGrid, GridActionsCellItem, } from '@mui/x-data-grid';
import axios from 'axios';
import './Project.css';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ProjectDetails from './ProjectDetails';

// Define reducer initial state
const initialState = {
  loading: false,
  success: null,
  error: null,
};

// Define reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, loading: true, success: null, error: null };
    case 'SUCCESS':
      return { ...state, loading: false, success: action.payload, error: null };
    case 'FAILURE':
      return { ...state, loading: false, success: null, error: action.payload };
    default:
      return state;
  }
};

function Project(props) {
  const { projectPages, setProjectPages, ipAddress } = props
  const [file, setFile] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [state, dispatch] = useReducer(reducer, initialState);
  const [viewRow, setViewRow] = useState('')
  const [projectData, setprojectData] = useState([])

  useEffect(() => {
    getprojectData();
  }, []);

  async function getprojectData() {
    try {
      const response = await axios.get(`http://${ipAddress}/projectDetails`);
      // Assuming the server is running on the same host

      const projectDataWithSerial = response.data.data.map((item, index) => ({
        ...item,
        sr_no: index + 1,
      }));
      setprojectData(projectDataWithSerial)

      // console.log(response.data.data)
      // console.log('materialFormData' + materialFormData)
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // console.log(`projectDetails: ${JSON.stringify(projectData)}`)

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    dispatch({ type: 'START_LOADING' });

    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('projectName', projectName);

    try {
      const response = await axios.post(`http://${ipAddress}/api/uploadExcel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const responseData = response.data;

        console.log('Project Name:', projectName);
        console.log('Excel Data:', responseData);

        dispatch({ type: 'SUCCESS', payload: 'Data read and project inserted successfully' });
        setTimeout(() => {
          handleClose();
          window.location.reload();
        }, 1500);
      } else {
        console.error('File upload failed.');
        dispatch({ type: 'FAILURE', payload: 'Failed to insert project into the database' });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      dispatch({ type: 'FAILURE', payload: 'An error occurred while uploading the file' });
    }
  };

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };




  // console.log(projectDataWithSerial)
  return (
    <div>
      {projectPages == 1 ? <ProjectDetails setProjectPages={setProjectPages} setViewRow={setViewRow} viewRow={viewRow} projectPages={projectPages} ipAddress={ipAddress}/> : <div className='project-container'>
        <div className='project-head'>
          <h1>Projects</h1>
          <Button variant='outlined' className='projectAddBtn' onClick={handleClickOpen}>
            Add Projects
          </Button>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add New project</DialogTitle>
            <DialogContent>
              <DialogContentText>Please Add a new project.</DialogContentText>
              <TextField
                autoFocus
                margin='dense'
                id='name'
                label='Project Name'
                type='text'
                fullWidth
                variant='standard'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <TextField
                autoFocus
                margin='dense'
                id='csvInput'
                label='Project Name'
                name='file'
                type='File'
                fullWidth
                variant='standard'
                accept='.xlsx, .xls'
                onChange={handleFileChange}
              />

              {state.success ? (
                <div>Form submitted successfully!</div>
              ) : (
                <div>{state.error || ''}</div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleUpload} disabled={state.loading}>
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        <div className='project-dashboard'>
          <div style={{ height: 470, width: '100%' }}>
            <DataGrid
              columns={[
                {
                  field: 'sr_no',
                  hideable: false,
                  width: 240,
                  headerName: 'Sr.No',
                },
                { field: 'ProjectName', width: 500, headerName: 'Project Name' },
                {
                  field: 'action',
                  type: 'actions',
                  headerName: 'Actions',
                  width: 100,
                  cellClassName: 'actions',
                  getActions: (row) => {
                    return [
                      <GridActionsCellItem
                        icon={<VisibilityIcon />}
                        label="Edit"
                        onClick={() => {
                          console.log("VIEW CLICKED:", row.row) 
                          // console.log(row.row)
                          // setApproveRow(row.row)
                          setViewRow(row.row)
                          setProjectPages(1)
                        }}
                        className="textPrimary"
                        color="inherit"
                      />,
                    ];
                  },
                },
              ]}
              rows={projectData}
              // Assuming you have your row data here
              getRowId={(row) => row.project_id}
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
      </div>}
    </div>
  );
}

export default Project;
