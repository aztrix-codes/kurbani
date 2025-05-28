'use client'

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, RefreshCw, Edit, Save } from 'lucide-react';
import './style.css';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Dashboard = () => {

  const router = useRouter()

  useEffect(() => {
  const isLoggedIn = localStorage.getItem('superAdminLoggedIn') === 'true';
  if (!isLoggedIn) {
    router.replace('/auth/superadmin');
  }
}, [router]);


  const [isLocked, setIsLocked] = useState(false);
  const [isUpdatingLock, setIsUpdatingLock] = useState(false);
  const [adminData, setAdminData] = useState({ 
    m_a_cost: 0,
    oom_a_cost: 0,
    lockall: false
  }); 
  const [customerData, setCustomerData] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [combinedTotals, setCombinedTotals] = useState({
    total: 0,
    paid: 0,
    pending: 0
  });

  // New state for editing costs
  const [isEditingMumbai, setIsEditingMumbai] = useState(false);
  const [isEditingOOM, setIsEditingOOM] = useState(false);
  const [mumbaiCostInput, setMumbaiCostInput] = useState('');
  const [oomCostInput, setOomCostInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all data
  const fetchAllData = async () => {
    try {
      await fetchAdminData();
      await fetchCustomerData();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAdminData = async () => {
    const username = localStorage.getItem('superAdminUsername');
    const password = localStorage.getItem('superAdminPassword');

    const response = await axios.get('/api/superadmin', {
      params: { name: username, password: password }
    });
    if (response.data.success) {
      const fullMaCost = parseFloat(response.data.data.m_a_cost);
      const fullOomCost = parseFloat(response.data.data.oom_a_cost);
      const lockStatus = response.data.data.lockall;
      
      setAdminData({
        m_a_cost: fullMaCost ,
        oom_a_cost: fullOomCost ,
        lockall: lockStatus
      });
      
      // Update lock state
      setIsLocked(lockStatus);
      
      // Update input values with full costs
      setMumbaiCostInput(fullMaCost.toString());
      setOomCostInput(fullOomCost.toString());
    }
  };

  const fetchCustomerData = async () => {
    const response = await axios.get('/api/customers?user_id=0');
    setCustomerData(response.data);
  };

  // Update cost via API
  const updateCost = async (costType, value) => {
    setIsSaving(true);
    try {
      const updateData = {};
      updateData[costType] = parseFloat(value);
      
      const response = await axios.put('/api/superadmin', updateData);
      
      if (response.data.success) {
        // Refresh admin data to get updated values
        await fetchAdminData();
        
        // Reset editing state
        if (costType === 'm_a_cost') {
          setIsEditingMumbai(false);
        } else {
          setIsEditingOOM(false);
        }
        
        console.log('Cost updated successfully');
      }
    } catch (error) {
      console.error('Error updating cost:', error);
      alert('Failed to update cost. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit button click
  const handleEdit = (costType) => {
    if (costType === 'm_a_cost') {
      setIsEditingMumbai(true);
    } else {
      setIsEditingOOM(true);
    }
  };

  // Handle save button click
  const handleSave = (costType) => {
    const value = costType === 'm_a_cost' ? mumbaiCostInput : oomCostInput;
    
    if (!value || isNaN(value) || parseFloat(value) < 0) {
      alert('Please enter a valid positive number');
      return;
    }
    
    updateCost(costType, value);
  };

  // Update lock status via API
  const updateLockStatus = async (lockStatus) => {
    const username = localStorage.getItem('superAdminUsername');
    const password = localStorage.getItem('superAdminPassword');
    setIsUpdatingLock(true);
    try {
      const response = await axios.patch('/api/superadmin', {
        lockall: lockStatus,
        name: username,
        password: password
      });
      
      if (response.data.success) {
        setIsLocked(lockStatus);
        setAdminData(prev => ({ ...prev, lockall: lockStatus }));
        console.log(`Lock status updated to ${lockStatus ? 'locked' : 'unlocked'}`);
      }
    } catch (error) {
      console.error('Error updating lock status:', error);
      alert('Failed to update lock status. Please try again.');
      // Revert the lock state on failure
      setIsLocked(!lockStatus);
    } finally {
      setIsUpdatingLock(false);
    }
  };

  // Handle lock button click
  const handleLockToggle = () => {
    const newLockStatus = !isLocked;
    updateLockStatus(newLockStatus);
  };
  const handleCancel = (costType) => {
    if (costType === 'm_a_cost') {
      setIsEditingMumbai(false);
      setMumbaiCostInput((adminData.m_a_cost).toString());
    } else {
      setIsEditingOOM(false);
      setOomCostInput((adminData.oom_a_cost).toString());
    }
  };

  // Initial load
  useEffect(() => {
    fetchAllData();
    
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
    const outOfMumbai = customerData.filter(c => 
      c.zone.toLowerCase().includes('out of mumbai') || 
      c.zone.toLowerCase() === 'outofmumbai'
    );
    const mumbai = customerData.filter(c => 
      c.zone.toLowerCase().includes('mumbai') && 
      !c.zone.toLowerCase().includes('out of')
    );
    
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

    // Calculate combined totals for the header only
    setCombinedTotals({
      total: oom.totalAmount + mum.totalAmount,
      paid: oom.paidAmount + mum.paidAmount,
      pending: oom.pendingAmount + mum.pendingAmount
    });

    setDashboardData([
      { title: 'Animals (Out of Mumbai)', count: oom.totalAnimals, amt:  ''},
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Dashboard</h1>
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
            onClick={handleLockToggle}
            disabled={isUpdatingLock}
            className={`lock-button ${isLocked ? 'locked' : 'unlocked'}`}
          >
            {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
            {isUpdatingLock ? 'Updating...' : (isLocked ? 'Locked' : 'Lock')}
          </button>
        </div>
      </div>

      <div className='cost-info-input'>
        <span>
          Mumbai animal cost: 
          <input 
            type="text" 
            value={mumbaiCostInput}
            onChange={(e) => setMumbaiCostInput(e.target.value)}
            disabled={!isEditingMumbai || isSaving}
            className={isEditingMumbai ? 'editing' : ''}
          />
          {isEditingMumbai ? (
            <div className="input-actions">
              <button 
                onClick={() => handleSave('m_a_cost')}
                disabled={isSaving}
                className="save-btn"
                title="Save"
              >
                <Save size={14} />
              </button>
              <button 
                onClick={() => handleCancel('m_a_cost')}
                disabled={isSaving}
                className="cancel-btn"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          ) : (
            <button 
              onClick={() => handleEdit('m_a_cost')}
              className="edit-btn"
              title="Edit"
            >
              <Edit size={14} />
            </button>
          )}
        </span>
        
        <span>
          Out of Mumbai animal cost: 
          <input 
            type="text" 
            value={oomCostInput}
            onChange={(e) => setOomCostInput(e.target.value)}
            disabled={!isEditingOOM || isSaving}
            className={isEditingOOM ? 'editing' : ''}
          />
          {isEditingOOM ? (
            <div className="input-actions">
              <button 
                onClick={() => handleSave('oom_a_cost')}
                disabled={isSaving}
                className="save-btn"
                title="Save"
              >
                <Save size={14} />
              </button>
              <button 
                onClick={() => handleCancel('oom_a_cost')}
                disabled={isSaving}
                className="cancel-btn"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          ) : (
            <button 
              onClick={() => handleEdit('oom_a_cost')}
              className="edit-btn"
              title="Edit"
            >
              <Edit size={14} />
            </button>
          )}
        </span>
      </div>

      <div className="cost-info">
        <span>Rupees/Share (Mumbai): ₹{adminData.m_a_cost.toLocaleString()}</span>
        <span>Rupees/Share (Out of Mumbai): ₹{adminData.oom_a_cost.toLocaleString()}</span>
        <span>Total: {formatCurrency(combinedTotals.total)}</span>
        <span>Paid: {formatCurrency(combinedTotals.paid)}</span>
        <span>Pending: {formatCurrency(combinedTotals.pending)}</span>
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