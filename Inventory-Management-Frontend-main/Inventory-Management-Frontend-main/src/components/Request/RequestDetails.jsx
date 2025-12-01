import React, { useRef } from 'react'
import Button from '@mui/material/Button';
import logo from '../../assets/logo.png'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';



function RequestDetails(props) {
    const { row, setSelectedRow, setRequestPage ,ipAddress} = props


    const contentRef = useRef(null);
    const downloadPDF = () => {
        if (contentRef.current) {
            const input = contentRef.current;
            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = 297; // A4 height in mm

            html2canvas(input, {
                scale: 1.6, // You can adjust the scale to control the quality of the capture
                width: pdfWidth * 5.433, // Convert mm to pixels (1mm = 3.78px)
                height: pdfHeight * 4.933,
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save("downloaded_pdf.pdf");
            });
        }
    };

console.log(row)

    return (
        <div>
            <div className='Request-add-div' >
                <h1>Request Details</h1>
                <Button variant="contained" className='add-vendor' onClick={() => (setRequestPage(0))}>Back</Button>
            </div>
            <div className='request-each-list' ref={contentRef} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'white',
                padding: '20px',
                borderRadius: '20px',
                fontSize:'19px'
            }}>
                <table style={{
                    width: '90%',
                    marginTop:'40px',
                    letterSpacing:'0.5px',
                }}>
                    <thead style={{
                        height:'120px',
                    }}>
                        <tr>
                            <th>MATERIAL REQUEST FORM</th>
                            <th rowSpan={2}><img src={logo} alt="Logo" height={50} width={100} /></th>
                            <th>YANTRAM MEDTECH PVT LTD</th>
                        </tr>
                        <tr>
                            <th>Doc No . YMPL-PUR-F03 REV NO:00</th>
                            <th>Page 1 of 1</th>
                        </tr>
                    </thead>
                </table>
                <div style={{
                    width: '90%',
                    height: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        margin: '40px 10px',
                        display: 'flex',
                        justifyContent: 'space-around'
                    }}>
                        <p>Request No: {row.MRID}</p>
                        <p>Request Date: {new Date(row.Date).toLocaleDateString()}</p>
                    </div>
                    <div style={{
                        margin: '10px 10px',
                        display: 'flex',
                        justifyContent: 'space-around'
                    }}>
                        <p>Department : {row.EmployeeDept}</p>
                        <p>Requested By : {row.EmployeeName}</p>
                    </div>
                </div>
                <div style={{
                    width: '90%',
                    marginTop:'30px'
                }}>
                    <table style={{
                        width: '100%'
                    }}>
                        <thead>
                            <tr style={{
                                height: '40px'
                            }}>
                                <th>S.No</th>
                                <th>Item Description for the Product</th>
                                <th>Qty Required</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(Math.max(10, row.TemplateData.length))].map((_, index) => {
                                const item = row.TemplateData[index] || {};
                                return (
                                    <tr key={index} style={{ height: '56px', textAlign: 'center' }}>
                                        <td>{index + 1}</td> {/* S.No */}
                                        <td>{item.material_name}</td> {/* Item Description for the Product */}
                                        <td>{item.issued_qty}</td> {/* Qty Required */}
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems:'center',
                        marginTop: '120px'
                    }}>
                        <table style={{
                            width: '90%'
                        }}>
                            <thead style={{
                                height:'50px'
                            }}>
                                <tr>
                                    <th>Requester Signature</th>
                                    <th>Approved By</th>
                                </tr>
                            </thead>
                            <tr style={{
                                height: '50px'
                            }}>
                                <td></td>
                                <td></td>
                            </tr>
                        </table>
                    </div>
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '50px'
                    }}>
                        <table style={{
                            width: '100%',
                        }}>
                            <thead style={{
                                height: '50px'
                            }}>
                                <th>Date</th>
                                <th>Reviewed By</th>
                                <th>Approved By</th>
                            </thead>
                            <tbody style={{
                                height: '50px'
                            }}>
                                <td>-</td>
                                <td>Mr. Chandrakath panjal (QC MGR /MR)</td>
                                <td>Ms. Kanika Bansal (Director)</td>
                            </tbody>
                        </table>
                    </div>

                </div>


            </div>
            <div className='downloadaspdf' style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center'
            }}>
                <Button variant="contained" onClick={downloadPDF}>Download as PDF</Button>
            </div>

        </div>
    )
}

export default RequestDetails
