import React, { useState, useEffect, useReducer } from 'react';
import Button from '@mui/material/Button';
import axios from 'axios';
import CompleteEachStock from './CompleteEachStock';

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



function NextCompleteForm(props) {
    const { setInvoicePages, invoicePostData, invoiceFormMaterialId, setCompleteStockPages, ipAddress } = props;
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [loading, setLoading] = useState(false);
    const [matState, setMatState] = useState([]);



    const [stockData, setStockData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`http://${ipAddress}/getcompletestockdata`);
                setStockData(response.data.data);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        fetchData();
    }, []);


    const latestStockIds = {};
    stockData.forEach((stockItem) => {
        const stockMaterialId = stockItem.stock_material_id;
        latestStockIds[stockMaterialId] = Math.max(latestStockIds[stockMaterialId] || 0, stockItem.stock_id);
    });

    // Retrieve the complete object for each unique stock_id
    const uniqueStockObjects = stockData
        .filter((stockItem) => stockItem.stock_id === latestStockIds[stockItem.stock_material_id]);

    // Calculate the sum of closing balances for each material_name
    const closingBalanceSumByMaterial = {};
    uniqueStockObjects.forEach((stockItem) => {
        const materialName = stockItem.material_name;
        closingBalanceSumByMaterial[materialName] = (closingBalanceSumByMaterial[materialName] || 0) + stockItem.closing_balance;
    });

    console.log(`${JSON.stringify(closingBalanceSumByMaterial)}`);


    useEffect(() => {
        const fetchOpeningStock = async () => {
            try {
                const response = await axios.get(`http://${ipAddress}/openingStock`);
                const latestOpeningStockData = response.data.data;
                // console.log(`response ${JSON.stringify(response.data.data)}`)
                // Create a map to store the latest opening stock for each material
                const latestOpeningStockMap = {};

                // Iterate over the data to find the latest opening stock for each material
                latestOpeningStockData.forEach((stockItem) => {
                    const { material_name, opening_stock, closing_balance } = stockItem;

                    if (!latestOpeningStockMap[material_name] || latestOpeningStockMap[material_name].stock_id < stockItem.stock_id) {
                        latestOpeningStockMap[material_name] = {
                            opening_stock,
                            stock_id: stockItem.stock_id,
                            closing_balance,
                        };
                    }
                });

                // Use the map to set the opening stock in the state
                const newMatState = invoiceFormMaterialId.map((item) => {
                    const latestOpeningStockItem = latestOpeningStockMap[item] || { opening_stock: 0 };
                    const latestOpeningStock = latestOpeningStockItem.opening_stock;
                    const latestClosingBalance = latestOpeningStockItem.closing_balance;

                    return {
                        materialName: item,
                        openingStock: latestOpeningStock,
                        closing_balance: latestClosingBalance,
                        receivedQty: 0,
                        totalQty: 0,
                    };
                });

                // console.log('newMatState:', newMatState);

                setMatState(newMatState);
            } catch (error) {
                console.error('Error fetching openingStock:', error);
            }
        };

        fetchOpeningStock();
    }, [invoiceFormMaterialId]);


    const handleInvoiceForm = async (e) => {
        e.preventDefault();
        dispatch({ type: 'SUBMIT_FORM' });
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];

        const invoiceData = { matState, invoicePostData, formattedDate };

        try {

            const response = await axios.post(`http://${ipAddress}/invoiceStockForm`, invoiceData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // console.log(response);

            // Access response data
            dispatch({ type: 'SUBMIT_SUCCESS' });

            setTimeout(() => {
                setCompleteStockPages(0);
                window.location.reload();
            }, 1000);
        } catch (error) {
            dispatch({ type: 'SUBMIT_ERROR', payload: 'Submission failed.' });
            console.error('Error:', error);
        }
    };

    // console.log(matState)
    // console.log(`invoicePos  tData ${JSON.stringify(invoicePostData)}`)
    console.log(`matState cons: ${JSON.stringify(matState)}`)
    return (
        <div>
            <div>
                {matState.length ? (
                    matState.map((item, index) => (
                        <CompleteEachStock key={index}
                            item={item}
                            index={index}
                            matState={matState}
                            setMatState={setMatState}
                            closingBalance={closingBalanceSumByMaterial[item.materialName] || 0}
                        />
                    ))
                ) : (
                    <div>No data to load</div>
                )}
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '50px' }}>
                <Button variant="contained" style={{ width: '20%' }} onClick={() => setCompleteStockPages(0)}>
                    Cancel
                </Button>
                <Button variant="contained" type="submit" onClick={handleInvoiceForm}>
                    Submit
                </Button>
            </div>
            <div className="error" style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                {state.isSubmitted ? <div>Form submitted successfully!</div> : <div>{state.error || ''}</div>}
            </div>
        </div>
    );
}

export default NextCompleteForm;
