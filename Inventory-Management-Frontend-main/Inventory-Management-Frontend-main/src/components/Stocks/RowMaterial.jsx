import React, { useEffect, useState } from 'react'
import RawDataTable from './RawDataTable';

function RowMaterial(props) {


  
  const { setPages,ipAddress} = props
  return (
    <div className='raw-material-container'> 
      <RawDataTable ipAddress={ipAddress}/>
    </div>
  )
}

export default RowMaterial
