import React from 'react'
import './App.css'
import Button from '@mui/material/Button';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { NavLink, Route, Routes } from 'react-router-dom';
import logo from './assets/logo.png'
import rajuRangojiLogo from './assets/rajuRangojiLogo.png'
// import logo from '../../assets/logo.png'
import Project from './components/Projects/Project';
import Stock from './components/Stocks/Stock';
import Vendor from './components/Vendor/Vendor';
import Request from './components/Request/Request';
import Logout from './components/Logout/Logout';
function Sidebar(props) {
    const { setRequestPage, setVendorPage, setProjectPages, setProcurementPage, setPages } = props
    return (
        <div className='sidebar'>
            <div className='logo'>
                <img src={logo} alt="Logo" height={68} width={125} />
            </div>
            <NavLink to='/' className='sidebar-navlink' onClick={() => setProcurementPage(0)}>
                <div className='sidebar-item'>
                    <LocalMallOutlinedIcon />Procurement
                </div>
            </NavLink>
            <NavLink to='/Project' className='sidebar-navlink' onClick={() => setProjectPages(0)}>
                <div className='sidebar-item'>
                    <AccountTreeOutlinedIcon />Project
                </div>
            </NavLink>
            <NavLink to='/Stock' className='sidebar-navlink' onClick={() => setPages(0)}>
                <div className='sidebar-item'>
                    <LocalGroceryStoreOutlinedIcon />Stock
                </div>
            </NavLink>
            <NavLink to='/Vendor' className='sidebar-navlink' onClick={() => setVendorPage(0)}>
                <div className='sidebar-item'>
                    <PersonOutlineOutlinedIcon />Vendor
                </div>
            </NavLink>
            <NavLink to='/Request' className='sidebar-navlink' onClick={() => setRequestPage(0)}>
                <div className='sidebar-item'>
                    <NoteAltOutlinedIcon />Request
                </div>
            </NavLink>
            <NavLink to='/logout' className='sidebar-navlink'>
                <div className='sidebar-item'>
                    <LogoutOutlinedIcon />Logout
                </div>
            </NavLink>
        </div>
    )
}
export default Sidebar
