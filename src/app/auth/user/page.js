'use client'

import React, { useState } from 'react';

function UserLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (redirect) {
      router.push('/user');
    }
  }, [redirect, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (identifier && password) {
        setRedirect(true); // Triggers redirect on client side
      } else {
        setError('Please enter both identifier and password');
      }
      setIsLoading(false);
    }, 800);
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
    if (window.innerWidth <= 768) {
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
          <h2 style={styles.formTitle}>User Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="identifier">Username / Email / Phone</label>
              <input
                style={styles.formInput}
                type="text"
                id="identifier"
                placeholder="Enter your username, email, or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="password">Password</label>
              <input
                style={styles.formInput}
                type="password"
                id="password"
                placeholder="Enter your password"
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
          <h1 style={styles.brandTitle}>Welcome Back</h1>
          <p style={styles.brandSubtitle}>
            Sign in to access your account and continue your journey with us.
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserLoginPage;