import React from 'react'
import './Procurement.css'
import Button from '@mui/material/Button';


function ProcurementAdd(props) {
  const { setProcurementPage } = props
  return (
    <div className='procurement-Add-container'>
      <div className='procurement-head-add'>
        <h1>Procrument ADD</h1>
        <Button variant="contained" onClick={() => setProcurementPage(0)}>Back</Button>
      </div>
    </div>
  )
}

export default ProcurementAdd
