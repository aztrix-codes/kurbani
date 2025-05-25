'use client'

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, RefreshCw } from 'lucide-react';
import './style.css';
import axios from 'axios';

const Dashboard = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [adminData, setAdminData] = useState({ 
    m_a_cost: 0,
    oom_a_cost: 0 
  }); 
  const [customerData, setCustomerData] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch all data
  const fetchAllData = async () => {
    try {
      // setIsLoading(true);
      await fetchAdminData();
      await fetchCustomerData();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    const response = await axios.get('/api/superadmin', {
      params: { name: 'superadmin', password: 'super123' }
    });
    if (response.data.success) {
      setAdminData({
        m_a_cost: parseFloat(response.data.data.m_a_cost),
        oom_a_cost: parseFloat(response.data.data.oom_a_cost)
      });
    }
  };

  const fetchCustomerData = async () => {
    const response = await axios.get('/api/customers?user_id=0');
    setCustomerData(response.data);
  };

  // Initial load
  useEffect(() => {
    fetchAllData();
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate dashboard metrics whenever data changes
  useEffect(() => {
    if (customerData.length > 0 && adminData.m_a_cost > 0) {
      calculateDashboardData();
    }
  }, [customerData, adminData]);

  const calculateDashboardData = () => {
    const outOfMumbai = customerData.filter(c => c.zone === 'Out Of Mumbai');
    const mumbai = customerData.filter(c => c.zone === 'Mumbai' || c.zone === 'In Mumbai');
    
    const calculateMetrics = (customers, costPerShare) => {
      const totalShares = customers.length;
      const totalAnimals = Math.floor(totalShares / 7);
      const totalAmount = totalShares * costPerShare;
      
      const paidCustomers = customers.filter(c => c.payment_status === 1);
      const paidAmount = paidCustomers.reduce((sum, c) => sum + (costPerShare), 0);
      const pendingAmount = totalAmount - paidAmount;
      
      return {
        totalShares,
        totalAnimals,
        totalAmount,
        paidCount: paidCustomers.length,
        paidAmount,
        pendingCount: totalShares - paidCustomers.length,
        pendingAmount
      };
    };

    const oom = calculateMetrics(outOfMumbai, adminData.oom_a_cost);
    const mum = calculateMetrics(mumbai, adminData.m_a_cost);

    setDashboardData([
      { title: 'Animals (Out of Mumbai)', count: oom.totalAnimals, amt: '' },
      { title: 'Shares (Out of Mumbai)', count: oom.totalShares, amt: oom.totalAmount },
      { title: 'Paid (Out of Mumbai)', count: oom.paidCount, amt: oom.paidAmount },
      { title: 'Pending (Out of Mumbai)', count: oom.pendingCount, amt: oom.pendingAmount },
      { title: 'Animals (Mumbai)', count: mum.totalAnimals, amt: '' },
      { title: 'Shares (Mumbai)', count: mum.totalShares, amt: mum.totalAmount },
      { title: 'Paid (Mumbai)', count: mum.paidCount, amt: mum.paidAmount },
      { title: 'Pending (Mumbai)', count: mum.pendingCount, amt: mum.pendingAmount }
    ]);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value).replace('₹', '₹ ');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="cost-info">
            <span>Mumbai: ₹{adminData.m_a_cost.toLocaleString()}</span>
            <span>Out of Mumbai: ₹{adminData.oom_a_cost.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="dashboard-header-right">
          <button 
            onClick={fetchAllData}
            className="refresh-button"
            title="Refresh data"
          >
            <RefreshCw size={18} />
            <span>{formatTime(lastUpdated)}</span>
          </button>
          
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`lock-button ${isLocked ? 'locked' : 'unlocked'}`}
          >
            {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
            {isLocked ? 'Locked' : 'Lock'}
          </button>
        </div>
      </div>

      <div className="dashboard-cards-container">
        <div className="dashboard-cards-grid">
          {dashboardData.map((item, index) => (
            <div key={index} className="dashboard-card">
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
                <div className="dashboard-card-amount">
                  {item.amt !== '' ? formatCurrency(item.amt) : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;