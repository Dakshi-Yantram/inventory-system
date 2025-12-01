import React, { useState, useEffect, useRef } from 'react'
import './Vendor.css'
import Button from '@mui/material/Button';
import VendorForm from './VendorForm';
import { styled } from '@mui/material/styles';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { useLocation } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
} from '@mui/x-data-grid';
import VendorDetails from './VendorDetails';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import logo from '../../assets/logo.png'



function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}



let vendors = [
  {
    id: 1,
    title: 'Add Vendor'
  },
]
function Vendor(props) {
  const { vendorPage, setVendorPage, ipAddress } = props
  const [vendorFile, setVendorFile] = useState(null);

  const [formData, setFormData] = useState([]);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const [formattedDate, setFormatedDate] = useState('')
  const [trialFormattedDate, setTrialFormatedDate] = useState('')
  const navigate = useNavigate();

  const [autoIncrementValue, setAutoIncrementValue] = useState(1);

  const getNextAutoIncrementValue = () => {
    setAutoIncrementValue(autoIncrementValue + 1);
    return autoIncrementValue;
  };
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [openExcel, setOpenExcel] = React.useState(false);
  const handleClickOpenExcel = () => {
    setOpenExcel(true);
  };

  const handleCloseExcel = () => {
    setOpenExcel(false);
  };

  const componentPdf = useRef();

  const handleFileChange = (e) => {
    setVendorFile(e.target.files[0]);
  };

  const handleRowClick = (params, index) => {
    console.log(index)
    setSelectedRow(params.row);
    console.log(params.row)
    setVendorPage(index)

    // navigate('/vendor/vendorDetails');

  };

  useEffect(() => {
    getVendorFormData();
  }, []);

  async function getVendorFormData() {
    try {
      const response = await axios.get(`http://${ipAddress}/api/vendorform`);
      const formDataWithIndex = response.data.data.map((item, index) => ({ ...item, serialNo: index + 1 }));
      setFormData(formDataWithIndex);
      // console.log(response.data)
    } catch (error) {
      console.error('Error:', error);
    }
  }



  const generatePDF = useReactToPrint({
    content: () => componentPdf.current,
    documentTitle: 'vendor list',
  });

  const handleExcelSubmit = async () => {
    if (!vendorFile) {
      alert('Please select an Excel file.');
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', vendorFile);

    try {
      const response = await axios.post(`http://${ipAddress}/vendorExcel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(`Vendor Excel Data : ${JSON.stringify(response.data.jsonData)}`);
      // Optionally, update the state or perform any other actions after successful submission

      setOpenExcel(false); // Close the dialog after successful submission
    } catch (error) {
      console.error('Error submitting data:', error);
      // Handle errors
    }
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
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    };

    // Use html2pdf to generate the PDF
    html2pdf(element, options);
  };

  console.log(`formData : ${JSON.stringify(formData)}`)
  // console.log(setVendorPage)
  return (
    <div className='vendor-container'>
      {vendorPage === 1 ? <VendorForm setVendorPage={setVendorPage} ipAddress={ipAddress}/> : vendorPage == 2 ? <VendorDetails row={selectedRow} setVendorPage={setVendorPage} ipAddress={ipAddress}/> :

        <div className='vendor-home-page'>
          <div className="vendor-add-div">
            <h1>List of Vendors</h1>
            {vendors.map((item) => {
              return <NavLink to='/vendor/vendorForm'><Button variant="contained" className='add-vendor' key={item.id} onClick={() => setVendorPage(item.id)}><AddIcon />{item.title}</Button></NavLink>
            })}
            <Button variant="contained" onClick={handleClickOpenExcel}>
              Upload excel
            </Button>
            <Dialog open={openExcel} onClose={handleCloseExcel}>
              <DialogTitle>Upload excel sheet</DialogTitle>
              <DialogContent>

                <TextField
                  autoFocus
                  margin='dense'
                  id='csvInput'
                  name='file'
                  type='File'
                  fullWidth
                  variant='standard'
                  accept='.xlsx, .xls, .csv'
                  onChange={handleFileChange}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseExcel}>Cancel</Button>
                <Button onClick={handleExcelSubmit}>Submit</Button>
              </DialogActions>
            </Dialog>
          </div>
          <div className="vendor-dashboard">
            <div style={{ height: 470, width: '100%' }} ref={componentPdf}>
              <DataGrid

                columns={[
                  // {
                  //   field: 'id', hideable: false, width: 70, headerName: 'ID',
                  //   valueGetter: (params) => {
                  //     const paddedVendorId = String(params.row.id).padStart(4, '0'); // Pad with leading zeros
                  //     return `V${paddedVendorId}`;
                  //   }
                  // },
                  {
                    field: 'serialNo', hideable: false, width: 70, headerName: 'S.No',
                  },
                  {
                    field: 'order_date', width: 120, headerName: 'Date Of Approval',
                    valueGetter: (params) => {
                      const orderDate = new Date(params.row.order_date);
                      const formattedOrderDate = `${orderDate.getDate()}-${orderDate.getMonth() + 1}-${orderDate.getFullYear()}`;
                      return formattedOrderDate
                    }
                  },
                  {
                    field: 'product', width: 140, headerName: 'Item/service',
                    valueGetter: (params) => { return (params.row.product) }
                  },
                  {
                    field: 'supplier', width: 370, headerName: 'Name & Address of supplier / service  Provider',
                    renderCell: (params) => (
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {`${params.row.supplier}\n${params.row.office_address}`}
                      </div>
                    ),
                  },
                  { field: 'office_contact_person', width: 150, headerName: 'Contact Persons', },
                  { field: 'office_telephone', width: 130, headerName: 'Contact Nos.', },
                  { field: 'Lead_time', width: 100, headerName: 'Lead Time for Supply', },

                ]}
                pagination
                pageSize={25} // Set the default page size
                pageSizeOptions={[5, 25, 50, 100]}
                rows={formData}
                onRowClick={(e) => handleRowClick(e, 2)}
                getRowHeight={() => 'auto'}
                getEstimatedRowHeight={() => 200}
                onChange={handleFileChange}
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
          <div>
            <Button variant="contained" onClick={handleClickOpen}>
              Download as PDF
            </Button>
            <Dialog
              fullScreen={fullScreen}
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
                    <table style={{
                      width: '100%'
                    }}>
                      <thead>
                        <tr>
                          <th>LIST OF SUPPLIERS</th>
                          <th rowSpan={2}><img src={logo} alt="Logo" height={80} width={140} /></th>
                          <th>YANTRAM MEDTECH PVT LTD</th>
                        </tr>
                        <tr>
                          <th>Doc No . YMPL-PUR-F03 REV NO:00</th>
                          <th>Page 1 of 1</th>
                        </tr>
                      </thead>
                    </table>
                    <div className='list-of-vendors-main-container'>
                      <table style={{
                        width: '100%'
                      }}>
                        <thead>
                          <tr style={{
                            height: '60px'
                          }}>
                            <th>Vendor ID</th>
                            <th style={{
                              width: '130px'
                            }}>Date Of approval</th>
                            <th>Item/Service</th>
                            <th>Contact Person</th>
                            <th>Contact NOs</th>
                            <th>Lead Time for Supply</th>
                            <th>Selection Criteria</th>
                            <th>Remarks /Sign</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.map((item) => (
                            <tr key={item.id}>
                              <td>{`V${String(item.id).padStart(4, '0')}`}</td>
                              <td>{item.date.split('T')[0]}</td>
                              <td>{`${item.supplier}\n${item.product}`}</td>
                              <td>{item.office_contact_person}</td>
                              <td>{item.office_telephone}</td>
                              <td>{item.Lead_time}</td>
                              <td></td>
                              <td></td>
                            </tr>
                          ))}
                        </tbody>

                      </table>
                    </div>
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
          </div>
        </div>
      }


    </div>
  )
}
export default Vendor
