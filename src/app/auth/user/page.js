'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function UserLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        setRedirect(true);
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
      flexDirection: isMobile ? 'column' : 'row-reverse',
      backgroundColor: isMobile ? '#046307' : 'transparent',
      position: 'relative'
    },
    leftPanel: {
      width: isMobile ? '0%' : '50%',
      height: '100%',
      backgroundColor: '#046307',
      display: isMobile ? 'none' : 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    },
    rightPanel: {
      width: isMobile ? '100%' : '50%',
      height: isMobile ? '100%' : '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isMobile ? 'transparent' : '#f5f5f5',
      position: 'relative'
    },
    formContainer: {
      width: isMobile ? '90%' : '70%',
      maxWidth: '450px',
      padding: isMobile ? '30px' : '40px',
      borderRadius: '1rem',
      backgroundColor: 'white',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      margin: isMobile ? '0 auto' : '0',
      transform: isMobile ? 'translateY(0)' : 'none'
    },
    // Keep all your other style objects exactly the same
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
      borderRadius: '1rem',
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
      borderRadius: '1rem',
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
    },
    backgroundCircle1: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      top: '10%',
      left: '10%',
      display: isMobile ? 'none' : 'block'
    },
    backgroundCircle2: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      bottom: '10%',
      right: '5%',
      display: isMobile ? 'none' : 'block'
    },
    backgroundCircle3: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      top: '5%',
      left: '20%'
    },
    backgroundCircle4: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      bottom: '-15%',
      left: '-15%'
    },
  };

  return (
    <div style={styles.mainContainer}>
      {/* Right Panel - Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.backgroundCircle3}></div>
        <div style={styles.backgroundCircle4}></div>
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

      {/* Left Panel - Branding (hidden on mobile) */}
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