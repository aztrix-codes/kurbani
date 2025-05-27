'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const DataTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [areasList, setAreasList] = useState([]);
  const [users, setUsers] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [userID, setUserID] = useState(0)
  
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
      const response = await axios.get(`/api/receipt?user_id=${userID}`);
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

  // Helper function to get zone name from area name - consistent across the component
  const getZoneNameFromArea = (areaName) => {
    if (!areaName) return 'N/A';
    const matchedArea = areasList.find(area => area.area_name === areaName);
    return matchedArea ? matchedArea.zone_name : 'Mumbai';
  };

  // Handle opening eye modal
  const handleEyeClick = (rowId, rowData, item) => {
    console.log("Eye click - item:", item);
    setSelectedRowId(rowId);
    setSelectedRowData(rowData);
    setUserViewDetail(item);
    setShowEyeModal(true);
  };

  // Handle opening receipt modal
  const handleReceiptClick = (rowId, rowData, item) => {
    setUserID(item.user_id)
    fetchReceipts();
    fetchAdminData(); // Refresh admin data when opening receipt modal
    setSelectedRowId(rowId);
    setSelectedRowData(rowData);
    setUserViewDetail(item);
    
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
      // Calculate total shares, paid shares, and pending shares
      const totalShares = selectedRowData?.length || 0;
      const sharesPaid = selectedRowData ? selectedRowData.filter(customer => customer.payment_status === 1).length : 0;
      const pendingShares = totalShares - sharesPaid;
      
      // Calculate the amount with rounding up
      const amount = roundUp(howMuchPaying * amountPerShare);
      
      // Get area directly from userViewDetail
      const area = userViewDetail?.area_name;
      
      // Get zone directly from userViewDetail's area using areasList
      const zone = getZoneNameFromArea(area);
      
      console.log("Receipt submission - userViewDetail:", userViewDetail);
      console.log("Receipt submission - area:", area);
      console.log("Receipt submission - zone:", zone);
      
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
      
      console.log('Receipt data being sent:', receiptData);
      
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

  const filteredData = users
  .filter(item => item.mumbai === 1)
  .filter(item => 
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
              {/* <button 
                onClick={exportToExcel}
                style={styles.exportBtn}
              >
                <DownloadIcon style={styles.btnIcon} />
                Export
              </button> */}
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
                <span style={styles.recordValue}>
                  {getZoneNameFromArea(userViewDetail?.area_name)}
                </span>
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
              {/* Form Section */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>Add New Receipt</h3>
                <form onSubmit={handleFormSubmit}>
                  <div style={styles.formGrid}>
                    {(() => {
                      // Define all share variables in this scope to ensure they're available
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
                                ...(formErrors.howMuchPaying ? styles.inputError : {})
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
                    
                    <div style={styles.imageActions}>
                      {formErrors.image && (
                        <div style={styles.errorMessage}>{formErrors.image}</div>
                      )}
                      
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
                        Upload Image
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={handleCameraCapture} 
                        style={styles.cameraButton}
                      >
                        <CameraIcon style={styles.btnIcon} />
                        Take Photo
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.formActions}>
                    {(() => {
                      const pendingShares = selectedRowData ? 
                        (selectedRowData.length - selectedRowData.filter(customer => customer.payment_status === 1).length) : 0;
                      
                      return (
                        <button 
                          type="submit" 
                          style={{
                            ...styles.submitButton,
                            ...(pendingShares <= 0 ? styles.btnDisabled : {})
                          }}
                          disabled={pendingShares <= 0}
                        >
                          Submit Payment
                        </button>
                      );
                    })()}
                  </div>
                </form>
              </div>
              
              {/* Excel-like Table for Receipt Records */}
              <div style={styles.receiptTableContainer}>
                {/* Fixed Header */}
                <div style={styles.receiptTableHeader}>
                  <div style={styles.receiptTableRow}>
                    <div style={styles.receiptTableHeaderCell}>ID</div>
                    <div style={styles.receiptTableHeaderCell}>Zone</div>
                    <div style={styles.receiptTableHeaderCell}>Area</div>
                    <div style={styles.receiptTableHeaderCell}>Purpose</div>
                    <div style={styles.receiptTableHeaderCell}>Paid By</div>
                    <div style={styles.receiptTableHeaderCell}>Received By</div>
                    <div style={styles.receiptTableHeaderCell}>Subtotal</div>
                    <div style={styles.receiptTableHeaderCell}>Net Total</div>
                    <div style={styles.receiptTableHeaderCell}>Rate</div>
                    <div style={styles.receiptTableHeaderCell}>Quantity</div>
                    <div style={styles.receiptTableHeaderCell}>Created Date</div>
                  </div>
                </div>
                
                {/* Scrollable Body */}
                <div style={styles.receiptTableBody} className="tableBody">
                  {receipts && receipts.length > 0 ? (
                    receipts.map((receipt, index) => (
                      <div key={index} style={styles.receiptTableRow}>
                        <div style={styles.receiptTableCell}>{receipt.id}</div>
                        <div style={styles.receiptTableCell}>{receipt.zone}</div>
                        <div style={styles.receiptTableCell}>{receipt.area}</div>
                        <div style={styles.receiptTableCell}>{receipt.purpose}</div>
                        <div style={styles.receiptTableCell}>{receipt.paid_by}</div>
                        <div style={styles.receiptTableCell}>{receipt.received_by}</div>
                        <div style={styles.receiptTableCell}>{receipt.subtotal}</div>
                        <div style={styles.receiptTableCell}>{receipt.net_total}</div>
                        <div style={styles.receiptTableCell}>{receipt.rate}</div>
                        <div style={styles.receiptTableCell}>{receipt.quantity}</div>
                        <div style={styles.receiptTableCell}>
                          {new Date(receipt.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={styles.noData}>No receipt records found</div>
                  )}
                </div>
                
                {/* Fixed Footer with Totals */}
                <div style={styles.receiptTableFooter}>
                  <div style={styles.receiptTableRow}>
                    <div style={styles.receiptTableFooterCell} colSpan="6">Totals:</div>
                    <div style={styles.receiptTableFooterCell}>
                      {receipts && receipts.length > 0 
                        ? receipts.reduce((sum, receipt) => sum + parseFloat(receipt.subtotal || 0), 0).toFixed(2) 
                        : '0.00'}
                    </div>
                    <div style={styles.receiptTableFooterCell}>
                      {receipts && receipts.length > 0 
                        ? receipts.reduce((sum, receipt) => sum + parseFloat(receipt.net_total || 0), 0).toFixed(2) 
                        : '0.00'}
                    </div>
                    <div style={styles.receiptTableFooterCell}>-</div>
                    <div style={styles.receiptTableFooterCell}>
                      {receipts && receipts.length > 0 
                        ? receipts.reduce((sum, receipt) => sum + parseFloat(receipt.quantity || 0), 0).toFixed(2) 
                        : '0.00'}
                    </div>
                    <div style={styles.receiptTableFooterCell}>Records: {receipts?.length || 0}</div>
                  </div>
                </div>
              </div>
              
              {/* Transaction History */}
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
    </div>
  );
};

// Icons
const SearchIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const DownloadIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const FileTextIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const EyeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const CameraIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const UploadIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

// Styles
const styles = {
  container: {
    padding: '1vw',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    boxShadow: '0 0.2vw 0.5vw rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
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
    overflowX: 'auto',
  },
  tableHeader: {
    backgroundColor: '#f7fafc',
    borderBottom: '0.1vw solid #edf2f7',
  },
  tableRow: {
    display: 'flex',
    borderBottom: '0.1vw solid #edf2f7',
  },
  headerCell: {
    fontWeight: '600',
    color: '#4a5568',
    fontSize: '0.9vw',
  },
  tableCell: {
    padding: '1.2vw 1.5vw',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1vw',
    color: '#4a5568',
  },
  cellId: {
    flex: '0 0 5%',
  },
  cellZone: {
    flex: '0 0 15%',
  },
  cellArea: {
    flex: '0 0 20%',
  },
  cellSubmitted: {
    flex: '0 0 25%',
  },
  cellHissa: {
    flex: '0 0 15%',
    display: 'flex',
    justifyContent: 'center'
  },
  cellReceipt: {
    flex: '0 0 10%',
    justifyContent: 'center',
  },
  cellActions: {
    flex: '0 0 10%',
    justifyContent: 'center',
  },
  tableBody: {
    maxHeight: '50vh',
    overflowY: 'auto',
  },
  dataRow: {
    display: 'flex',
    borderBottom: '0.1vw solid #edf2f7',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#f7fafc',
    }
  },
  idText: {
    fontWeight: 600,
    color: '#2d3748',
  },
  zoneText: {
    color: '#4a5568',
  },
  areaText: {
    color: '#4a5568',
  },
  submittedText: {
    color: '#4a5568',
  },
  hissaContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  hissaBadge: {
    backgroundColor: '#e6fffa',
    color: '#047481',
    padding: '0.3vw 0.8vw',
    borderRadius: '1vw',
    fontSize: '0.8vw',
    fontWeight: 600,
  },
  btn: {
    width: '2.5vw',
    height: '2.5vw',
    borderRadius: '0.4vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    backgroundColor: '#e6fffa',
    color: '#047481',
  },
  btnSecondary: {
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
  },
  emptyState: {
    padding: '5vw 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: '4vw',
    height: '4vw',
    backgroundColor: '#f7fafc',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1vw',
  },
  emptyIconSvg: {
    width: '2vw',
    height: '2vw',
    color: '#a0aec0',
  },
  emptyTitle: {
    fontSize: '1.2vw',
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: '0.5vw',
  },
  emptyText: {
    fontSize: '1vw',
    color: '#718096',
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
    borderRadius: '0.6vw',
    boxShadow: '0 0.5vw 1vw rgba(0, 0, 0, 0.1)',
    width: '80vw',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '1.5vw',
    borderBottom: '0.1vw solid #edf2f7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '1.5vw',
    fontWeight: 600,
    color: '#2d3748',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2vw',
    color: '#a0aec0',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '1.5vw',
    overflowY: 'auto',
    maxHeight: 'calc(90vh - 5vw)',
  },
  recordDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20vw, 1fr))',
    gap: '1.5vw',
    marginBottom: '2vw',
  },
  recordItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5vw',
  },
  recordLabel: {
    fontSize: '0.9vw',
    color: '#718096',
  },
  recordValue: {
    fontSize: '1.1vw',
    fontWeight: 600,
    color: '#2d3748',
  },
  recordTable: {
    border: '0.1vw solid #edf2f7',
    borderRadius: '0.6vw',
    overflow: 'hidden',
  },
  recordTableHeader: {
    backgroundColor: '#f7fafc',
    borderBottom: '0.1vw solid #edf2f7',
  },
  recordTableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    borderBottom: '0.1vw solid #edf2f7',
  },
  recordTableCell: {
    padding: '1vw',
    fontSize: '0.9vw',
    color: '#4a5568',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  recordTableBody: {
    maxHeight: '30vw',
    overflowY: 'auto',
  },
  formSection: {
    marginBottom: '2vw',
    backgroundColor: '#f7fafc',
    padding: '1.5vw',
    borderRadius: '0.6vw',
  },
  sectionTitle: {
    fontSize: '1.2vw',
    fontWeight: 600,
    color: '#2d3748',
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
    color: '#4a5568',
    fontWeight: 500,
  },
  formInput: {
    padding: '0.8vw 1vw',
    borderRadius: '0.4vw',
    border: '0.1vw solid #e2e8f0',
    fontSize: '0.9vw',
    color: '#2d3748',
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#fc8181',
  },
  errorMessage: {
    color: '#e53e3e',
    fontSize: '0.8vw',
    marginTop: '0.3vw',
  },
  requiredField: {
    color: '#e53e3e',
  },
  imageUploadSection: {
    marginBottom: '1.5vw',
  },
  imagePreview: {
    width: '100%',
    height: '20vw',
    border: '0.1vw dashed #cbd5e0',
    borderRadius: '0.6vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1vw',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  imagePreviewError: {
    borderColor: '#fc8181',
    backgroundColor: '#fff5f5',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  placeholderImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1vw',
  },
  cameraIconLarge: {
    width: '3vw',
    height: '3vw',
    color: '#a0aec0',
  },
  imageRequiredText: {
    fontSize: '1vw',
    color: '#718096',
  },
  imageActions: {
    display: 'flex',
    gap: '1vw',
    justifyContent: 'center',
  },
  imageButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5vw',
    padding: '0.8vw 1.5vw',
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
    border: 'none',
    borderRadius: '0.4vw',
    fontSize: '0.9vw',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cameraButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5vw',
    padding: '0.8vw 1.5vw',
    backgroundColor: '#e6fffa',
    color: '#047481',
    border: 'none',
    borderRadius: '0.4vw',
    fontSize: '0.9vw',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5vw',
  },
  submitButton: {
    padding: '1vw 3vw',
    backgroundColor: '#046307',
    color: 'white',
    border: 'none',
    borderRadius: '0.4vw',
    fontSize: '1vw',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnDisabled: {
    backgroundColor: '#cbd5e0',
    cursor: 'not-allowed',
  },
  receiptTableContainer: {
    marginBottom: '2vw',
    border: '0.1vw solid #e2e8f0',
    borderRadius: '0.6vw',
    overflow: 'hidden',
  },
  receiptTableHeader: {
    backgroundColor: '#f7fafc',
    borderBottom: '0.1vw solid #e2e8f0',
  },
  receiptTableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(11, 1fr)',
    borderBottom: '0.1vw solid #e2e8f0',
  },
  receiptTableHeaderCell: {
    padding: '1vw 0.5vw',
    fontSize: '0.8vw',
    fontWeight: 600,
    color: '#4a5568',
    textAlign: 'center',
  },
  receiptTableCell: {
    padding: '0.8vw 0.5vw',
    fontSize: '0.8vw',
    color: '#4a5568',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  receiptTableBody: {
    maxHeight: '20vw',
    overflowY: 'auto',
  },
  receiptTableFooter: {
    backgroundColor: '#f7fafc',
    borderTop: '0.1vw solid #e2e8f0',
  },
  receiptTableFooterCell: {
    padding: '1vw 0.5vw',
    fontSize: '0.8vw',
    fontWeight: 600,
    color: '#4a5568',
    textAlign: 'center',
  },
  noData: {
    padding: '3vw',
    textAlign: 'center',
    color: '#a0aec0',
    fontSize: '1vw',
  },
  transactionLogSection: {
    marginTop: '2vw',
  },
  transactionTable: {
    border: '0.1vw solid #e2e8f0',
    borderRadius: '0.6vw',
    overflow: 'hidden',
  },
  transactionTableHeader: {
    backgroundColor: '#f7fafc',
    borderBottom: '0.1vw solid #e2e8f0',
  },
  transactionTableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    borderBottom: '0.1vw solid #e2e8f0',
  },
  transactionTableCell: {
    padding: '1vw',
    fontSize: '0.9vw',
    color: '#4a5568',
    textAlign: 'center',
  },
  transactionTableBody: {
    maxHeight: '20vw',
    overflowY: 'auto',
  },
};

export default DataTable;
