import React, { useEffect, useState } from 'react';
import './App.css'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { NavLink } from 'react-router-dom';
import logo from './assets/logo.png';
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import QrCodeOutlinedIcon from "@mui/icons-material/QrCodeOutlined";

function Sidebar(props) {

    const { setRequestPage, setVendorPage, setProjectPages, setProcurementPage, setPages, ipAddress } = props;

    const [bomAlertCount, setBomAlertCount] = useState(0);

    useEffect(() => {
        fetch(`http://${ipAddress}/bom-unread-alerts`)
            .then(res => res.json())
            .then(data => setBomAlertCount(data.count || 0))
            .catch(err => console.log("BOM Alert Error:", err));
    }, [ipAddress]);

    return (
        <div className='sidebar'>

            <div className='logo'>
                <img src={logo} alt="Logo" height={68} width={125} />
            </div>

            <NavLink to='/' className='sidebar-navlink' onClick={() => setProcurementPage(0)}>
                <div className='sidebar-item'>
                    <LocalMallOutlinedIcon /> Procurement
                </div>
            </NavLink>

            <NavLink to='/project' className='sidebar-navlink' onClick={() => setProjectPages(0)}>
                <div className='sidebar-item'>
                    <AccountTreeOutlinedIcon /> Project
                </div>
            </NavLink>

            <NavLink to='/stock' className='sidebar-navlink' onClick={() => setPages(0)}>
                <div className='sidebar-item'>
                    <LocalGroceryStoreOutlinedIcon /> Stock
                </div>
            </NavLink>

            <NavLink to='/vendor' className='sidebar-navlink' onClick={() => setVendorPage(0)}>
                <div className='sidebar-item'>
                    <PersonOutlineOutlinedIcon /> Vendor
                </div>
            </NavLink>
            <NavLink to="/customer" className="sidebar-navlink">
                <div className="sidebar-item">
                    <GroupsOutlinedIcon /> Customer
                </div>
            </NavLink>
            <NavLink to="/serial-numbers" className="sidebar-navlink">
                <div className="sidebar-item">
                    <QrCodeOutlinedIcon /> Serial Numbers
                </div>
            </NavLink>
            <NavLink to="/dispatch/register" className="sidebar-navlink">
                <div className="sidebar-item">
                    Dispatch Register
                </div>
            </NavLink>

            <NavLink to='/request' className='sidebar-navlink' onClick={() => setRequestPage(0)}>
                <div className='sidebar-item'>
                    <NoteAltOutlinedIcon /> Request
                </div>
            </NavLink>
            <NavLink to="/work-order" className="sidebar-navlink">
                <div className="sidebar-item"> <AssignmentOutlinedIcon /> Work Order</div>
            </NavLink>
            <NavLink to="/finance" className="sidebar-navlink">
                <div className="sidebar-item"><AccountBalanceOutlinedIcon />Finance</div>
            </NavLink>
            <NavLink to="/hr" className="sidebar-navlink">
                <div className="sidebar-item"> <PeopleOutlineIcon /> Hr</div>
            </NavLink>
            {/* <NavLink to="/finance" className="sidebar-navlink">
                <div className="sidebar-item">Finance</div>
            </NavLink> */}

            <NavLink to="/qc" className="sidebar-navlink">
                <div className="sidebar-item">QC</div>
            </NavLink>


            <NavLink to="/bom" className="sidebar-navlink">
                <div className="sidebar-item">
                    BOM
                    {bomAlertCount > 0 && (
                        <span className="alert-badge">{bomAlertCount}</span>
                    )}
                </div>
            </NavLink>


            <NavLink to='/logout' className='sidebar-navlink'>
                <div className='sidebar-item'>
                    <LogoutOutlinedIcon /> Logout
                </div>
            </NavLink>
            <NavLink to="/apply-leave" className="sidebar-navlink">
                <div className="sidebar-item">Leave</div>
            </NavLink>

            <NavLink to="/admin-leave" className="sidebar-navlink">
                <div className="sidebar-item">Leave Admin</div>
            </NavLink>
            {/* <NavLink to="/order-register">Order Register</NavLink> */}

        </div>
    );
}

export default Sidebar;
