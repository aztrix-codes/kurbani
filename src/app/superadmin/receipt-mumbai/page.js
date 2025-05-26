'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const DataTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [areasList, setAreasList] = useState([]);
  const [users, setUsers] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [receipts, setReceipts] = useState([]);
  
  // Modal states
  const [showEyeModal, setShowEyeModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  
  // Receipt form states
  const [amountPerShare, setAmountPerShare] = useState(Math.ceil(4300 / 7));
  const [howMuchPaying, setHowMuchPaying] = useState(0);
  const [paidBy, setPaidBy] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [userViewDetail, setUserViewDetail] = useState(null);
  
  // Admin data state for cost per share
  const [adminData, setAdminData] = useState({
    m_a_cost: Math.ceil(4300 / 7),
    oom_a_cost: Math.ceil(4000 / 7)
  });
  
  // Transaction logs storage - key is the row ID, value is the array of transactions
  const [allTransactionLogs, setAllTransactionLogs] = useState({});
  
  // Current transaction log for the selected row
  const [currentTransactionLog, setCurrentTransactionLog] = useState([]);
  
  // Fetch admin data for cost per share
  const fetchAdminData = async () => {
    try {
      const response = await axios.get('/api/superadmin', {
        params: { name: 'superadmin', password: 'super123' }
      });
      if (response.data.success) {
        setAdminData({
          m_a_cost: Math.ceil(parseFloat(response.data.data.m_a_cost) / 7),
          oom_a_cost: Math.ceil(parseFloat(response.data.data.oom_a_cost) / 7)
        });
        // Update amount per share with the m_a_cost from admin data
        setAmountPerShare(Math.ceil(parseFloat(response.data.data.m_a_cost / 7)));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const fetchReceipts = async () => {
    try {
      const response = await axios.get(`/api/receipt?user_id=6`);
      setReceipts(response.data);
      console.log(response.data)
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  };

  // Update payment status for multiple customers
  const updatePaymentStatus = async (customerIds) => {
    try {
      const response = await axios.patch('/api/customers?bulk=true&type=payment_status', {
        customer_ids: customerIds
      });
      
      if (response.data.success) {
        console.log(`Payment status updated for ${response.data.updated_count} customers`);
        return true;
      } else {
        console.error('Failed to update payment status:', response.data.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  };

  const createReceipt = async (receiptData) => {
    try {
      // Validate required fields - removing image_url from required fields
      const requiredFields = [
        'user_id', 'zone', 'area', 'purpose',
        'paid_by', 'received_by', 'subtotal',
        'net_total', 'rate', 'quantity'
      ];
      
      // Check for missing fields
      const missingFields = requiredFields.filter(field => {
        return receiptData[field] === undefined || receiptData[field] === null || 
               (typeof receiptData[field] === 'string' && receiptData[field].trim() === '');
      });
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Ensure numeric fields are numbers, not strings
      const numericFields = ['subtotal', 'net_total', 'rate', 'quantity'];
      numericFields.forEach(field => {
        if (typeof receiptData[field] === 'string') {
          receiptData[field] = parseFloat(receiptData[field]);
        }
      });
      
      // Ensure user_id is a number
      if (typeof receiptData.user_id === 'string') {
        receiptData.user_id = parseInt(receiptData.user_id, 10);
      }
      
      console.log('Sending receipt data:', JSON.stringify(receiptData));
      
      const response = await axios.post('/api/receipt', receiptData);
      console.log('Receipt creation response:', response.data);
      
      // Refresh the receipts list after creation
      await fetchReceipts();
      return response.data;
    } catch (err) {
      console.error('Error creating receipt:', err);
      const errorMsg = err.response?.data?.error || err.message;
      throw new Error(errorMsg);
    }
  };

  // Fetch areas from API
  const fetchAreas = async () => {
    try {
      const response = await axios.get('/api/areas');
      setAreasList(response.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
      alert('Failed to fetch areas');
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
    fetchReceipts();
    fetchAdminData(); // Fetch admin data on component mount
    const interval = setInterval(() => {
      fetchAreas();
      fetchCustomerData();
      fetchUsers();
      fetchReceipts();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to round up to the nearest whole number
  const roundUp = (num) => {
    return Math.ceil(num);
  };

  // Helper function to get zone name from area name
  const getZoneNameFromArea = (areaName) => {
    const matchedArea = areasList.find(area => area.area_name === areaName);
    return matchedArea ? matchedArea.zone_name : 'Mumbai';
  };

  // Handle opening eye modal
  const handleEyeClick = (rowId, rowData, item) => {
    setSelectedRowId(rowId);
    setSelectedRowData(rowData);
    setUserViewDetail(item);
    setShowEyeModal(true);
  };

  // Handle opening receipt modal
  const handleReceiptClick = (rowId, rowData, item) => {
    fetchReceipts();
    fetchAdminData(); // Refresh admin data when opening receipt modal
    setSelectedRowId(rowId);
    setSelectedRowData(rowData);
    setUserViewDetail(item); // Set userViewDetail with the user object
    
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
    setUserViewDetail(null);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedRowId(null);
    setSelectedRowData(null);
    setUserViewDetail(null);
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
    
    // Calculate total shares, paid shares, and pending shares using the provided filtering logic
    const totalShares = selectedRowData?.length || 0;
    const sharesPaid = selectedRowData ? selectedRowData.filter(customer => customer.payment_status === 1).length : 0;
    const pendingShares = totalShares - sharesPaid;
    
    if (howMuchPaying <= 0) {
      errors.howMuchPaying = "Please enter a valid number of shares to pay for";
    }
    
    if (howMuchPaying > pendingShares) {
      errors.howMuchPaying = `Cannot exceed pending shares (${pendingShares})`;
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
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Calculate the amount with rounding up
      const amount = roundUp(howMuchPaying * amountPerShare);
      
      // Get area from userViewDetail
      const area = userViewDetail?.area_name || 'N/A';
      
      // Get zone from areasList using area name
      const zone = getZoneNameFromArea(area);
      
      console.log("Using area:", area, "and zone:", zone);
      
      // Get current year for Qurbani purpose
      const currentYear = new Date().getFullYear();
      const purpose = `Qurbani (${currentYear})`;
      
      // Prepare receipt data - REMOVED image_url field
      const receiptData = {
        user_id: parseInt(userViewDetail?.user_id || 6, 10),
        zone: zone,
        area: area,
        purpose: purpose,
        paid_by: paidBy.trim(),
        received_by: collectedBy.trim(),
        subtotal: parseFloat(amount),
        net_total: parseFloat(amount),
        rate: parseFloat(amountPerShare),
        quantity: parseInt(howMuchPaying, 10)
      };
      
      console.log("Receipt data being sent:", receiptData);
      
      // Create receipt
      await createReceipt(receiptData);
      
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
      
      // Get the IDs of customers who haven't paid yet (payment_status === 0)
      const unpaidCustomers = selectedRowData.filter(customer => customer.payment_status === 0);
      
      // Take only the number of customers being paid for (howMuchPaying)
      const customersToUpdate = unpaidCustomers.slice(0, howMuchPaying);
      
      // Extract the IDs
      const customerIdsToUpdate = customersToUpdate.map(customer => customer.id);
      
      // Update their payment status
      if (customerIdsToUpdate.length > 0) {
        const updated = await updatePaymentStatus(customerIdsToUpdate);
        if (updated) {
          console.log(`Successfully updated payment status for ${customerIdsToUpdate.length} customers`);
          
          // Refresh customer data to reflect the updated payment status
          await fetchCustomerData();
        }
      }
      
      // Reset form
      setHowMuchPaying(0);
      setPaidBy('');
      setCollectedBy('');
      setSelectedImage(null);
      setFormErrors({});
      
      // Show success message
      alert(`Payment of ${amount} INR for ${howMuchPaying} shares recorded successfully!`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}`);
    }
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
              <h1 style={styles.h1}>Generate Receipt - Mumbai</h1>
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
              Total Records: <span style={styles.statsValue}>{users.length}</span>
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
                customer.user_id == item.user_id && customer.zone === "Mumbai" && customer.status === 1
              );
              // Calculate total hissa (count of filtered records)
              const totalHissa = userCustomerData.length;
              
              // Calculate shares paid (count of records with payment_status: 1)
              const sharesPaid = userCustomerData.filter(customer => customer.payment_status === 1).length;
              
              // Find the zone_name from areasList based on matching area_name
              const zoneName = getZoneNameFromArea(item.area_name);

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
                      onClick={() => handleReceiptClick(item.id, userCustomerData, item)}
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
                <span style={styles.recordValue}>{getZoneNameFromArea(userViewDetail?.area_name)}</span>
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
              <h2 style={styles.modalTitle}>Receipt Records</h2>
              <button style={styles.closeButton} onClick={closeReceiptModal}>×</button>
            </div>
            <div style={styles.modalBody}>
              {/* Debug Info - Can be removed after testing */}
              <div style={{padding: '10px', margin: '10px 0', backgroundColor: '#f0f9ff', borderRadius: '5px'}}>
                <p><strong>Debug Info:</strong></p>
                <p>Area: {userViewDetail?.area_name || 'N/A'}</p>
                <p>Zone: {getZoneNameFromArea(userViewDetail?.area_name)}</p>
              </div>
              
              {/* Form Section */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>Add New Receipt</h3>
                <form onSubmit={handleFormSubmit}>
                  <div style={styles.formGrid}>
                    {/* Calculate values using the provided filtering logic */}
                    {(() => {
                      const totalShares = selectedRowData?.length || 0;
                      const sharesPaid = selectedRowData ? selectedRowData.filter(customer => customer.payment_status === 1).length : 0;
                      const pendingShares = totalShares - sharesPaid;
                      const totalAmount = roundUp(totalShares * amountPerShare);
                      const pendingAmount = roundUp(pendingShares * amountPerShare);
                      const payingAmount = roundUp(howMuchPaying * amountPerShare);
                      
                      return (
                        <>
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Total Shares</label>
                            <input 
                              type="text" 
                              value={totalShares} 
                              readOnly 
                              style={styles.formInput} 
                            />
                          </div>
                          
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Amount Per Share</label>
                            <input 
                              type="number" 
                              value={amountPerShare} 
                              readOnly
                              style={styles.formInput} 
                            />
                          </div>
                          
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Total Amount</label>
                            <input 
                              type="text" 
                              value={totalAmount || 0} 
                              readOnly 
                              style={styles.formInput} 
                            />
                          </div>
                          
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Paid Shares</label>
                            <input 
                              type="text" 
                              value={sharesPaid || 0} 
                              readOnly 
                              style={styles.formInput} 
                            />
                          </div>
                          
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Pending Shares</label>
                            <input 
                              type="text" 
                              value={pendingShares || 0} 
                              readOnly 
                              style={styles.formInput} 
                            />
                          </div>
                          
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Pending Amount</label>
                            <input 
                              type="text" 
                              value={pendingAmount || 0} 
                              readOnly 
                              style={styles.formInput} 
                            />
                          </div>
                          
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Paying Count <span style={styles.requiredField}>*</span></label>
                            <input 
                              type="number" 
                              value={howMuchPaying} 
                              onChange={(e) => {
                                const value = Math.min(
                                  pendingShares, 
                                  Math.max(0, Number(e.target.value))
                                );
                                setHowMuchPaying(value);
                                setFormErrors({...formErrors, howMuchPaying: null});
                              }} 
                              max={pendingShares}
                              min={0}
                              style={{
                                ...styles.formInput,
                                ...(formErrors.howMuchPaying ? styles.inputError : {}),
                                ...(pendingShares <= 0 ? styles.inputDisabled : {})
                              }} 
                              disabled={pendingShares <= 0}
                              required
                            />
                            {formErrors.howMuchPaying && (
                              <div style={styles.errorMessage}>{formErrors.howMuchPaying}</div>
                            )}
                          </div>
                          
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Paying Amount</label>
                            <input 
                              type="text" 
                              value={payingAmount || 0} 
                              readOnly 
                              style={styles.formInput} 
                            />
                          </div>
                          
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Paid By <span style={styles.requiredField}>*</span></label>
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
                            <label style={styles.formLabel}>Collected By <span style={styles.requiredField}>*</span></label>
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
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Image Upload Section */}
                  <div style={styles.imageSection}>
                    <div style={styles.imageUploadContainer}>
                      <div style={styles.imagePreviewContainer}>
                        {selectedImage ? (
                          <img 
                            src={selectedImage} 
                            alt="Receipt" 
                            style={styles.imagePreview} 
                          />
                        ) : (
                          <div style={styles.noImagePlaceholder}>
                            <ImageIcon style={styles.noImageIcon} />
                            <p style={styles.noImageText}>No image selected</p>
                          </div>
                        )}
                      </div>
                      
                      <div style={styles.imageUploadActions}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageSelect}
                          ref={cameraInputRef}
                          style={{ display: 'none' }}
                        />
                        
                        <button 
                          type="button" 
                          onClick={handleFileUpload}
                          style={styles.imageUploadBtn}
                        >
                          <UploadIcon style={styles.btnIcon} />
                          Upload Image
                        </button>
                        
                        <button 
                          type="button" 
                          onClick={handleCameraCapture}
                          style={styles.imageUploadBtn}
                        >
                          <CameraIcon style={styles.btnIcon} />
                          Take Photo
                        </button>
                      </div>
                      
                      {formErrors.image && (
                        <div style={{...styles.errorMessage, textAlign: 'center', marginTop: '0.5vw'}}>
                          {formErrors.image}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div style={styles.formActions}>
                    <button 
                      type="submit" 
                      style={{
                        ...styles.submitBtn,
                        ...(pendingShares <= 0 ? styles.submitBtnDisabled : {})
                      }}
                      disabled={pendingShares <= 0}
                    >
                      Submit Receipt
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Transaction Log Section */}
              <div style={styles.transactionSection}>
                <h3 style={styles.sectionTitle}>Transaction History</h3>
                
                {currentTransactionLog.length > 0 ? (
                  <div style={styles.transactionList}>
                    {currentTransactionLog.map((transaction, index) => (
                      <div key={index} style={styles.transactionCard}>
                        <div style={styles.transactionHeader}>
                          <div style={styles.transactionDate}>{transaction.date}</div>
                          <div style={styles.transactionAmount}>₹{transaction.amount}</div>
                        </div>
                        
                        <div style={styles.transactionDetails}>
                          <div style={styles.transactionItem}>
                            <span style={styles.transactionLabel}>Shares:</span>
                            <span style={styles.transactionValue}>{transaction.shares}</span>
                          </div>
                          
                          <div style={styles.transactionItem}>
                            <span style={styles.transactionLabel}>Paid By:</span>
                            <span style={styles.transactionValue}>{transaction.paidBy}</span>
                          </div>
                          
                          <div style={styles.transactionItem}>
                            <span style={styles.transactionLabel}>Collected By:</span>
                            <span style={styles.transactionValue}>{transaction.collectedBy}</span>
                          </div>
                        </div>
                        
                        <div style={styles.transactionImageContainer}>
                          <img 
                            src={transaction.image} 
                            alt="Receipt" 
                            style={styles.transactionImage} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.noTransactionsMessage}>
                    No transactions recorded yet.
                  </div>
                )}
              </div>
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

const EyeIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
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

const ImageIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const UploadIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const CameraIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
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
    gridTemplateColumns: '0.5fr 1fr 1fr 1fr 1fr 0.5fr 0.5fr',
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
  },
  tableBody: {
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  dataRow: {
    display: 'grid',
    gridTemplateColumns: '0.5fr 1fr 1fr 1fr 1fr 0.5fr 0.5fr',
    gap: '1vw',
    padding: '1vw 2vw',
    borderBottom: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  cellId: {
    justifyContent: 'center',
  },
  cellZone: {
    justifyContent: 'center',
  },
  cellArea: {
    justifyContent: 'center',
  },
  cellSubmitted: {
    justifyContent: 'center',
  },
  cellHissa: {
    justifyContent: 'center',
  },
  cellReceipt: {
    justifyContent: 'center',
  },
  cellActions: {
    justifyContent: 'center',
  },
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
  },
  hissaContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hissaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.3vw 0.8vw',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    fontWeight: 600,
    borderRadius: '2vw',
    fontSize: '0.9vw',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5vw',
    height: '2.5vw',
    borderRadius: '0.5vw',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  btnSecondary: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
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
    borderRadius: '0.8vw',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '80vw',
    maxWidth: '1200px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '1.5vw',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.5vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.4vw',
    transition: 'all 0.2s ease',
  },
  modalBody: {
    padding: '1.5vw',
    overflowY: 'auto',
    maxHeight: 'calc(90vh - 4vw)',
  },
  recordDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20vw, 1fr))',
    gap: '1vw',
    marginBottom: '2vw',
  },
  recordItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3vw',
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
    borderRadius: '0.6vw',
    overflow: 'hidden',
  },
  recordTableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  recordTableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    gap: '1vw',
    padding: '1vw',
    borderBottom: '1px solid #e2e8f0',
  },
  recordTableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    gap: '1vw',
    padding: '1vw',
    borderBottom: '1px solid #e2e8f0',
  },
  recordTableCell: {
    fontSize: '1vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordTableBody: {
    maxHeight: '30vw',
    overflowY: 'auto',
  },
  formSection: {
    marginBottom: '2vw',
    padding: '1.5vw',
    backgroundColor: '#f8fafc',
    borderRadius: '0.6vw',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '1.2vw',
    fontWeight: 600,
    color: '#1e293b',
    marginTop: 0,
    marginBottom: '1.5vw',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(15vw, 1fr))',
    gap: '1.5vw',
    marginBottom: '1.5vw',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5vw',
  },
  formLabel: {
    fontSize: '0.9vw',
    color: '#475569',
    fontWeight: 500,
  },
  formInput: {
    padding: '0.8vw 1vw',
    backgroundColor: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: '0.4vw',
    fontSize: '1vw',
    color: '#1e293b',
    transition: 'all 0.2s ease',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },
  errorMessage: {
    fontSize: '0.8vw',
    color: '#ef4444',
    marginTop: '0.3vw',
  },
  requiredField: {
    color: '#ef4444',
  },
  imageSection: {
    marginBottom: '1.5vw',
  },
  imageUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1vw',
  },
  imagePreviewContainer: {
    width: '100%',
    height: '20vw',
    border: '1px dashed #cbd5e1',
    borderRadius: '0.6vw',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  noImagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1vw',
  },
  noImageIcon: {
    width: '3vw',
    height: '3vw',
    color: '#94a3b8',
  },
  noImageText: {
    fontSize: '1vw',
    color: '#64748b',
  },
  imageUploadActions: {
    display: 'flex',
    gap: '1vw',
  },
  imageUploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5vw',
    padding: '0.8vw 1.5vw',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '0.9vw',
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    borderRadius: '0.4vw',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5vw',
  },
  submitBtn: {
    padding: '1vw 3vw',
    backgroundColor: '#046307',
    color: 'white',
    fontSize: '1vw',
    fontWeight: 600,
    border: 'none',
    borderRadius: '0.4vw',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
    transform: 'none !important',
    boxShadow: 'none !important',
  },
  transactionSection: {
    marginTop: '2vw',
  },
  transactionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1vw',
  },
  transactionCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.6vw',
    overflow: 'hidden',
  },
  transactionHeader: {
    padding: '1vw',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: '0.9vw',
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: '1.1vw',
    fontWeight: 600,
    color: '#046307',
  },
  transactionDetails: {
    padding: '1vw',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1vw',
  },
  transactionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3vw',
  },
  transactionLabel: {
    fontSize: '0.8vw',
    color: '#64748b',
  },
  transactionValue: {
    fontSize: '0.9vw',
    color: '#1e293b',
    fontWeight: 500,
  },
  transactionImageContainer: {
    padding: '1vw',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'center',
  },
  transactionImage: {
    maxWidth: '100%',
    maxHeight: '15vw',
    objectFit: 'contain',
    borderRadius: '0.4vw',
  },
  noTransactionsMessage: {
    padding: '3vw',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '1vw',
    backgroundColor: '#f8fafc',
    borderRadius: '0.6vw',
    border: '1px solid #e2e8f0',
  },
};

export default DataTable;
