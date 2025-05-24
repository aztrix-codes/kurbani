'use client'

import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import './style.css';

const Dashboard = () => {
  const [isLocked, setIsLocked] = useState(false);

  // Sample data following the structure from your image
  const dashboardData = [
    { title: 'Total Animal Out of Mumbai', count: 1754, amt: '' },
    { title: 'Total Shares', count: 12281, amt: '13,509,100' },
    { title: 'Paid Amount', count: 10182, amt: '11,200,200' },
    { title: 'Pending Amount', count: 2099, amt: '2,308,900' },
    { title: 'Total Animal Mumbai', count: 50, amt: '' },
    { title: 'Active Shares', count: 353, amt: '1,517,900' },
    { title: 'Completed Payments', count: 847, amt: '892,400' },
    { title: 'Processing Orders', count: 156, amt: '234,500' }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`dashboard-lock-button ${isLocked ? 'locked' : 'unlocked'}`}
        >
          {isLocked ? <Lock size="1.2vw" /> : <Unlock size="1.2vw" />}
          {isLocked ? 'Locked' : 'Lock'}
        </button>
      </div>

      <div className="dashboard-cards-container">
        <div className="dashboard-cards-grid">
          {dashboardData.map((item, index) => (
            <div
              key={index}
              className="dashboard-card"
            >
              <div className="dashboard-card-gradient"></div>
              
              <div className="dashboard-card-header">
                <div className="dashboard-card-indicator"></div>
                <div className="dashboard-card-status">LIVE</div>
              </div>

              <div>
                <h3 className="dashboard-card-title">{item.title}</h3>
                <div className="dashboard-card-count">
                  {item.count.toLocaleString()}
                </div>
                <div className="dashboard-card-amount">{item.amt && `₹ ${item?.amt}`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;