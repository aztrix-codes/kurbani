'use client';

import React, { useState } from 'react';
import axios from 'axios';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.get('/api/admin', {
        params: { username, password }
      });

      if (response.status === 200) {
        // Successful login - redirect to admin dashboard
        window.location.href = '/admin';
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        // The server responded with an error status
        if (err.response.status === 401) {
          setError('Invalid username or password');
        } else if (err.response.status === 400) {
          setError('Missing username or password');
        } else {
          setError(`Server error occurred: ${err.response.data?.error || 'Unknown error'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network error - please check your connection and try again');
      } else {
        // Something happened in setting up the request
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    mainContainer: {
      display: 'flex',
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      flexDirection: 'row-reverse'
    },
    leftPanel: {
      width: '50%',
      height: '100%',
      backgroundColor: '#046307',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    },
    rightPanel: {
      width: '50%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    },
    backgroundCircle1: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      top: '10%',
      left: '10%'
    },
    backgroundCircle2: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      bottom: '10%',
      right: '5%'
    },
    leftPanelContent: {
      color: 'white',
      textAlign: 'center',
      maxWidth: '80%',
      zIndex: 1
    },
    brandTitle: {
      fontSize: '42px',
      fontWeight: 'bold',
      marginBottom: '20px'
    },
    brandSubtitle: {
      fontSize: '20px',
      opacity: 0.9,
      lineHeight: 1.6
    },
    formContainer: {
      width: '70%',
      maxWidth: '450px',
      padding: '40px',
      borderRadius: '10px',
      backgroundColor: 'white',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
    },
    formTitle: {
      fontSize: '28px',
      color: '#333',
      marginBottom: '30px',
      textAlign: 'center',
      fontWeight: 'bold'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formLabel: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    formInput: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '16px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    submitButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#046307',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '10px'
    },
    submitButtonHover: {
      backgroundColor: '#034d05'
    },
    errorText: {
      color: '#e74c3c',
      fontSize: '14px',
      marginTop: '10px',
      textAlign: 'center'
    }
  };

  // Media query function for responsive design
  const applyMediaQuery = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return {
        mainContainer: {
          flexDirection: 'column-reverse'
        },
        leftPanel: {
          display: 'none'
        },
        rightPanel: {
          width: '100%',
          height: '100%'
        },
        formContainer: {
          width: '85%',
          padding: '30px'
        }
      };
    }
    return {};
  };

  // Apply responsive styles
  const responsiveStyles = applyMediaQuery();
  Object.keys(responsiveStyles).forEach(key => {
    if (styles[key]) {
      styles[key] = { ...styles[key], ...responsiveStyles[key] };
    }
  });

  const [buttonHovered, setButtonHovered] = useState(false);

  return (
    <div style={styles.mainContainer}>
      {/* Right Panel - Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Admin Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="username">Username</label>
              <input
                style={styles.formInput}
                type="text"
                id="username"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="password">Password</label>
              <input
                style={styles.formInput}
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              style={buttonHovered ? {...styles.submitButton, ...styles.submitButtonHover} : styles.submitButton}
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            
            {error && <p style={styles.errorText}>{error}</p>}
          </form>
        </div>
      </div>

      {/* Left Panel - Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.backgroundCircle1}></div>
        <div style={styles.backgroundCircle2}></div>
        <div style={styles.leftPanelContent}>
          <h1 style={styles.brandTitle}>Admin Portal</h1>
          <p style={styles.brandSubtitle}>
            Access the administrative dashboard to manage users, content, and system settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;