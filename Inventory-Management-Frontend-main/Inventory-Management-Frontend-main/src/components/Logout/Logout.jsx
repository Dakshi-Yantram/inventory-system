import React, { useState, useRef } from 'react'
import './logout.css'
import logo from '../../assets/logo.png'
import medicalCross from '../../assets/medical-cross.jpg'
import TextField from '@mui/material/TextField';



function Logout() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);




  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);

    // Regular expression for validating email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    // Check if the email is a valid email address
    if (!emailRegex.test(newEmail)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  }

  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setPassword(newPassword);

    // Check if the password is less than 4 characters
    if (newPassword.length < 4) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  }


  return (
    <div className='logout-container'>
      <div className="login-form">
        <div className="login-nav-img">
          <img src={logo} alt="Logo" height={80} width={140} />
          <img src={medicalCross} alt="Logo" height={110} width={110} />
        </div>
        <div className="account-form">
          <div className='head'>
            <p>Login to your account</p>
          </div>
          <div className='credentials'>
            <div>
              <label htmlFor="Email">Email*</label>
              <input
                type="email"
                name="email"
                id='email'
                placeholder='Enter Email'
                value={email}
                onChange={handleEmailChange}
                style={{
                  borderColor: emailError ? 'white' : '',
                  boxShadow: emailError ? '0 0 4px #FC2323' : '',
                }}
              />
            </div>
            <div>
              <label htmlFor="Password">Password *</label>
              <div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  placeholder='Enter Password'
                  value={password}
                  onChange={handlePasswordChange}
                  ref={passwordRef}
                  style={{
                    borderColor: passwordError ? 'white' : '',
                    boxShadow: passwordError ? '0 0 4px #FC2323' : ''
                  }}
                />
                <button className='btn-show-password' onClick={() => {
                  setShowPassword(!showPassword);
                  if (!showPassword) {
                    passwordRef.current.type = 'text';
                  } else {
                    passwordRef.current.type = 'password';
                  }
                }}>
                  {showPassword ? 'Hide Password' : 'Show Password'}
                </button>
              </div>
            </div>
          </div>
          <div className='login-btn'>
            <input type="submit" name="login" id="login" value='Login' />
          </div>


        </div>

      </div>
    </div>
  )
}

export default Logout

