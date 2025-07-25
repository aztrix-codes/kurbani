'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function UserLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [buttonHovered, setButtonHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
  const setupDatabase = async () => {
    try {
      const response = await axios.get('/api/setupdb');
      
      if (response.data.success) {
        console.log('Setup successful!');
      } else {
      }
    } catch (error) {
    }
  };

  setupDatabase();
}, []);

  // Check screen size for mobile responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Auto login on mount if credentials exist
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const storedIdentifier = localStorage.getItem('identifier');
    const storedPassword = localStorage.getItem('password');

    if (userData?.isAuthenticated && userData?.status === 1 && storedIdentifier && storedPassword) {
      autoLogin(storedIdentifier, storedPassword);
    }
  }, []);

  const autoLogin = async (storedIdentifier, storedPassword) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Check if server is locked before attempting auto login
      const isLocked = await checkLockStatus();
      if (isLocked) {
        setError('The server has been frozen by admin. Please try again later.');
        // Clear stored credentials if server is locked
        localStorage.removeItem('identifier');
        localStorage.removeItem('password');
        localStorage.removeItem('userData');
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `/api/users/user?phoneOrEmail=${encodeURIComponent(storedIdentifier)}&password=${encodeURIComponent(storedPassword)}`
      );
      const data = await response.json();

      if (response.ok && data.status === 1) {
        localStorage.setItem('userData', JSON.stringify({
          userId: data.user_id,
          isAuthenticated: true,
          status: data.status,
          name: data.username,
          img: data.img_url,
          m: data.mumbai,
          oom: data.out_of_mumbai
        }));
        router.replace('/user');
      } else {
        // Clear stored credentials if auto login fails
        localStorage.removeItem('identifier');
        localStorage.removeItem('password');
        localStorage.removeItem('userData');
        setError('Auto login failed. Please login manually.');
      }
    } catch (err) {
      console.error('Auto login error:', err);
      setError('Network error during auto login. Please login manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!identifier || !password) {
      setError('Please enter both identifier and password');
      return;
    }

    setIsLoading(true);

    try {
      // Check if server is locked before attempting login
      const isLocked = await checkLockStatus();
      if (isLocked) {
        setError('The server has been frozen by admin. Please try again later.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `/api/users/user?phoneOrEmail=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`
      );
      
      const data = await response.json();

      if (response.ok) {
        if (data.status === 1) {
          localStorage.setItem('userData', JSON.stringify({
            userId: data.user_id,
            isAuthenticated: true,
            status: data.status,
            name: data.username,
            img: data.img_url,
            m: data.mumbai,
            oom: data.out_of_mumbai
          }));
          // Store credentials for auto login
          localStorage.setItem('identifier', identifier);
          localStorage.setItem('password', password);
          router.replace('/user');
        } else {
          setError('Your account is deactivated. Please contact support.');
        }
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
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
      {/* Right Panel - Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.circle1}></div>
        <div style={styles.circle2}></div>
        <div style={styles.circle3}></div>
        <div style={styles.circle4}></div>
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>User Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="identifier">
                Email / Phone
              </label>
              <input
                style={styles.formInput}               
                type="text"
                id="identifier"
                placeholder="Enter your email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.replace(/\s/g, ''))}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="password">
                Password
              </label>
              <input
                style={styles.formInput}
                type="password"
                id="password"
                placeholder="Enter your password"
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