import React, { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';



const top100Films = [
    { label: 'The Shawshank Redemption', year: 1994 },
    { label: 'The Godfather', year: 1972 },
    { label: 'The Godfather: Part II', year: 1974 },
    { label: 'The Dark Knight', year: 2008 },
    { label: '12 Angry Men', year: 1957 },
    { label: "Schindler's List", year: 1993 },
    { label: 'Pulp Fiction', year: 1994 },

];


function AddMore() {
    const [requestMaterialName, setRequestMaterialName] = useState()

    const [requestQty, seRequestQty] = useState(0)
    return (
        <div>
            <span>
                <Autocomplete
                    disablePortal
                    filterSelectedOptions
                    id="combo-box-demo"
                    options={top100Films}
                    // options={materialFormData.map((option) => option.material_name)}
                    onChange={(e, newValue) => setRequestMaterialName(newValue)}
                    sx={{ width: 250 }}
                    renderInput={(params) => <TextField {...params} label="Material Name" />}
                />
                <TextField
                    required
                    label="Quantity"
                    id="Quantity"
                    value={requestQty}
                    onChange={(e) => seRequestQty(e.target.value)}
                    sx={{
                        '& > :not(style)': { m: 1, width: 250 },
                    }} />

            </span>
        </div>
    )
}

export default AddMore
