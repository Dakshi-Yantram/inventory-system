import React, { useEffect, useRef, useState } from 'react'
import './Vendor.css'
import Button from '@mui/material/Button';
// import logo from '../../../public/assets/logo.png'
import logo from '../../assets/logo.png'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


function VendorDetails(props) {
  const { row, setVendorPage, ipAddress } = props
  const [trialFormattedDate, setTrialFormatedDate] = useState('')
  console.log(row)


  useEffect(() => {
    // Format the order_date from the row object
    const orderDate = new Date(row.order_date);
    const formattedOrderDate = `${orderDate.getDate()}-${orderDate.getMonth() + 1}-${orderDate.getFullYear()}`;
    setTrialFormatedDate(formattedOrderDate);
  }, [row.order_date]);


  const contentRef = useRef(null);
  const downloadPDF = () => {
    if (contentRef.current) {
      const input = contentRef.current;
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      html2canvas(input, {
        scale: 1.6, // You can adjust the scale to control the quality of the capture
        width: pdfWidth * 5.733, // Convert mm to pixels (1mm = 3.78px)
        height: pdfHeight * 4.733,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save("downloaded_pdf.pdf");
      });
    }
  };

  return (
    <div>
      <div className='vendor-add-div' >
        <h1>Vendor Details</h1>
        <Button variant="contained" className='add-vendor' onClick={() => (setVendorPage(0))}>Back</Button>
      </div>
      <div className='vendor-each-list' ref={contentRef}>
        <table style={{
          width: '80%'
        }}>
          <thead>
            <tr>
              <th>SUPPLIER ENLISHMENT FORM</th>
              <th rowSpan={2}><img src={logo} alt="Logo" height={50} width={100} /></th>
              <th>YANTRAM MEDTECH PVT LTD</th>
            </tr>
            <tr>
              <th>Doc No . YMPL-PUR-F03 REV NO:00</th>
              <th>Page 1 of 1</th>
            </tr>
          </thead>
        </table>
        <br />
        <table style={{
          width: '80%'
        }}>
          <tr style={{
            height: '40px'
          }}>
            <th>Name of Supplier</th>
            <td style={{
              padding: '0px 5px'
            }}>{row.supplier}</td>
            <th>Date</th>
            <td style={{
              padding: '0px 5px'
            }}>{row.date}</td>
          </tr>
          <tr>
            <td rowSpan={5} colSpan={2}>{row.office_address}</td>
            <th>Contact Person</th>
            <td>{row.office_contact_person}</td>
          </tr>
          <tr>
            <th>Designation</th>
            <td>{row.office_designation}</td>
          </tr>
          <tr>
            <th>Telephone</th>
            <td>{row.office_telephone}</td>
          </tr>
          <tr>
            <th>Fax</th>
            <td>{row.office_fax}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{row.office_email}</td>
          </tr>
          <tr>
            <td rowSpan={5} colSpan={2}>{row.work_address}</td>
            <th>Contact Person</th>
            <td>{row.work_contact_person}</td>
          </tr>
          <tr>
            <th>Designation</th>
            <td>{row.work_designation}</td>
          </tr>
          <tr>
            <th>Telephone</th>
            <td>{row.work_telephone}</td>
          </tr>
          <tr>
            <th>Fax</th>
            <td>{row.work_fax}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{row.work_email}</td>
          </tr>
          <tr>
            <th colSpan={2}>Nature of business</th>
            <td colSpan={2}>{row.business}</td>
          </tr>
          <tr>
            <th colSpan={2}>Products / services</th>
            <td colSpan={2}>{row.product}</td>
          </tr>
          <tr>
            <th colSpan={2}>Wealther Iso 9001 Certified?</th>
            <td colSpan={2}>{row.iso_certified}</td>
          </tr>
          <tr>
            <th colSpan={2}>number of years of doing bussiness in relevant field</th>
            <td colSpan={2}>{row.relevant_field}</td>
          </tr>
          <tr>
            <th colSpan={2}>major clients</th>
            <td colSpan={2}>{row.major_client}</td>
          </tr>
          <tr>
            <th colSpan={2}>Trail date order</th>
            <td colSpan={2}>{trialFormattedDate}</td>
          </tr>
        </table>
        <br /><br />
        <div style={{
          width: '80%',
          border: '1px solid black',
          padding: '20px',
          wordSpacing: '6px',
          letterSpacing: '1px'
        }}>
          <center><h3>Final decision on supplier enlistment</h3></center><br /><br />
          <div>
            <h3>Supplier Approved [   ]</h3>
            <h3>To re-assess after the supplier takes corrective actions [   ]</h3>
            <h3>Enlistment Application Rejection [    ]</h3>
          </div>
          <div style={{
            marginTop: '50px'
          }}>
            <p>Name , signature and date of atleast two memebers of supplier Development Team</p><br /><br />
            <div style={{
              width: '300px',
              display: 'flex',
              justifyContent: 'space-between'

            }}>
              <h4>1 : (Name)</h4>
              <h4>1 : (Signature)</h4>
            </div>
            <br /><br />
            <div style={{
              width: '300px',
              display: 'flex',
              justifyContent: 'space-between'

            }}>
              <h4>2 : (Name)</h4>
              <h4>2 : (Signature)</h4>
            </div>
          </div>


        </div>

      </div>
      <div className='downloadaspdf'>
        <Button variant="contained" onClick={downloadPDF}>Download as PDF</Button>
      </div>

    </div>
  )
}

export default VendorDetails
