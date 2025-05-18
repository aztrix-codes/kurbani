'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNavigation = (path) => {
    router.push(`/auth/${path}`);
  };

  const styles = {
    mainContainer: {
      display: 'flex',
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      flexDirection: 'row-reverse',
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
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    button: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#046307',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
    },
    buttonHovered: {
      backgroundColor: '#034d05',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
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

  // Only apply media queries on client side
  if (isClient) {
    const responsiveStyles = (() => {
      if (window.innerWidth <= 768) {
        return {
          mainContainer: {
            flexDirection: 'column',
            background: '#046307' // This sets the mobile background to green
          },
          leftPanel: {
            display: 'none' // Hide the left panel on mobile
          },
          rightPanel: {
            width: '100%',
            height: '100%',
            background: 'transparent' // Make right panel transparent to show green background
          },
          formContainer: {
            width: '85%',
            padding: '30px'
          }
        };
      }
      return {};
    })();

    Object.keys(responsiveStyles).forEach(key => {
      if (styles[key]) {
        styles[key] = { ...styles[key], ...responsiveStyles[key] };
      }
    });
  }

  return (
    <div style={styles.mainContainer}>
      {/* Right Panel - Login Selection */}
      <div style={styles.rightPanel}>
        <div style={styles.backgroundCircle3}></div>
        <div style={styles.backgroundCircle4}></div>
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Select Login Type</h2>
          
          <div style={styles.buttonContainer}>
            <button
              style={hoveredButton === "admin" ? {...styles.button, ...styles.buttonHovered} : styles.button}
              onMouseEnter={() => setHoveredButton("admin")}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation("admin")}
            >
              Admin Login
            </button>
            
            <button
              style={hoveredButton === "user" ? {...styles.button, ...styles.buttonHovered} : styles.button}
              onMouseEnter={() => setHoveredButton("user")}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation("user")}
            >
              User Login
            </button>
          </div>
        </div>
      </div>

      {/* Left Panel - Branding (hidden on mobile) */}
      <div style={styles.leftPanel}>
        <div style={styles.backgroundCircle1}></div>
        <div style={styles.backgroundCircle2}></div>
        <div style={styles.leftPanelContent}>
          <h1 style={styles.brandTitle}>Welcome</h1>
          <p style={styles.brandSubtitle}>
            Select your login type to access your account and continue your journey with us.
          </p>
        </div>
      </div>
    </div>
  );
}