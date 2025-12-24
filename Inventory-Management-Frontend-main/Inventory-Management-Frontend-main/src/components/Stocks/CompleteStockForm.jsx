import React from 'react'
import './CompleteStock.css'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import VendorForm from '../Vendor/VendorForm';
import InvoiceForm from './InvoiceForm';


let btnBack = [
    {
        id: 1,
        back: 'Back'
    }
]

function CompleteStockForm(props) {
    const { setCompleteStockPages, ipAddress } = props;
    return (
        <div>
            <div className="complete-stock-add-div">
                <h1>Complete Stock Form</h1>
                {btnBack.map((item) => {
                    return <Button variant="contained" key={item.id} onClick={() => setCompleteStockPages(0)}>{item.back}</Button>
                })}
            </div>
            <InvoiceForm setCompleteStockPages={setCompleteStockPages} ipAddress={ipAddress} />
        </div>
    )
}

export default CompleteStockForm
