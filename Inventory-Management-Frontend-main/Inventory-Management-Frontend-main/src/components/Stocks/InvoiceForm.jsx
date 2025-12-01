import React, { useState, useEffect, useReducer } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import NextCompleteForm from './NextCompleteForm';

const initialState = {
    isSubmitted: false,
    isLoading: false,
    error: null,
};

const formReducer = (state, action) => {
    switch (action.type) {
        case 'SUBMIT_FORM':
            return { ...state, isLoading: true };
        case 'SUBMIT_SUCCESS':
            return { ...state, isSubmitted: true, isLoading: false };
        case 'SUBMIT_ERROR':
            return { ...state, isSubmitted: false, isLoading: false, error: action.payload };
        default:
            return state;
    }
};

function InvoiceForm(props) {
    const { setCompleteStockPages, ipAddress } = props;
    const [state, dispatch] = useReducer(formReducer, initialState);

    const [vendorFormData, setVendorFormData] = useState([]);
    const [selectedValues, setSelectedValues] = useState([]);
    const [invoiceFormInvoiceId, setInvoiceFormInvoiceId] = useState('');
    const [invoiceFormMaterialId, setInvoiceFormMaterialId] = useState([]);
    const [invoiceFormVendorName, setInvoiceFormVendorName] = useState('');
    const [invoiceFormInvoiceDate, setInvoiceFormInvoiceDate] = useState(null);
    const [invoiceFormReceivedDate, setInvoiceFormReceivedDate] = useState(null);
    // const [testDate, setTestDate] = useState(null)
    const [showData, setShowData] = useState(false);
    const [invoicePages, setInvoicePages] = useState(0);

    const handleInputChange = (e, newValue) => {
        setInvoiceFormMaterialId(newValue);
    };

    useEffect(() => {
        getVendorFormData();
    }, []);

    async function getVendorFormData() {
        try {
            const response = await axios.get(`http://${ipAddress}/api/vendorform`);
            setVendorFormData(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const [materialFormData, setMaterialFormData] = useState([]);

    useEffect(() => {
        getMaterialID();
    }, []);

    async function getMaterialID() {
        try {
            const response = await axios.get(`http://${ipAddress}/rawmaterial/data`);
            setMaterialFormData(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleDateChangeInvoiceDate = (date) => {
        if (date) {
            const formatted = date.format('YYYY-MM-DD');
            setInvoiceFormInvoiceDate(formatted);
            // Set received date to null when invoice date changes
            setInvoiceFormReceivedDate(null);
        } else {
            setInvoiceFormInvoiceDate(null);
        }
    };

    const handleDateChangeReceivedDate = (date) => {
        if (date) {
            const formatted = date.format('YYYY-MM-DD');
            setInvoiceFormReceivedDate(formatted);
        } else {
            setInvoiceFormReceivedDate(null);
        }
    };
    console.log(invoiceFormInvoiceDate)
    const invoicePostData = {
        invoiceFormInvoiceId,
        invoiceFormInvoiceDate,
        invoiceFormReceivedDate,
        invoiceFormVendorName,
    };

    const handleNextButtonClick = () => {
        if (
            !invoiceFormInvoiceId ||
            !invoiceFormVendorName ||
            !invoiceFormInvoiceDate ||
            !invoiceFormReceivedDate ||
            !invoiceFormMaterialId.length
        ) {
            dispatch({ type: 'SUBMIT_ERROR', payload: 'Please fill in all required fields.' });
            return;
        }

        setInvoicePages(1);
    };
    // console.log(testDate)

    return (
        <div className='raw-material-form-div'>
            {invoicePages === 1 ? (
                <NextCompleteForm setCompleteStockPages={setCompleteStockPages} setInvoicePages={setInvoicePages} invoicePostData={invoicePostData} invoiceFormMaterialId={invoiceFormMaterialId} setShowData={setShowData} ipAddress={ipAddress} />
            ) : (
                <div>
                    <form action="">
                        <span style={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <TextField
                                required
                                label="Invoice Number"
                                id="materialId"
                                onChange={(e) => setInvoiceFormInvoiceId(e.target.value)}
                                sx={{
                                    '& > :not(style)': { m: 1, width: 350 },
                                }}
                            />
                            <Autocomplete
                                disablePortal
                                id="combo-box-demo-vendor"
                                options={vendorFormData.map((item) => item.supplier)}
                                value={invoiceFormVendorName}
                                onChange={(event, newValue) => { setInvoiceFormVendorName(newValue) }}
                                sx={{
                                    '& > :not(style)': { m: 1, width: 350 },
                                }}
                                renderInput={(params) => <TextField {...params} label="Select Vendor Name" placeholder='Select Vendor Name' />}
                            />
                        </span>
                        <span>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Invoice Date"
                                    value={invoiceFormInvoiceDate}
                                    onChange={handleDateChangeInvoiceDate}
                                    format="DD-MM-YYYY" // Set the format here
                                    disableFuture
                                    // maxDate={new Date()}
                                    // maxDate={dayjs()}
                                    sx={{
                                        '& > :not(style)': { m: 1, width: 345 },
                                    }}
                                />
                            </LocalizationProvider>
                            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Test Date"
                                    value={testDate}
                                    onChange={(date) => setTestDate(date)}
                                    format="DD-MM-YYYY"
                                    sx={{
                                        '& > :not(style)': { m: 1, width: 345 },
                                    }}
                                />
                            </LocalizationProvider> */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Received Date"
                                    value={invoiceFormReceivedDate}
                                    onChange={handleDateChangeReceivedDate}
                                    format="DD-MM-YYYY" // Set the format here
                                    disableFuture
                                    sx={{
                                        '& > :not(style)': { m: 1, width: 350 },
                                    }}
                                />
                            </LocalizationProvider>
                        </span>

                        <div>
                            <Autocomplete
                                disablePortal
                                multiple
                                filterSelectedOptions
                                id="combo-box-demo"
                                options={materialFormData.map((option) => option.material_name)}
                                onChange={handleInputChange}
                                sx={{ width: 720 }}
                                renderInput={(params) => <TextField {...params} label="Material Name" />}
                            />
                        </div>
                        <div className='error' style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {state.isSubmitted ? (
                                <div>Form submitted successfully!</div>
                            ) : (
                                <div>{state.error || ''}</div>
                            )}
                        </div>
                        <Button variant="contained" style={{
                            width: '30%',
                            margin: '20px'
                        }} onClick={handleNextButtonClick}>Next</Button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default InvoiceForm;
