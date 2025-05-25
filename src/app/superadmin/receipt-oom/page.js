'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const DataTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [areasList, setAreasList] = useState([]);
  const [users, setUsers] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [data, setData] = useState([
    { id: 1, zone: 'North', area: 'Mumbai', submittedBy: 'John Doe', totalHissa: 25 },
    { id: 2, zone: 'South', area: 'Bangalore', submittedBy: 'Jane Smith', totalHissa: 18 },
    { id: 3, zone: 'East', area: 'Kolkata', submittedBy: 'Robert Johnson', totalHissa: 32 },
    { id: 4, zone: 'West', area: 'Delhi', submittedBy: 'Emily Davis', totalHissa: 14 },
    { id: 5, zone: 'Central', area: 'Hyderabad', submittedBy: 'Michael Brown', totalHissa: 27 },
    { id: 6, zone: 'North', area: 'Pune', submittedBy: 'Sarah Wilson', totalHissa: 19 },
    { id: 7, zone: 'South', area: 'Chennai', submittedBy: 'David Taylor', totalHissa: 22 },
    { id: 8, zone: 'East', area: 'Ahmedabad', submittedBy: 'Jessica Lee', totalHissa: 16 },
    { id: 9, zone: 'West', area: 'Jaipur', submittedBy: 'Daniel Clark', totalHissa: 29 },
    { id: 10, zone: 'Central', area: 'Lucknow', submittedBy: 'Lisa Walker', totalHissa: 21 },
  ]);

  // Modal states
  const [showEyeModal, setShowEyeModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  
  // Receipt form states
  const [amountPerShare, setAmountPerShare] = useState(4300);
  const [howMuchPaying, setHowMuchPaying] = useState(0);
  const [paidBy, setPaidBy] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [userViewDetail, setUserViewDetail] = useState([]);
  
  // Transaction logs storage - key is the row ID, value is the array of transactions
  const [allTransactionLogs, setAllTransactionLogs] = useState({});
  
  // Current transaction log for the selected row
  const [currentTransactionLog, setCurrentTransactionLog] = useState([]);
  
  // Dummy data for eye modal
  const [recordsData] = useState([
    { animalCount: 1, shareCount: 7, name: 'Shehna Khan', purpose: 'Qurbani', status: 'SENT' },
    { animalCount: 1, shareCount: 7, name: 'Mehrunnisha Hamid pathan', purpose: 'Qurbani', status: 'SENT' },
    { animalCount: 1, shareCount: 7, name: 'Rukhsana murtuza momin', purpose: 'Qurbani', status: 'SENT' },
    { animalCount: 1, shareCount: 7, name: 'Irshad jahan shaikh', purpose: 'Qurbani', status: 'SENT' },
    { animalCount: 1, shareCount: 7, name: 'Ashmat bee mehmood shaikh', purpose: 'Qurbani', status: 'SENT' },
    { animalCount: 1, shareCount: 7, name: 'Parveen Abdul gafur khan', purpose: 'Qurbani', status: 'SENT' },
    { animalCount: 1, shareCount: 7, name: 'Fatima Abdul fakir', purpose: 'Qurbani', status: 'SENT' },
    { animalCount: 2, shareCount: 7, name: 'Mohammed shakeel shaikh', purpose: 'Qurbani', status: 'SENT' },
    { animalCount: 2, shareCount: 7, name: 'Sayyed atique ur raham khaliqur Rahman', purpose: 'Qurbani', status: 'SENT' },
  ]);

   // Fetch areas from API
  const fetchAreas = async () => {
    try {
      const response = await axios.get('/api/areas');
      setAreasList(response.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
      alert('Failed to fetch areas');
    } finally {
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users');
    } finally {
    }
  };

  // Fetch Customers Data
  const fetchCustomerData = async () => {
      const response = await axios.get('/api/customers?user_id=0');
      setCustomerData(response.data);
    };

    useEffect(() => {
      fetchAreas();
      fetchCustomerData();
      fetchUsers();
      const interval = setInterval(() => {
        fetchAreas();
        fetchCustomerData();
        fetchUsers();
      }, 60000);
      return () => clearInterval(interval);
    }, []);

  // Helper function to round up to the nearest whole number
  const roundUp = (num) => {
    return Math.ceil(num);
  };

  // Calculate derived values for receipt form
  const calculateDerivedValues = (rowData, transactions, currentPayingShares) => {
    if (!rowData) return { totalShares: 0, totalSharesPaid: 0, pendingShares: 0, totalAmount: 0, totalCollectedAmount: 0, currentPaidAmount: 0, balance: 0 };
    
    const totalShares = rowData.totalHissa;
    
    // Calculate total shares paid from transaction log
    const totalSharesPaid = transactions.reduce((sum, transaction) => sum + transaction.shares, 0);
    
    // Calculate pending shares after current payment
    const pendingShares = Math.max(0, totalShares - totalSharesPaid - currentPayingShares);
    
    // Calculate total amount (rounded up)
    const totalAmount = roundUp(totalShares * amountPerShare);
    
    // Calculate paid amount for current transaction (rounded up)
    const currentPaidAmount = roundUp(currentPayingShares * amountPerShare);
    
    // Calculate total amount collected so far (rounded up)
    const totalCollectedAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Calculate balance (remaining amount to be collected) after current payment
    const balance = Math.max(0, totalAmount - totalCollectedAmount - currentPaidAmount);
    
    return {
      totalShares,
      totalSharesPaid,
      pendingShares,
      totalAmount,
      totalCollectedAmount,
      currentPaidAmount,
      balance
    };
  };

  // Get the derived values for the current state
  const derivedValues = calculateDerivedValues(selectedRowData, currentTransactionLog, howMuchPaying);

  // Handle opening eye modal
  const handleEyeClick = (rowId, rowData, item) => {
    setSelectedRowId(rowId);
    setSelectedRowData(rowData);
    setShowEyeModal(true);
    setUserViewDetail(item)
  };

  // Handle opening receipt modal
  const handleReceiptClick = (rowId, rowData) => {
    setSelectedRowId(rowId);
    setSelectedRowData(rowData);
    
    // Get existing transactions for this row or initialize empty array
    const existingTransactions = allTransactionLogs[rowId] || [];
    setCurrentTransactionLog(existingTransactions);
    
    // Reset form values
    setHowMuchPaying(0);
    setPaidBy('');
    setCollectedBy('');
    setSelectedImage(null);
    setFormErrors({});
    
    setShowReceiptModal(true);
  };

  // Handle closing modals
  const closeEyeModal = () => {
    setShowEyeModal(false);
    setSelectedRowId(null);
    setSelectedRowData(null);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedRowId(null);
    setSelectedRowData(null);
    setCurrentTransactionLog([]);
    setFormErrors({});
  };

  // Handle image selection from file
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setFormErrors({...formErrors, image: null});
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Handle file upload
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (howMuchPaying <= 0) {
      errors.howMuchPaying = "Please enter a valid number of shares to pay for";
    }
    
    if (!paidBy.trim()) {
      errors.paidBy = "Paid by is required";
    }
    
    if (!collectedBy.trim()) {
      errors.collectedBy = "Collected by is required";
    }
    
    if (!selectedImage) {
      errors.image = "Image is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Calculate the amount with rounding up
    const amount = roundUp(howMuchPaying * amountPerShare);
    
    // Add new transaction to log
    const newTransaction = {
      date: new Date().toLocaleDateString('en-GB'),
      shares: howMuchPaying,
      amount: amount,
      paidBy: paidBy,
      collectedBy: collectedBy,
      image: selectedImage
    };
    
    // Update current transaction log
    const updatedTransactionLog = [...currentTransactionLog, newTransaction];
    setCurrentTransactionLog(updatedTransactionLog);
    
    // Update all transaction logs
    setAllTransactionLogs({
      ...allTransactionLogs,
      [selectedRowId]: updatedTransactionLog
    });
    
    // Reset form
    setHowMuchPaying(0);
    setPaidBy('');
    setCollectedBy('');
    setSelectedImage(null);
    setFormErrors({});
    
    // Show success message
    alert(`Payment of ${amount} INR for ${howMuchPaying} shares recorded successfully!`);
  };

  const exportToExcel = () => {
    console.log('Exporting to Excel...');
  };

  const filteredData = users.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerTitle}>
              <h1 style={styles.h1}>Generate Receipt - Out of Mumbai</h1>
            </div>
            
            <div style={styles.headerActions}>
              {/* Search */}
              <div style={styles.searchContainer}>
                <SearchIcon style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              
              {/* Export Button */}
              <button 
                onClick={exportToExcel}
                style={styles.exportBtn}
              >
                <DownloadIcon style={styles.btnIcon} />
                Export
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.statsText}>
              Total Records: <span style={styles.statsValue}>{data.length}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div style={styles.tableContainer}>
          {/* Table Header */}
          <div style={styles.tableHeader}>
            <div style={styles.tableRow}>
              <div style={{...styles.tableCell, ...styles.cellId, ...styles.headerCell}}>ID</div>
              <div style={{...styles.tableCell, ...styles.cellZone, ...styles.headerCell}}>ZONE</div>
              <div style={{...styles.tableCell, ...styles.cellArea, ...styles.headerCell}}>AREA</div>
              <div style={{...styles.tableCell, ...styles.cellSubmitted, ...styles.headerCell}}>NIGRA</div>
              <div style={{...styles.tableCell, ...styles.cellHissa, ...styles.headerCell}}>TOTAL HISSA</div>
              <div style={{...styles.tableCell, ...styles.cellReceipt, ...styles.headerCell}}>RECEIPT</div>
              <div style={{...styles.tableCell, ...styles.cellActions, ...styles.headerCell}}>VIEW</div>
            </div>
          </div>

          {/* Table Body */}
         <div style={styles.tableBody}>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => {
              // Filter customerData based on matching user_id
              const userCustomerData = customerData.filter(customer => 
                customer.user_id == item.user_id && customer.zone === "Out Of Mumbai" && customer.status === 1
              );
              // Calculate total hissa (count of filtered records)
              const totalHissa = userCustomerData.length;
              
              // Calculate shares paid (count of records with payment_status: 1)
              const sharesPaid = userCustomerData.filter(customer => customer.payment_status === 1).length;
              
              // Find the zone_name from areasList based on matching area_name
              const matchedArea = areasList.find(area => area.area_name === item.area_name);
              const zoneName = matchedArea ? matchedArea.zone_name : 'N/A';

              return (
                <div
                  key={index}
                  style={styles.dataRow}
                  className="data-row" // For hover effect
                >
                  {/* ID */}
                  <div style={{...styles.tableCell, ...styles.cellId}}>
                    <span style={styles.idText}>{index + 1}</span>
                  </div>

                  {/* Zone */}
                  <div style={{...styles.tableCell, ...styles.cellZone}}>
                    <span style={styles.zoneText}>{zoneName}</span>
                  </div>

                  {/* Area */}
                  <div style={{...styles.tableCell, ...styles.cellArea}}>
                    <span style={styles.areaText}>{item.area_name}</span>
                  </div>

                  {/* Submitted By */}
                  <div style={{...styles.tableCell, ...styles.cellSubmitted}}>
                    <span style={styles.submittedText}>{item.username}</span>
                  </div>

                  {/* Total Hissa */}
                  <div style={{...styles.tableCell, ...styles.cellHissa}}>
                    <div style={styles.hissaContainer}>
                      <span style={styles.hissaBadge}>
                        {sharesPaid > 0 ? `${sharesPaid}/${totalHissa}` : totalHissa}
                      </span>
                    </div>
                  </div>

                  {/* Generate Receipt */}
                  <div style={{...styles.tableCell, ...styles.cellReceipt}}>
                    <button
                      style={{...styles.btn, ...styles.btnPrimary}}
                      onClick={() => handleReceiptClick(item.id, item)}
                    >
                      <FileTextIcon style={styles.btnIcon} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{...styles.tableCell, ...styles.cellActions}}>
                    <button
                      style={{...styles.btn, ...styles.btnSecondary}}
                      onClick={() => handleEyeClick(item.id, userCustomerData, item)}
                    >
                      <EyeIcon style={styles.btnIcon} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <SearchIcon style={styles.emptyIconSvg} />
              </div>
              <h3 style={styles.emptyTitle}>No records found</h3>
              <p style={styles.emptyText}>Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
        </div>
      </div>
      
      {/* Eye Modal */}
      {showEyeModal && (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>View Record Details :</h2>
            <button style={styles.closeButton} onClick={closeEyeModal}>×</button>
          </div>
          <div style={styles.modalBody}>
            <div style={styles.recordDetails}>
              <div style={styles.recordItem}>
                <span style={styles.recordLabel}>Zone:</span>
                <span style={styles.recordValue}>{
                  (() => {
                    const matchedArea = areasList.find(area => area.area_name === userViewDetail?.area_name);
                    return matchedArea ? matchedArea.zone_name : 'N/A';
                  })()
                }</span>
              </div>
              <div style={styles.recordItem}>
                <span style={styles.recordLabel}>Area:</span>
                <span style={styles.recordValue}>{userViewDetail?.area_name || 'N/A'}</span>
              </div>
              <div style={styles.recordItem}>
                <span style={styles.recordLabel}>Area Incharge:</span>
                <span style={styles.recordValue}>{
                  (() => {
                    const matchedArea = areasList.find(area => area.area_name === userViewDetail?.area_name);
                    return matchedArea ? matchedArea.area_incharge : 'N/A';
                  })()
                }</span>
              </div>
              <div style={styles.recordItem}>
                <span style={styles.recordLabel}>Incharge:</span>
                <span style={styles.recordValue}>{userViewDetail?.username || 'N/A'}</span>
              </div>
              <div style={styles.recordItem}>
                <span style={styles.recordLabel}>Contact Number:</span>
                <span style={styles.recordValue}>{userViewDetail?.phone || 'N/A'}</span>
              </div>
              <div style={styles.recordItem}>
                <span style={styles.recordLabel}>Email:</span>
                <span style={styles.recordValue}>{userViewDetail?.email || 'N/A'}</span>
              </div>
              <div style={styles.recordItem}>
                <span style={styles.recordLabel}>Total Share Count:</span>
                <span style={styles.recordValue}>{selectedRowData?.length || 0} Share(s)</span>
              </div>
              <div style={styles.recordItem}>
                <span style={styles.recordLabel}>Total Animal Count:</span>
                <span style={styles.recordValue}>{Math.floor((selectedRowData?.length || 0) / 7)} Animal(s)</span>
              </div>
            </div>
            
            <div style={styles.recordTable}>
              <div style={styles.recordTableHeader}>
                <div style={styles.recordTableRow}>
                  <div style={styles.recordTableCell}>Share Count</div>
                  <div style={styles.recordTableCell}>Receipt ID</div>
                  <div style={styles.recordTableCell}>Name</div>
                  <div style={styles.recordTableCell}>Purpose</div>
                  <div style={styles.recordTableCell}>Status</div>
                </div>
              </div>
              <div style={styles.recordTableBody}>
                {selectedRowData && selectedRowData.map((record, index) => (
                  <div key={index} style={styles.recordTableRow}>
                    <div style={styles.recordTableCell}>{index + 1}</div>
                    <div style={styles.recordTableCell}>{record.recipt || 'N/A'}</div>
                    <div style={styles.recordTableCell}>{record.name}</div>
                    <div style={styles.recordTableCell}>{record.type}</div>
                    <div style={styles.recordTableCell}>
                      <span style={{
                        padding: '0.2vw 0.5vw',
                        borderRadius: '0.3vw',
                        fontSize: '0.9vw',
                        fontWeight: 600,
                        backgroundColor: record.payment_status === 1 ? '#dcfce7' : '#fef2f2',
                        color: record.payment_status === 1 ? '#166534' : '#dc2626'
                      }}>
                        {record.payment_status === 1 ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
      
      {/* Receipt Modal */}
      {showReceiptModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Generate Receipt - ID: {selectedRowId}</h2>
              <button style={styles.closeButton} onClick={closeReceiptModal}>×</button>
            </div>
            <div style={styles.modalBody}>
              {/* Share Status Summary */}
              <div style={styles.shareStatusContainer}>
                <div style={styles.shareStatusHeader}>Share Status</div>
                <div style={styles.shareStatusGrid}>
                  <div style={styles.shareStatusItem}>
                    <div style={styles.shareStatusLabel}>Total Shares</div>
                    <div style={styles.shareStatusValue}>{derivedValues.totalShares}</div>
                  </div>
                  <div style={styles.shareStatusItem}>
                    <div style={styles.shareStatusLabel}>Shares Paid</div>
                    <div style={styles.shareStatusValue}>{derivedValues.totalSharesPaid}</div>
                  </div>
                  <div style={styles.shareStatusItem}>
                    <div style={styles.shareStatusLabel}>Current Payment</div>
                    <div style={styles.shareStatusValue}>{howMuchPaying}</div>
                  </div>
                  <div style={styles.shareStatusItem}>
                    <div style={styles.shareStatusLabel}>Pending Shares</div>
                    <div style={styles.shareStatusValue}>{derivedValues.pendingShares}</div>
                  </div>
                </div>
              </div>
              
              {/* Financial Summary */}
              <div style={styles.financialSummaryContainer}>
                <div style={styles.financialSummaryHeader}>Financial Summary</div>
                <div style={styles.financialSummaryGrid}>
                  <div style={styles.financialSummaryItem}>
                    <div style={styles.financialSummaryLabel}>Total Amount (INR)</div>
                    <div style={styles.financialSummaryValue}>{derivedValues.totalAmount}</div>
                  </div>
                  <div style={styles.financialSummaryItem}>
                    <div style={styles.financialSummaryLabel}>Amount Collected (INR)</div>
                    <div style={styles.financialSummaryValue}>{derivedValues.totalCollectedAmount}</div>
                  </div>
                  <div style={styles.financialSummaryItem}>
                    <div style={styles.financialSummaryLabel}>Current Payment (INR)</div>
                    <div style={styles.financialSummaryValue}>{derivedValues.currentPaidAmount}</div>
                  </div>
                  <div style={styles.financialSummaryItem}>
                    <div style={styles.financialSummaryLabel}>Balance (INR)</div>
                    <div style={styles.financialSummaryValue}>{derivedValues.balance}</div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleFormSubmit} style={styles.receiptForm}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>TOTAL SHARES</label>
                    <input 
                      type="text" 
                      value={derivedValues.totalShares} 
                      readOnly 
                      style={styles.formInput} 
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Amount Per Share(Admin)</label>
                    <input 
                      type="number" 
                      value={amountPerShare} 
                      onChange={(e) => setAmountPerShare(Number(e.target.value))} 
                      style={styles.formInput} 
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>How much paying? <span style={styles.requiredField}>*</span></label>
                    <input 
                      type="number" 
                      value={howMuchPaying} 
                      onChange={(e) => {
                        const value = Math.min(
                          derivedValues.totalShares - derivedValues.totalSharesPaid, 
                          Math.max(0, Number(e.target.value))
                        );
                        setHowMuchPaying(value);
                        setFormErrors({...formErrors, howMuchPaying: null});
                      }} 
                      max={derivedValues.totalShares - derivedValues.totalSharesPaid}
                      min={0}
                      style={{
                        ...styles.formInput,
                        ...(formErrors.howMuchPaying ? styles.inputError : {}),
                        ...(derivedValues.totalShares - derivedValues.totalSharesPaid <= 0 ? styles.inputDisabled : {})
                      }} 
                      disabled={derivedValues.totalShares - derivedValues.totalSharesPaid <= 0}
                      required
                    />
                    {formErrors.howMuchPaying && (
                      <div style={styles.errorMessage}>{formErrors.howMuchPaying}</div>
                    )}
                    <span style={styles.formHint}>
                      {derivedValues.totalShares - derivedValues.totalSharesPaid > 0 
                        ? `Maximum available: ${derivedValues.totalShares - derivedValues.totalSharesPaid} shares` 
                        : "No shares available for payment"}
                    </span>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>TOTAL AMOUNT</label>
                    <input 
                      type="text" 
                      value={derivedValues.totalAmount} 
                      readOnly 
                      style={styles.formInput} 
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>PAID AMOUNT</label>
                    <input 
                      type="text" 
                      value={derivedValues.currentPaidAmount || 0} 
                      readOnly 
                      style={styles.formInput} 
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Balance</label>
                    <input 
                      type="text" 
                      value={derivedValues.balance || 0} 
                      readOnly 
                      style={styles.formInput} 
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>PAID BY <span style={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      value={paidBy} 
                      onChange={(e) => {
                        setPaidBy(e.target.value);
                        setFormErrors({...formErrors, paidBy: null});
                      }} 
                      style={{
                        ...styles.formInput,
                        ...(formErrors.paidBy ? styles.inputError : {})
                      }} 
                      required
                    />
                    {formErrors.paidBy && (
                      <div style={styles.errorMessage}>{formErrors.paidBy}</div>
                    )}
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>COLLECTED BY <span style={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      value={collectedBy} 
                      onChange={(e) => {
                        setCollectedBy(e.target.value);
                        setFormErrors({...formErrors, collectedBy: null});
                      }} 
                      style={{
                        ...styles.formInput,
                        ...(formErrors.collectedBy ? styles.inputError : {})
                      }} 
                      required
                    />
                    {formErrors.collectedBy && (
                      <div style={styles.errorMessage}>{formErrors.collectedBy}</div>
                    )}
                  </div>
                </div>
                
                <div style={styles.imageUploadSection}>
                  <div style={{
                    ...styles.imagePreview,
                    ...(formErrors.image ? styles.imagePreviewError : {})
                  }}>
                    {selectedImage ? (
                      <img src={selectedImage} alt="Selected" style={styles.previewImage} />
                    ) : (
                      <div style={styles.placeholderImage}>
                        <CameraIcon style={styles.cameraIconLarge} />
                        <div style={styles.imageRequiredText}>
                          Image Required <span style={styles.requiredField}>*</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {formErrors.image && (
                    <div style={styles.errorMessage}>{formErrors.image}</div>
                  )}
                  
                  <div style={styles.imageActions}>
                    {/* File upload input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                    />
                    
                    {/* Camera capture input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                      ref={cameraInputRef}
                      capture="environment"
                    />
                    
                    <button 
                      type="button" 
                      onClick={handleFileUpload} 
                      style={styles.imageButton}
                    >
                      <UploadIcon style={styles.btnIcon} />
                      <span style={styles.buttonText}>Upload Image</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleCameraCapture} 
                      style={styles.cameraButton}
                    >
                      <CameraIcon style={styles.btnIcon} />
                      <span style={styles.buttonText}>Take Photo</span>
                    </button>
                  </div>
                </div>
                
                <div style={styles.formActions}>
                  <button 
                    type="submit" 
                    style={{
                      ...styles.submitButton,
                      ...(derivedValues.totalShares - derivedValues.totalSharesPaid <= 0 ? styles.btnDisabled : {})
                    }}
                    disabled={derivedValues.totalShares - derivedValues.totalSharesPaid <= 0}
                  >
                    Submit Payment
                  </button>
                </div>
              </form>
              
              {currentTransactionLog.length > 0 && (
                <div style={styles.transactionLogSection}>
                  <h3 style={styles.sectionTitle}>Transaction History</h3>
                  <div style={styles.transactionTable}>
                    <div style={styles.transactionTableHeader}>
                      <div style={styles.transactionTableRow}>
                        <div style={styles.transactionTableCell}>Date</div>
                        <div style={styles.transactionTableCell}>Shares</div>
                        <div style={styles.transactionTableCell}>Amount</div>
                        <div style={styles.transactionTableCell}>Paid By</div>
                        <div style={styles.transactionTableCell}>Collected By</div>
                      </div>
                    </div>
                    <div style={styles.transactionTableBody}>
                      {currentTransactionLog.map((transaction, index) => (
                        <div key={index} style={styles.transactionTableRow}>
                          <div style={styles.transactionTableCell}>{transaction.date}</div>
                          <div style={styles.transactionTableCell}>{transaction.shares}</div>
                          <div style={styles.transactionTableCell}>{transaction.amount}</div>
                          <div style={styles.transactionTableCell}>{transaction.paidBy}</div>
                          <div style={styles.transactionTableCell}>{transaction.collectedBy}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .data-row:hover {
          background-color: #f8fafc;
          transition: background-color 0.2s ease;
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        input:focus {
          outline: none;
          background-color: rgba(255, 255, 255, 0.3) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
        
        .table-body::-webkit-scrollbar {
          width: 0.5vw;
        }
        
        .table-body::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        .table-body::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 1vw;
        }
        
        .table-body::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

// Icons components
const SearchIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const DownloadIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const FileTextIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const EyeIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const CameraIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const UploadIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const styles = {
  container: {
    height: '100%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '.5vw'
  },
  card: {
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    width: '100%',
    height: "100%"
  },
  header: {
    background: '#046307',
    padding: '1.5vw 3vw',
    color: '#f8fafc',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1.5vw',
  },
  headerTitle: {
    display: 'flex',
    flexDirection: 'column',
  },
  h1: {
    fontSize: '2vw',
    fontWeight: 700,
    marginBottom: '0.5vw',
  },
  headerSubtitle: {
    fontSize: '1vw',
    opacity: 0.9,
  },
  headerActions: {
    display: 'flex',
    gap: '1vw',
    flexWrap: 'wrap',
  },
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '1vw',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '1vw',
    height: '1vw',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  searchInput: {
    padding: '0.6vw 1vw 0.6vw 2.5vw',
    width: '30vw',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0.6vw',
    color: 'white',
    fontSize: '0.9vw',
    transition: 'all 0.2s ease',
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5vw',
    padding: '0.6vw 2vw',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '0.9vw',
    fontWeight: 500,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0.6vw',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnIcon: {
    width: '1vw',
    height: '1vw',
  },
  stats: {
    marginTop: '1vw',
    paddingTop: '1vw',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  },
  statsText: {
    fontSize: '1vw',
  },
  statsValue: {
    fontWeight: 600,
    opacity: 1,
  },
  tableContainer: {
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '0.5fr 1fr 1.5fr 1.5fr 1fr 0.5fr 0.5fr',
    gap: '1vw',
    padding: '0 2vw',
  },
  headerCell: {
    paddingTop: '1.2vw',
    paddingBottom: '1.2vw',
    fontSize: '1vw',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#475569',
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableBody: {
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  dataRow: {
    display: 'grid',
    gridTemplateColumns: '0.5fr 1fr 1.5fr 1.5fr 1fr 0.5fr 0.5fr',
    gap: '1vw',
    padding: '1vw 2vw',
    borderBottom: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  cellId: {},
  cellZone: {},
  cellArea: {},
  cellSubmitted: {},
  cellHissa: {},
  cellReceipt: {},
  cellActions: {},
  idText: {
    fontSize: '1vw',
    fontWeight: 700,
    color: '#046307',
  },
  zoneText: {
    fontSize: '1vw',
    fontWeight: 500,
  },
  areaText: {
    fontSize: '1vw',
  },
  submittedText: {
    fontSize: '1vw',
    fontWeight: 500,
  },
  hissaContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3vw',
  },
  hissaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.3vw 0.8vw',
    backgroundColor: 'rgba(4, 99, 7, 0.1)',
    color: '#046307',
    fontWeight: 500,
    borderRadius: '2vw',
    fontSize: '1vw',
  },
  hissaStatus: {
    fontSize: '0.8vw',
    color: '#64748b',
  },
  btn: {
    width: '2.2vw',
    height: '2.2vw',
    borderRadius: '0.5vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    backgroundColor: '#046307',
    color: 'white',
  },
  btnSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  btnDisabled: {
    backgroundColor: '#94a3b8',
    color: '#e2e8f0',
    cursor: 'not-allowed',
    opacity: 0.7,
    transform: 'none !important',
    boxShadow: 'none !important',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6vw 0',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '4vw',
    height: '4vw',
    backgroundColor: '#f1f5f9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1vw',
  },
  emptyIconSvg: {
    width: '2vw',
    height: '2vw',
    color: '#94a3b8',
  },
  emptyTitle: {
    fontSize: '1.2vw',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '0.5vw',
  },
  emptyText: {
    fontSize: '0.9vw',
    color: '#475569',
  },
  
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '0.5vw',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    width: '80%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
  },
  modalHeader: {
    padding: '1.5vw',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: '1.5vw',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2vw',
    fontWeight: 300,
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.5vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5vw',
    height: '2.5vw',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  modalBody: {
    padding: '1.5vw',
  },
  
  // Eye modal specific styles
  recordDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1vw',
    marginBottom: '2vw',
    padding: '1vw',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5vw',
  },
  recordItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5vw',
  },
  recordLabel: {
    fontSize: '0.9vw',
    color: '#64748b',
    fontWeight: 500,
  },
  recordValue: {
    fontSize: '1.1vw',
    color: '#1e293b',
    fontWeight: 600,
  },
  recordTable: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.5vw',
    overflow: 'hidden',
  },
  recordTableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  recordTableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 2fr 1.5fr 1fr',
    gap: '1vw',
    padding: '1vw',
    borderBottom: '1px solid #e2e8f0',
  },
  recordTableCell: {
    fontSize: '1vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recordTableBody: {
    maxHeight: '50vh',
    overflowY: 'auto',
  },
  
  // Receipt modal specific styles
  shareStatusContainer: {
    marginBottom: '2vw',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5vw',
    overflow: 'hidden',
  },
  shareStatusHeader: {
    backgroundColor: '#046307',
    color: 'white',
    padding: '0.8vw 1.5vw',
    fontSize: '1.2vw',
    fontWeight: 600,
  },
  shareStatusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1vw',
    padding: '1.5vw',
    backgroundColor: '#f8fafc',
  },
  shareStatusItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5vw',
  },
  shareStatusLabel: {
    fontSize: '0.9vw',
    color: '#64748b',
    fontWeight: 500,
  },
  shareStatusValue: {
    fontSize: '1.5vw',
    color: '#1e293b',
    fontWeight: 700,
  },
  
  financialSummaryContainer: {
    marginBottom: '2vw',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5vw',
    overflow: 'hidden',
  },
  financialSummaryHeader: {
    backgroundColor: '#046307',
    color: 'white',
    padding: '0.8vw 1.5vw',
    fontSize: '1.2vw',
    fontWeight: 600,
  },
  financialSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1vw',
    padding: '1.5vw',
    backgroundColor: '#f8fafc',
  },
  financialSummaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5vw',
  },
  financialSummaryLabel: {
    fontSize: '0.9vw',
    color: '#64748b',
    fontWeight: 500,
  },
  financialSummaryValue: {
    fontSize: '1.5vw',
    color: '#1e293b',
    fontWeight: 700,
  },
  
  receiptSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5vw',
    marginBottom: '2vw',
    padding: '1vw',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5vw',
  },
  receiptSummaryItem: {
    fontSize: '1vw',
    color: '#1e293b',
    fontWeight: 500,
  },
  receiptForm: {
    marginBottom: '2vw',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5vw',
    marginBottom: '2vw',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5vw',
  },
  formLabel: {
    fontSize: '0.9vw',
    color: '#64748b',
    fontWeight: 500,
  },
  formInput: {
    padding: '0.8vw 1vw',
    border: '1px solid #e2e8f0',
    borderRadius: '0.4vw',
    fontSize: '1vw',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
  },
  formHint: {
    fontSize: '0.8vw',
    color: '#64748b',
    marginTop: '0.3vw',
  },
  requiredField: {
    color: '#e11d48',
    fontWeight: 'bold',
  },
  inputError: {
    border: '1px solid #e11d48',
    backgroundColor: 'rgba(225, 29, 72, 0.05)',
  },
  errorMessage: {
    color: '#e11d48',
    fontSize: '0.8vw',
    marginTop: '0.3vw',
  },
  imageUploadSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1vw',
    marginBottom: '2vw',
  },
  imagePreview: {
    width: '15vw',
    height: '15vw',
    border: '2px dashed #e2e8f0',
    borderRadius: '0.5vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePreviewError: {
    border: '2px dashed #e11d48',
    backgroundColor: 'rgba(225, 29, 72, 0.05)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholderImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc',
    gap: '1vw',
  },
  imageRequiredText: {
    fontSize: '0.9vw',
    color: '#64748b',
  },
  cameraIconLarge: {
    width: '3vw',
    height: '3vw',
    color: '#94a3b8',
  },
  imageActions: {
    display: 'flex',
    gap: '1vw',
  },
  imageButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5vw',
    padding: '0.8vw 1.5vw',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '0.4vw',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cameraButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5vw',
    padding: '0.8vw 1.5vw',
    backgroundColor: '#046307',
    color: 'white',
    borderRadius: '0.4vw',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonText: {
    fontSize: '0.9vw',
    fontWeight: 500,
  },
  formActions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2vw',
  },
  submitButton: {
    padding: '0.8vw 2vw',
    backgroundColor: '#046307',
    color: 'white',
    fontSize: '1vw',
    fontWeight: 500,
    border: 'none',
    borderRadius: '0.4vw',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  transactionLogSection: {
    marginTop: '3vw',
  },
  sectionTitle: {
    fontSize: '1.2vw',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '1vw',
  },
  transactionTable: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.5vw',
    overflow: 'hidden',
  },
  transactionTableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  transactionTableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1.5fr 1.5fr',
    gap: '1vw',
    padding: '1vw',
    borderBottom: '1px solid #e2e8f0',
  },
  transactionTableCell: {
    fontSize: '1vw',
    display: 'flex',
    alignItems: 'center',
  },
  transactionTableBody: {
    maxHeight: '30vh',
    overflowY: 'auto',
  },
};

export default DataTable;
