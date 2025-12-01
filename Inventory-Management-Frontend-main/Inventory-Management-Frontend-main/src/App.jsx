import React, { useState } from 'react'
import './App.css'
import Button from '@mui/material/Button';
import { NavLink, Route, Routes } from 'react-router-dom';
import Project from './components/Projects/Project';
import Stock from './components/Stocks/Stock';
import Vendor from './components/Vendor/Vendor';
import Request from './components/Request/Request';
import Logout from './components/Logout/Logout';
import Sidebar from './Sidebar';
import ComplteStock from './components/Stocks/ComplteStock';
import RowMaterial from './components/Stocks/RowMaterial';
import Semifinish from './components/Stocks/Semifinish';
import FinishedGoods from './components/Stocks/FinishedGoods';
import StationaryGoods from './components/Stocks/StationaryGoods';
import VendorForm from './components/Vendor/VendorForm';
import ProcurementNew from './components/procurement/ProcurementNew';
import RequestForm from './components/Request/RequestForm';
import RequestDetails from './components/Request/RequestDetails';
import AdminDashboard from "./components/Admin/AdminDashboard";


function App() {
  const [rout, setRout] = useState()
  const [projectPages, setProjectPages] = useState(0)
  const [procurementPage, setProcurementPage] = useState(0);
  const [requestPage, setRequestPage] = useState(0);
  const [vendorPage, setVendorPage] = useState(0);
 const [ipAddress, setIpAddress] = useState('192.168.1.8:3000');


  const mainDiv = {
    display: 'flex',
    flexDirection: 'row'
  }
  const sidebar = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100vh',
    width: '22vw'
  }

  return (
    <div style={mainDiv}>
      <div className='app-sidebar'>
        <Sidebar setRequestPage={setRequestPage} setVendorPage={setVendorPage} setProjectPages={setProjectPages} setProcurementPage={setProcurementPage} />
      </div>
      <div>
        <Routes>
          <Route path='/' element={<ProcurementNew setProcurementPage={setProcurementPage} procurementPage={procurementPage} ipAddress={ipAddress} />}></Route>
          <Route path='/project' element={<Project projectPages={projectPages} setProjectPages={setProjectPages} ipAddress={ipAddress} />}></Route>
          <Route path='/stock' element={<Stock ipAddress={ipAddress} />}></Route>
          <Route path='/stock/completeStock' element={<ComplteStock ipAddress={ipAddress} />}></Route>
          <Route path='/stock/rawMaterial' element={<RowMaterial ipAddress={ipAddress} />}></Route>
          <Route path='/stock/semiGoods' element={<Semifinish ipAddress={ipAddress} />}></Route>
          <Route path='/stock/finishedGoods' element={<FinishedGoods ipAddress={ipAddress} />}></Route>
          <Route path='/stock/stationaryGoods' element={<StationaryGoods ipAddress={ipAddress} />}></Route>
          <Route path='/vendor/*' element={<Vendor setVendorPage={setVendorPage} vendorPage={vendorPage} ipAddress={ipAddress} />}></Route>
          <Route path='/request/*' element={<Request setRequestPage={setRequestPage} requestPage={requestPage} ipAddress={ipAddress} />}></Route>
          <Route path='/request/Requestdetails' element={<RequestDetails ipAddress={ipAddress} />}></Route>
          <Route path='/logout' element={<Logout ipAddress={ipAddress} />}></Route>
          <Route path="/admin-dashboard" element={<AdminDashboard ipAddress={ipAddress} />} />

        </Routes>
      </div>
    </div>
  )
}
export default App
