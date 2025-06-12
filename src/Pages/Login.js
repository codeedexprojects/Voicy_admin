import React, { useState } from 'react';
import './Login.css';
import limg from '../Vector.png';
import { adminLogin } from '../services/allApi';
import { useNavigate } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await adminLogin({ email, password });
      console.log(response);
  
      setSuccessMessage("Login successful!");
      setErrorMessage(null);
  
      localStorage.setItem("userId", response.id);
      localStorage.setItem("Bestie_accesstoken", response.access_token);
      localStorage.setItem("Bestie_role", response.role);
      localStorage.setItem("ManagerId", response.user_id);
  
      if (response.role === "superuser") {
        navigate("/");
      } else if (response.role === "manager_executive") {
        navigate("/manage-executive");
      } else if (response.role === "manager_user") {
        navigate("/manage-user");
      }
    } catch (error) {
      setErrorMessage("Invalid email or password");
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <p className="login-brand">Bestie</p>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-input-container">
            <i style={{ fontStyle: 'normal' }} className="login-icon login-icon-user"></i>
            <input
              type="email"
              placeholder="EMAIL"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="login-input-container">
            <i style={{ fontStyle: 'normal' }} className="login-icon login-icon-lock"></i>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="PASSWORD"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i
              style={{ fontStyle: 'normal' }}
              className={`login-icon login-icon-eye ${passwordVisible ? 'visible' : ''}`}
              onClick={togglePasswordVisibility}
            ></i>
          </div>
          {errorMessage && <p className="login-error">{errorMessage}</p>}
          {successMessage && <p className="login-success">{successMessage}</p>}
          <button type="submit" className="login-submit" disabled={loading}>
            LOGIN
          </button>
        </form>
      </div>
      <img src={limg} alt="TopRightImage" className="top-right-image" />
      <div className="bottom-left-rings">
        <div className="ring ring1"></div>
        <div className="ring ring2"></div>
        <div className="ring ring3"></div>
      </div>

      {loading && (
        <div className="spinner-overlay">
          <Spinner animation="border" variant="primary" />
        </div>
      )}
    </div>
  );
}

export default Login;
