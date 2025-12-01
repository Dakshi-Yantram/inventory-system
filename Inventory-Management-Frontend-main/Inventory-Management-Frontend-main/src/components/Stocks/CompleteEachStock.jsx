// CompleteEachStock.js
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import axios from 'axios';

function CompleteEachStock(props) {
    const { item, index, matState, setMatState, closingBalance } = props;
    // console.log(`closing balance ${closingBalance}`)
    const [receivedQuantity, setReceivedQuantity] = useState('');
    const [totalQuantity, setTotalQuantity] = useState(0);

    useEffect(() => {
        const num = Number(closingBalance || 0) + Number(receivedQuantity);
        setTotalQuantity(num);
    }, [receivedQuantity, item.closing_balance]);

    useEffect(() => {
        const newState = [...matState];
        newState[index] = {
            ...newState[index],
            receivedQty: receivedQuantity,
            totalQty: totalQuantity,
        };
        setMatState(newState);
    }, [receivedQuantity, totalQuantity]);

    // console.log(`item ${JSON.stringify(item)}`)

    return (
        <div>
            <div className="CompleteEachStock">
                <TextField
                    disabled
                    value={item.materialName}
                    id="outlined-disabled"
                    label="Material Name"
                    sx={{ '& > :not(style)': { m: 1, width: 200 } }}
                />
                <TextField
                    disabled

                    // value={item.closing_balance || 0}
                    value={closingBalance}
                    id="outlined-disabled"
                    label="closing Balance"
                    sx={{ '& > :not(style)': { m: 1, width: 200 } }}
                />
                <TextField
                    required
                    label="Received Quantity"
                    id="materialId"
                    value={receivedQuantity}
                    onChange={(e) => setReceivedQuantity(e.target.value)}
                    sx={{ '& > :not(style)': { m: 1, width: 200 } }}
                />
                <TextField
                    disabled
                    value={isNaN(totalQuantity) ? '0' : totalQuantity}  // Check if totalQuantity is NaN

                    id="outlined-disabled"
                    label="Total quantity"
                    sx={{ '& > :not(style)': { m: 1, width: 200 } }}
                />
            </div>
        </div>
    );
}

export default CompleteEachStock;
