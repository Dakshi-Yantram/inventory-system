import React, { useState, useRef } from 'react';
import './logout.css';
import logo from '../../assets/logo.png';
import medicalCross from '../../assets/medical-cross.jpg';

function Logout() {
  const [username, setUsername] = useState("");   // <-- email nahi, username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,   // backend ko username chahiye
          password
        })
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (data.status === "success") {
        alert("Login Successful!");

        if (data.role === "admin") {
          window.location.href = "/";
        } else {
          window.location.href = "/";
        }
      } else {
        alert("Invalid Credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Server Error");
    }
  };


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

            {/* USERNAME */}
            <div>
              <label>Username*</label>
              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label>Password*</label>
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  ref={passwordRef}
                />

                <button
                  type="button"
                  className="btn-show-password"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    passwordRef.current.type = !showPassword ? "text" : "password";
                  }}
                >
                  {showPassword ? "Hide Password" : "Show Password"}
                </button>
              </div>
            </div>

          </div>

          {/* LOGIN BUTTON */}
          <div className="login-btn">
            <input type="button" value="Login" onClick={handleLogin} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default Logout;
