import React, { useState, useEffect , useReducer} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import './request.css'


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


function RequestApprove(props) {
    const { setRequestPage, approveRow, setApproveRow ,ipAddress } = props;
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [loading, setLoading] = useState(false)
    const [stockData, setStockData] = useState([]);
    const [selectedStockMaterialId, setSelectedStockMaterialId] = useState('');
    const [instockQty, setInstockQty] = useState('');
    const [closingBalance, setClosingBalance] = useState('');
    // const [enterQtyToApprove, setEnterQtyToApprove] = useState('');
    const [remainingQty, setRemainingQty] = useState([])
    const [materialData, setMaterialData] = useState(approveRow.TemplateData)


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`http://${ipAddress}/getcompletestockdata`);

                // Create a dictionary to store the latest stock_id for each stock_material_id
                const latestStockIds = {};

                // Iterate through the newData array
                response.data.data.forEach(item => {
                    const stockMaterialId = item.stock_material_id;

                    // Check if the stock_material_id is already in the dictionary
                    if (latestStockIds.hasOwnProperty(stockMaterialId)) {
                        // Check if the current item has a higher stock_id
                        if (item.stock_id > latestStockIds[stockMaterialId]) {
                            latestStockIds[stockMaterialId] = item.stock_id;
                        }
                    } else {
                        // If the stock_material_id is not in the dictionary, add it with the current stock_id
                        latestStockIds[stockMaterialId] = item.stock_id;
                    }
                });

                // Filter the newData array to include only the items with the latest stock_id for each stock_material_id
                const result = response.data.data.filter(item => item.stock_id === latestStockIds[item.stock_material_id]);


                setStockData(result);

            } catch (error) {
                console.error('Error:', error);
            }
        }

        fetchData();
    }, []);

    

    useEffect(() => {
        if (selectedStockMaterialId) {
            async function fetchInstockQtyAndClosingBalance() {
                try {
                    const selectedStockItem = stockData.find(
                        (stockItem) => stockItem.stock_material_id === selectedStockMaterialId
                    );

                    if (selectedStockItem) {
                        const updatedTemplateData = approveRow.TemplateData.map((templateItem) => {
                            if (templateItem.material_name === selectedStockItem.material_name) {
                                return {
                                    ...templateItem,
                                    instockQty: selectedStockItem.closing_balance,
                                };
                            }
                            return templateItem;
                        });

                        setApproveRow({
                            ...approveRow,
                            TemplateData: updatedTemplateData,
                        });

                        setInstockQty(selectedStockItem.closing_balance);
                        setClosingBalance(selectedStockItem.closing_balance);
                    }
                } catch (error) {
                    console.error('Error fetching Instock Qty and Closing Balance:', error);
                }
            }

            fetchInstockQtyAndClosingBalance();
        }
    }, [selectedStockMaterialId, stockData, approveRow, setApproveRow]);

    // Function to handle approved quantity change
    const handleEnterQtyChange = (e, item) => {
        const approvedQty = e.target.value;
        // const newRemainingQty = item.issued_qty - approvedQty;

        const updatedTemplateData = stockData.map((templateItem) => {
            if (templateItem.stock_id == item.stock_id) {
                return {
                    ...templateItem,
                    enterQtyToApprove: approvedQty,

                };
            }
            return templateItem;
        });
        // console.log(`updateTempalte :${JSON.stringify(updatedTemplateData)}`)    
        setStockData(updatedTemplateData);

    };

    useEffect(() => {
        const dataRem = materialData.map((newItem) => {
            let remQty = newItem.issued_qty

            stockData.map((data) => {
                if (newItem.material_name == data.material_name) {

                    remQty -= data.enterQtyToApprove ? Number(data.enterQtyToApprove) : 0
                }
            })
            // console.log(`remqty :${JSON.stringify(remQty)}`)
            return { ...newItem, remQty, error: remQty < 0 }
        })
        setMaterialData(dataRem);
        // console.log(`data rem: ${JSON.stringify(dataRem)}`)
    }, [stockData])




    useEffect(() => {
        // console.log(`newapproverow ${JSON.stringify(approveRow.TemplateData)}`)
    }, [approveRow])


    const handleSubmitApproveRequest = async (e) => {
        e.preventDefault();
        dispatch({ type: 'SUBMIT_FORM' });

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];

        const invoiceData = { materialData, stockData, formattedDate };
        setLoading(true)
        try {
            const response = await axios.post(`http://${ipAddress}/approveRequestStockChange`, invoiceData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    console.log(response); // Access response dat
                    setLoading(false)
                    dispatch({ type: 'SUBMIT_SUCCESS' });

                    setTimeout(() => {
                        setRequestPage(0)
                    }, 1000);

                }).catch((error) => {
                    setLoading(false)
                    dispatch({ type: 'SUBMIT_ERROR', payload: 'Submission failed.' });
                    console.log("Error:", error);
                });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    console.log(`stock data : ${JSON.stringify(stockData)}`)
    // console.log(`material DData : ${JSON.stringify(materialData )}`)
    const isSubmitDisabled = materialData.some((item) => item.remQty > 0);
    // console.log(`approve Row :${JSON.stringify(approveRow)}`)

    return (
        <div>
            <div className='Request-add-div'>
                <h1>Request Approve</h1>
                <Button variant='contained' className='add-vendor' onClick={() => setRequestPage(4)}>
                    Back
                </Button>
            </div>
            <div className='approve-details'>
                <form action=''>
                    {materialData.map((item) => {
                        return (
                            <div key={item.material_name} className='approve-main-container'>
                                <div className='approve-material-details'>
                                    <span>
                                        <h3>Material Name:</h3>
                                        <h3>{item.material_name}</h3>

                                    </span>
                                    <span>
                                        <h3>Issue Quanity:</h3>
                                        <h3>{item.issued_qty}</h3>
                                    </span>
                                    <span>
                                        <h3>Remaining qty:</h3>
                                        <h3>{item.remQty}</h3>
                                    </span>
                                </div>
                                <div>
                                    <h2>Stock Material IDs:</h2>
                                    {/* <p>{JSON.stringify(matchingStockData)}</p> */}
                                    {stockData?.filter(
                                        (stockItem) => stockItem.material_name === item.material_name
                                    ).map((i) => (
                                        <div key={i.stock_id} className='div-stock-mat-id'>
                                            <p>{i.stock_material_id}</p>
                                            <TextField
                                                disabled
                                                label={`Instock qty`}
                                                value={i.closing_balance}
                                            />
                                            <TextField
                                                label={`Approve Qty`}
                                                type="number"
                                                value={i?.enterQtyToApprove}
                                                defaultValue=''
                                                onChange={(e) => handleEnterQtyChange(e, i)}
                                                sx={{
                                                    '& > :not(style)': { m: 1, width: 200 },
                                                }}
                                                error={item.error || i.enterQtyToApprove > i.closing_balance}
                                                // Display error if remaining qty is less than 0 or approve qty > instock qty // Display error if remaining qty is less than 0
                                                helperText={
                                                    item.error
                                                        ? 'Approve qty cannot be more than issue qty'
                                                        : i.enterQtyToApprove > i.closing_balance
                                                            ? 'Approve qty cannot be more than instock qty'
                                                            : ''
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>

                            </div>
                        );
                    })}
                    <div className='error'>
                        {state.isSubmitted ? (
                            <div>Form submitted successfully!</div>
                        ) : (
                            <div>{state.error || ''}</div>
                        )}
                    </div>
                    <Button variant='contained' className='add-vendor' onClick={handleSubmitApproveRequest} disabled={isSubmitDisabled}>
                        Submit
                    </Button>
                </form>
            </div>
        </div>
    );
}
export default RequestApprove; 