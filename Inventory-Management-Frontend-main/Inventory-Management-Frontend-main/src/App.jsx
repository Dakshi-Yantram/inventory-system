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
import ProcurementSummary from './components/procurement/ProcurementSummary';
import BomList from './components/Bom/BomList';
import BomHistory from './components/Bom/BomHistory';
import ApplyLeave from './components/Leave/ApplyLeave';
import AdminLeave from './components/Leave/AdminLeave';
import OrderRegister from './components/procurement/OrderRegister';
import WorkOrder from './components/Workorder/Workorder';
import Finance from './components/Finance/Finance';
import HR from './components/Hr/Hr';
import CustomerPage from './components/Pages/Customerpage';
import SerialList from './components/Serial/SerialList';
import Dispatch_register from './components/Dispatch/Dispatch_register';
import AddEmployee from './components/Hr/Addemployee';
import RelieveEmployee from './components/Hr/Relieveemployee';
import CustomerBilling from './components/Finance/CustomerBilling';
import VendorPayments from './components/Finance/VendorPayments';
import Expenses from './components/Finance/Expenses';
import FinanceSummary from './components/Finance/FinanceSummary';
import RawMaterialQC from './components/QC/RawMaterialQC';
import QC from './components/QC/QC';
import InProcessQC from './components/QC/InProcessQC';
import FinalProductQC from './components/QC/FinalProductQC';
import EmployeeList from './components/Hr/Employeelist';
import CustomerList from './components/Customer/CustomerList';
import CustomerForm from './components/Customer/CustomerForm';
import CustomerBillingAdd from './components/Finance/Customerbillingadd';
import WorkOrderCreate from './components/Workorder/WorkOrderCreate';



function App() {
  const [rout, setRout] = useState()
  const [projectPages, setProjectPages] = useState(0)
  const [procurementPage, setProcurementPage] = useState(0);
  const [requestPage, setRequestPage] = useState(0);
  const [vendorPage, setVendorPage] = useState(0);
  const [ipAddress, setIpAddress] = useState('localhost:3000');



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
        <Sidebar
          setRequestPage={setRequestPage}
          setVendorPage={setVendorPage}
          setProjectPages={setProjectPages}
          setProcurementPage={setProcurementPage}
          ipAddress={ipAddress}
        />

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
          <Route path="/procurement-summary" element={<ProcurementSummary />} />
          <Route path="/bom" element={<BomList ipAddress={ipAddress} />} />
          <Route path="/bom-history" element={<BomHistory ipAddress={ipAddress} />} />
          <Route path="/apply-leave" element={<ApplyLeave ipAddress={ipAddress} />} />
          <Route path="/admin-leave" element={<AdminLeave ipAddress={ipAddress} />} />
          <Route path="/order-register" element={<OrderRegister />} />
          <Route path="/work-order" element={<WorkOrder ipAddress={ipAddress} />} />
          <Route path="/work-order/create" element={<WorkOrderCreate />} />


          <Route path="/finance" element={<Finance />} />
          <Route path="/finance/customer-billing" element={<CustomerBilling />} />
          <Route path="/finance/vendor-payments" element={<VendorPayments />} />
          <Route path="/finance/expenses" element={<Expenses />} />
          <Route path="/finance/summary" element={<FinanceSummary />} />

          <Route path="/qc" element={<QC />} />
          <Route path="/qc/raw" element={<RawMaterialQC />} />
          <Route path="/qc/inprocess" element={<InProcessQC />} />
          <Route path="/qc/final" element={<FinalProductQC />} />

          <Route path="/hr" element={<HR />} />
          <Route path="/hr/employees" element={<EmployeeList />} />
          <Route path="/hr/add-employee" element={<AddEmployee />} />
          <Route path="/hr/relieve" element={<RelieveEmployee />} />

          <Route
            path="/customer"
            element={<CustomerList ipAddress={ipAddress} />}
          />

          <Route
            path="/customer/add"
            element={<CustomerForm ipAddress={ipAddress} />}
          />
          {/* <Route path="/finance/customer-billing" element={<CustomerBilling />} /> */}
          <Route path="/finance/customer-billing/add" element={<CustomerBillingAdd />} />


          <Route
            path="/serial-numbers"
            element={<SerialList ipAddress={ipAddress} />}
          />
          <Route
            path="/dispatch/register"
            element={<Dispatch_register ipAddress={ipAddress} />}
          />
        </Routes>
      </div>
    </div>
  )
}
export default App
