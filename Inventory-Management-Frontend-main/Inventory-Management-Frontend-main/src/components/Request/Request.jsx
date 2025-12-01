import React, { useState, useEffect } from 'react'
import './request.css'
import Button from '@mui/material/Button';
import axios from 'axios';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import html2pdf from 'html2pdf.js';


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
import { styled } from '@mui/material/styles';
import RequestDetails from './RequestDetails';
import RequestForm from './RequestForm';
import RequestApprove from './RequestApprove';
import ApprovePage from './ApprovePage';


function Request(props) {
  const { setRequestPage, requestPage ,ipAddress} = props
  const [selectedRow, setSelectedRow] = React.useState(null);
  // const [requestPage, setRequestPage] = useState(0)
  const [requestData, setRequestData] = useState([])
  const [approveRow, setApproveRow] = React.useState(null);

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleDownload = () => {
    // Get the element you want to convert to PDF
    const element = document.querySelector('.download-pdf-div');

    // Set options for html2pdf
    const options = {
      margin: 10,
      filename: 'downloaded-document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Use html2pdf to generate the PDF
    html2pdf(element, options);
  };

  let btnRequest = [
    {
      id: 1,
      title: 'Request Form'
    }
  ]

  const handleRowClick = (params, index) => {
    console.log(`index ${index}`)
    setSelectedRow(params.row);

    // console.log(`params.row ${JSON.stringify(params.row)}`)
    // console.log(params.row)
    setRequestPage(index)
  };

  useEffect(() => {
    getRequestData();
  }, []);

  async function getRequestData() {
    try {
      const response = await axios.get(`http://${ipAddress}/requestData`);
      // Assuming the server is running on the same host
      const requestDataWithSerial = response.data.data.map((item, index) => ({
        ...item,
        sr_no: index + 1,
      }));
      setRequestData(requestDataWithSerial)
      // console.log(response.data)
    } catch (error) {
      console.error('Error:', error);
    }
  }
  // console.log(`request data : ${JSON.stringify(requestData)}`)


  // console.log(`onclick approveRow : ${JSON.stringify(approveRow)}`)
  return (
    <div className='request-container'>


      {requestPage == 1 ? <RequestDetails row={selectedRow} setSelectedRow={setSelectedRow} setRequestPage={setRequestPage} ipAddress={ipAddress} /> :
        requestPage == 2 ? <RequestForm setRequestPage={setRequestPage} ipAddress={ipAddress}/> :
          requestPage == 3 ? <RequestApprove setRequestPage={setRequestPage} setApproveRow={setApproveRow} approveRow={approveRow} ipAddress={ipAddress}/> :
            requestPage == 4 ? <ApprovePage setRequestPage={setRequestPage} setApproveRow={setApproveRow} approveRow={approveRow} ipAddress={ipAddress}/> : <div>
              <div className="raw-material-add-div">
                <h1>Request Page</h1>
                {btnRequest.map((item) => {
                  return <NavLink to='/request/requestForm'><Button variant="contained" key={item.id} onClick={() => (setRequestPage(2))}>{item.title}</Button></NavLink>


                })}
                
              </div>
              <div className="request-dashboard">
                <div style={{ height: 470, width: '100%' }}>
                  <DataGrid
                    columns={[
                      {
                        field: 'sr_no', hideable: false, width: 140, headerName: "S.No",
                        // valueGetter: (params) => { return (params.row.MRID) }
                      },

                      {
                        field: 'MRID', width: 140, headerName: "MRID",
                        // valueGetter: (params) => { return (params.row.MRID) }
                      },

                      { field: 'EmployeeName', width: 140, headerName: "Employee Name" },
                      {
                        field: 'Date', width: 190, headerName: "Date",
                        valueGetter: (params) => { return (params.row.Date.split('T')[0]) }
                      },
                      {
                        field: 'Status', width: 140, headerName: "Status"
                      },
                      {
                        field: 'deny_reason', width: 140, headerName: "Reason"
                      },
                      {
                        field: 'actions',
                        type: 'actions',
                        headerName: 'Actions',
                        width: 100,
                        cellClassName: 'actions',
                        // headerName: "Action",
                        getActions: (row) => {
                          return [
                            <GridActionsCellItem
                              icon={<DoneIcon />}
                              label="Edit"
                              onClick={() => {
                                console.log(row.row)
                                setApproveRow(row.row)
                                setRequestPage(4)

                              }} // Pass MRID to handleEditClick
                              className="textPrimary"
                              color="inherit"
                              disabled={row.row.Status == 'Approved' || row.row.Status == "Denied"}
                            />,
                          ];
                        },
                      },


                      // {field: 'office_contact_person', width: 180 },
                      // {field: 'office_telephone', width: 180 },
                      // {field: 'Lead_time', width: 120 },
                    ]}
                    rows={requestData}
                    getRowId={(row) => row.sr_no}
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
              {/* <div>
                <Button variant="contained" onClick={handleClickOpen}>
                  Download as PDF
                </Button>
                <Dialog
                  // fullScreen={fullScreen}
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="responsive-dialog-title"
                >
                  <DialogTitle id="responsive-dialog-title">
                    {"List of Vendors"}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      <div className="download-pdf-div">
                        <h1>hello</h1>
                      </div>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleDownload} autoFocus variant="contained" >
                      download now
                    </Button>
                  </DialogActions>
                </Dialog>
              </div> */}

            </div>}

    </div >
  )
}
export default Request
