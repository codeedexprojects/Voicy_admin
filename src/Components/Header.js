import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaSignOutAlt, FaSignInAlt, FaBars } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Button, Dropdown } from 'react-bootstrap';
import './Header.css';

function Header({ toggleSidebar }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <Navbar expand="lg" className="header-navbar">
      <Container fluid className="d-flex align-items-center">
        {/* Sidebar Toggle Icon */}
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>

        {/* Brand / Logo */}
        <Navbar.Brand onClick={() => handleNavigation('/')} className="brand-container">
          <span className="soulmate-text">Soulmate</span>
        </Navbar.Brand>

        <div className="ml-auto d-flex align-items-center">
          {isLoggedIn ? (
            <Dropdown>
              <Dropdown.Toggle variant="link" id="dropdown-user" className="p-0 user-dropdown">
                <FaUserCircle className="user-icon" />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Button variant="outline-primary" onClick={() => navigate('/login')}>
              <FaSignInAlt /> Login
            </Button>
          )}
        </div>
      </Container>
    </Navbar>
  );
}

export default Header;
