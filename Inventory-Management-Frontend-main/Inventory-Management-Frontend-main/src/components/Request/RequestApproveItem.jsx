import React from 'react'

function RequestApproveItem() {
    return (
        <div>
            <form action="">
                <div className="approve-form">
                    <TextField
                        disabled
                        id="outlined-disabled"
                        label="material id"
                        defaultValue="battery"
                        sx={{
                            '& > :not(style)': { m: 1, width: 200 },
                        }}
                    />
                    <TextField
                        disabled
                        id="outlined-disabled"
                        label="issue qty"
                        defaultValue="150"
                        sx={{
                            '& > :not(style)': { m: 1, width: 100 },
                        }}
                    />
                    <Autocomplete
                        id="free-solo-demo"
                        freeSolo
                        options={category.map((option) => option.title)}
                        sx={{
                            '& > :not(style)': { m: 1, width: 200 },
                        }}
                        renderInput={(params) => <TextField {...params} label="stock material id" />}
                    />
                    <TextField
                        disabled
                        id="outlined-disabled"
                        label="Instock QTY"
                        defaultValue="Hello World"
                        sx={{
                            '& > :not(style)': { m: 1, width: 100 },
                        }}
                    />
                    <TextField
                        label="Enter qty to Approve"
                        id="outlined-disabled"
                        sx={{
                            '& > :not(style)': { m: 1, width: 200 },
                        }}
                    />
                    <TextField
                        disabled
                        label="remaining qty"
                        id="outlined-disabled"
                        defaultValue="66"
                        sx={{
                            '& > :not(style)': { m: 1, width: 100 },
                        }}
                    />
                </div>
            </form>
        </div>
    )
}

export default RequestApproveItem
