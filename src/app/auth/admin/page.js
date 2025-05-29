'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Check if server is locked
  const checkLockStatus = async () => {
    try {
      const response = await fetch('/api/superadmin/lock');
      const data = await response.json();
      
      if (response.ok && data && data.length > 0) {
        return data[0].lockall === 1;
      }
      return false;
    } catch (err) {
      console.error('Lock status check error:', err);
      return false;
    }
  };

  useEffect(() => {
    setIsMounted(true);
    
    // Check mobile view
    if (typeof window !== 'undefined') {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth <= 780);
      };
      
      checkIsMobile();
      
      const handleResize = () => {
        checkIsMobile();
      };

      window.addEventListener('resize', handleResize);
      
      // Cleanup function
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const checkAutoLogin = async () => {
      if (typeof window !== 'undefined') {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        if (isLoggedIn) {
          // Check if server is locked before auto-redirecting
          const isLocked = await checkLockStatus();
          if (isLocked) {
            setError('The server has been frozen by admin. Please try again later.');
            localStorage.setItem('adminLoggedIn', 'false');
            return;
          }
          router.replace('/admin/zones');
        }
      }
    };

    if (isMounted) {
      checkAutoLogin();
    }
  }, [router, isMounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check if server is locked before attempting login
      const isLocked = await checkLockStatus();
      if (isLocked) {
        setError('The server has been frozen by admin. Please try again later.');
        setIsLoading(false);
        return;
      }

      const response = await axios.get('/api/admin', {
        params: { username, password }
      });

      if (response.status === 200) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminLoggedIn', 'true');
        }
        router.push('/admin/zones');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminLoggedIn', 'false');
      }
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid username or password');
        } else if (err.response.status === 400) {
          setError('Missing username or password');
        } else {
          setError(`Server error occurred: ${err.response.data?.error || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError('Network error - please check your connection and try again');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };



  const [buttonHovered, setButtonHovered] = useState(false);

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

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
      backgroundColor: isMobile ? 'transparent' : '#f8fafc',
      position: 'relative'
    },
    formContainer: {
      width: '90%',
      maxWidth: '450px',
      padding: isMobile ? '20px' : '40px',
      borderRadius: '1.5rem',
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255,255,255, .2)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      margin: isMobile ? '0 auto' : '0',
      transform: isMobile ? 'translateY(0)' : 'none'
    },
    leftPanelContent: {
      color: 'white',
      textAlign: 'center',
      maxWidth: '80%',
      zIndex: 1
    },
    brandTitle: {
      fontSize: '3vw',
      fontWeight: '600',
      marginBottom: '1vw'
    },
    brandSubtitle: {
      fontSize: '1.5vw',
      opacity: 0.9,
      lineHeight: 1.6
    },
    formTitle: {
      fontSize: '28px',
      color: isMobile ? "#f8fafc" : "black",
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
      fontSize: '16px',
      fontWeight: '500',
      color: isMobile ? "#f8fafc" : "black"
    },
    formInput: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '16px',
      borderRadius: '1rem',
      border: '1px solid #ddd',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
      color: isMobile ? "#f8fafc" : "black",
      background: "rgba(255,255,255,.3)"
    },
    submitButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: isMobile ? "#f8fafc" : "#046307",
      color: isMobile ? "#046307" : "#f8fafc",
      border: 'none',
      borderRadius: '1rem',
      fontSize: '18px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '10px'
    },
    submitButtonHover: {
      backgroundColor: '#034d05',
      color: "#f8fafc"
    },
    errorText: {
      color: '#e74c3c',
      fontSize: '14px',
      marginTop: '10px',
      textAlign: 'center'
    },
    backgroundCircle1: {
      position: 'absolute',
      width: '18vw',
      height: '18vw',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      top: '10%',
      left: '10%',
      display: isMobile ? 'none' : 'block'
    },
    backgroundCircle2: {
      position: 'absolute',
      width: '26vw',
      height: '26vw',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      bottom: '10%',
      right: '5%',
      display: isMobile ? 'none' : 'block'
    },
    circle1: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      top: '-12%',
      left: '-25%'
    },
    circle2: {
      position: 'absolute',
      width: '250px',
      height: '250px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      top: '10%',
      right: '-15%'
    },
    circle3: {
      position: 'absolute',
      width: '250px',
      height: '250px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      bottom:'20%',
      left: '-5%'
    },
    circle4: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      bottom: '-10%',
      right: '-20%'
    },
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.rightPanel}>
        <div style={styles.circle1}></div>
        <div style={styles.circle2}></div>
        <div style={styles.circle3}></div>
        <div style={styles.circle4}></div>
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
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
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
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
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