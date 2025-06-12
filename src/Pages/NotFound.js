import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2>Oops! Page Not Found</h2>
        <p>
          The page you're looking for doesn't exist or has been moved. 
        </p>
        <Link to="/" className="back-home-btn">
          Back to Home
        </Link>
      </div>
      <div className="not-found-animation">
        <div className="floating-box"></div>
      </div>
    </div>
  );
}

export default NotFound;
