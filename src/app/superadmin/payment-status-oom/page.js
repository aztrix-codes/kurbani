'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const OutOfMumbaiSummaryTable = () => {

  const router = useRouter()
  
    useEffect(() => {
      const isLoggedIn = localStorage.getItem('superAdminLoggedIn') === 'true';
      if (!isLoggedIn) {
        router.replace('/auth/superadmin');
      }
    }, [router]);

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [areasList, setAreasList] = useState([]);
  const [adminData, setAdminData] = useState({
    oom_a_cost: 4300
  });
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState([]);

  // Fetch all required data
  useEffect(() => {
    const fetchAllData = async () => {
      const username = localStorage.getItem('superAdminUsername');
      const password = localStorage.getItem('superAdminPassword');
      setLoading(true);
      try {
        // Fetch users
        const usersResponse = await axios.get('/api/users');
        setUsers(usersResponse.data);
        
        // Fetch customers
        const customersResponse = await axios.get('/api/customers?user_id=0');
        setCustomerData(customersResponse.data);
        
        // Fetch areas
        const areasResponse = await axios.get('/api/areas');
        setAreasList(areasResponse.data);
        
        // Fetch admin data for oom_a_cost
        const adminResponse = await axios.get('/api/superadmin', {
          params: { name: username, password: password }
        });
        
        if (adminResponse.data.success) {
          setAdminData({
            oom_a_cost: parseFloat(adminResponse.data.data.oom_a_cost)
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Calculate summary data whenever the source data changes
  useEffect(() => {
    if (users.length > 0 && customerData.length > 0 && areasList.length > 0) {
      calculateSummaryData();
    }
  }, [users, customerData, areasList, adminData]);

  // Calculate summary data for each user
  const calculateSummaryData = () => {
    const summary = users.map((user, index) => {
      // Filter customers for this user where status is 1 and zone is Out of Mumbai
      const userCustomers = customerData.filter(customer => 
        customer.user_id == user.user_id && 
        customer.status === 1 && 
        customer.zone === 'Out of Mumbai'
      );
      
      // Calculate total hissa (count of filtered records)
      const totalHissa = userCustomers.length;
      
      // Calculate total amount based on oom_a_cost
      // Formula: (totalHissa / 7) * oom_a_cost
      const totalAnimals = Math.floor(totalHissa / 7);
      const remainingShares = totalHissa % 7;
      const totalAmount = (totalHissa * adminData.oom_a_cost);
      
      // Calculate paid amount based on payment_status
      const paidCustomers = userCustomers.filter(customer => customer.payment_status === 1);
      const paidHissa = paidCustomers.length;
      const paidAnimals = Math.floor(paidHissa / 7);
      const paidRemainingShares = paidHissa % 7;
      const paidAmount = (paidHissa * adminData.oom_a_cost);
      
      // Find the zone_name from areasList based on matching area_name
      const matchedArea = areasList.find(area => area.area_name === user.area_name);
      const zoneName = matchedArea ? matchedArea.zone_name : 'N/A';
      
      return {
        id: index + 1,
        user_id: user.user_id,
        username: user.username,
        area_name: user.area_name || 'N/A',
        zone_name: zoneName,
        total_hissa: totalHissa,
        total_amount: Math.ceil(totalAmount), // Round up to nearest whole number
        paid_hissa: paidHissa,
        paid_amount: Math.ceil(paidAmount), // Round up to nearest whole number
        pending_hissa: totalHissa - paidHissa,
        pending_amount: Math.ceil(totalAmount - paidAmount) // Round up to nearest whole number
      };
    });
    
    // Filter out users with no Out of Mumbai customers
    const filteredSummary = summary.filter(item => item.total_hissa > 0);
    
    setSummaryData(filteredSummary);
  };

  // Filter summary data based on search term
  const filteredData = summaryData.filter(item =>
    Object.values(item).some(val =>
      val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Export to Excel
  const exportToExcel = () => {
  try {
    // Import xlsx library
    const XLSX = require('xlsx');
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare headers to match UI table structure
    const headers = [
      'Sr no.',
      'NIGRA',
      'AREA',
      'ZONE',
      'TOTAL HISSA',
      'TOTAL AMOUNT',
      'PAID HISSA',
      'PAID AMOUNT',
      'PENDING',
      'PENDING AMOUNT'
    ];
    
    // Prepare data rows from filteredData
    const data = filteredData.map(item => [
      item.id,
      item.username,
      item.area_name,
      item.zone_name,
      item.total_hissa,
      `₹${item.total_amount}`,
      item.paid_hissa,
      `₹${item.paid_amount}`,
      item.pending_hissa,
      `₹${item.pending_amount}`
    ]);
    
    // Add totals row at the bottom
    const totalsRow = [
      '',
      '',
      '',
      'TOTALS:',
      filteredData.reduce((sum, item) => sum + item.total_hissa, 0),
      `₹${filteredData.reduce((sum, item) => sum + item.total_amount, 0)}`,
      filteredData.reduce((sum, item) => sum + item.paid_hissa, 0),
      `₹${filteredData.reduce((sum, item) => sum + item.paid_amount, 0)}`,
      filteredData.reduce((sum, item) => sum + item.pending_hissa, 0),
      `₹${filteredData.reduce((sum, item) => sum + item.pending_amount, 0)}`
    ];
    
    // Combine headers, data, and totals
    const worksheet_data = [headers, ...data, totalsRow];
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheet_data);
    
    // Set column widths to improve readability
    const columnWidths = [
      { wch: 8 },  // Sr no.
      { wch: 20 }, // NIGRA
      { wch: 20 }, // AREA
      { wch: 15 }, // ZONE
      { wch: 12 }, // TOTAL HISSA
      { wch: 15 }, // TOTAL AMOUNT
      { wch: 12 }, // PAID HISSA
      { wch: 15 }, // PAID AMOUNT
      { wch: 12 }, // PENDING
      { wch: 15 }  // PENDING AMOUNT
    ];
    worksheet['!cols'] = columnWidths;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Out of Mumbai Payment Summary');
    
    // Generate Excel file name with current date
    const date = new Date();
    const fileName = `Out_of_Mumbai_Payment_Summary_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.xlsx`;
    
    // Write the workbook and trigger download
    XLSX.writeFile(workbook, fileName);
    
    console.log(`Excel file "${fileName}" exported successfully`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export data to Excel');
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerTitle}>
              <h1 style={styles.h1}>Summary Report - Out of Mumbai</h1>
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
              Total Records: <span style={styles.statsValue}>{summaryData.length}</span>
            </div>
            <div style={styles.statsText}>
              Cost Per Animal: <span style={styles.statsValue}>₹{adminData.oom_a_cost}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div style={styles.tableContainer}>
          {/* Table Header */}
          <div style={styles.tableHeader}>
            <div style={styles.tableRow}>
              <div style={{...styles.tableCell, ...styles.cellId, ...styles.headerCell}}>Sr no.</div>
              <div style={{...styles.tableCell, ...styles.cellNigra, ...styles.headerCell}}>NIGRA</div>
              <div style={{...styles.tableCell, ...styles.cellArea, ...styles.headerCell}}>AREA</div>
              <div style={{...styles.tableCell, ...styles.cellZone, ...styles.headerCell}}>ZONE</div>
              <div style={{...styles.tableCell, ...styles.cellHissa, ...styles.headerCell}}>TOTAL HISSA</div>
              <div style={{...styles.tableCell, ...styles.cellAmount, ...styles.headerCell}}>TOTAL AMOUNT</div>
              <div style={{...styles.tableCell, ...styles.cellPaid, ...styles.headerCell}}>PAID HISSA</div>
              <div style={{...styles.tableCell, ...styles.cellPaidAmount, ...styles.headerCell}}>PAID AMOUNT</div>
              <div style={{...styles.tableCell, ...styles.cellPending, ...styles.headerCell}}>PENDING</div>
              <div style={{...styles.tableCell, ...styles.cellPendingAmount, ...styles.headerCell}}>PENDING AMOUNT</div>
            </div>
          </div>

          {/* Table Body */}
          <div style={styles.tableBody}>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading data...</p>
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div 
                  key={item.id} 
                  style={styles.dataRow}
                  className="data-row" // For hover effect
                >
                  {/* ID */}
                  <div style={{...styles.tableCell, ...styles.cellId}}>
                    <span style={styles.idText}>{item.id}</span>
                  </div>
                  
                  {/* Nigra (Username) */}
                  <div style={{...styles.tableCell, ...styles.cellNigra}}>
                    <span style={styles.nigraText}>{item.username}</span>
                  </div>
                  
                  {/* Area */}
                  <div style={{...styles.tableCell, ...styles.cellArea}}>
                    <span style={styles.areaText}>{item.area_name}</span>
                  </div>
                  
                  {/* Zone */}
                  <div style={{...styles.tableCell, ...styles.cellZone}}>
                    <span style={styles.zoneText}>{item.zone_name}</span>
                  </div>
                  
                  {/* Total Hissa */}
                  <div style={{...styles.tableCell, ...styles.cellHissa}}>
                    <span style={styles.hissaText}>{item.total_hissa}</span>
                  </div>
                  
                  {/* Total Amount */}
                  <div style={{...styles.tableCell, ...styles.cellAmount}}>
                    <span style={styles.amountText}>₹{item.total_amount}</span>
                  </div>
                  
                  {/* Paid Hissa */}
                  <div style={{...styles.tableCell, ...styles.cellPaid}}>
                    <span style={styles.paidText}>{item.paid_hissa}</span>
                  </div>
                  
                  {/* Paid Amount */}
                  <div style={{...styles.tableCell, ...styles.cellPaidAmount}}>
                    <span style={styles.paidAmountText}>₹{item.paid_amount}</span>
                  </div>
                  
                  {/* Pending Hissa */}
                  <div style={{...styles.tableCell, ...styles.cellPending}}>
                    <span style={styles.pendingText}>{item.pending_hissa}</span>
                  </div>
                  
                  {/* Pending Amount */}
                  <div style={{...styles.tableCell, ...styles.cellPendingAmount}}>
                    <span style={styles.pendingAmountText}>₹{item.pending_amount}</span>
                  </div>
                </div>
              ))
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
          
          {/* Table Footer with Totals */}
          {filteredData.length > 0 && (
            <div style={styles.tableFooter}>
              <div style={styles.tableRow}>
                <div style={{...styles.tableCell, ...styles.cellId}}></div>
                <div style={{...styles.tableCell, ...styles.cellNigra}}></div>
                <div style={{...styles.tableCell, ...styles.cellArea}}></div>
                <div style={{...styles.tableCell, ...styles.cellZone}}>
                  <span style={styles.footerLabel}>TOTALS:</span>
                </div>
                <div style={{...styles.tableCell, ...styles.cellHissa}}>
                  <span style={styles.footerValue}>
                    {filteredData.reduce((sum, item) => sum + item.total_hissa, 0)}
                  </span>
                </div>
                <div style={{...styles.tableCell, ...styles.cellAmount}}>
                  <span style={styles.footerValue}>
                    ₹{filteredData.reduce((sum, item) => sum + item.total_amount, 0)}
                  </span>
                </div>
                <div style={{...styles.tableCell, ...styles.cellPaid}}>
                  <span style={styles.footerValue}>
                    {filteredData.reduce((sum, item) => sum + item.paid_hissa, 0)}
                  </span>
                </div>
                <div style={{...styles.tableCell, ...styles.cellPaidAmount}}>
                  <span style={styles.footerValue}>
                    ₹{filteredData.reduce((sum, item) => sum + item.paid_amount, 0)}
                  </span>
                </div>
                <div style={{...styles.tableCell, ...styles.cellPending}}>
                  <span style={styles.footerValue}>
                    {filteredData.reduce((sum, item) => sum + item.pending_hissa, 0)}
                  </span>
                </div>
                <div style={{...styles.tableCell, ...styles.cellPendingAmount}}>
                  <span style={styles.footerValue}>
                    ₹{filteredData.reduce((sum, item) => sum + item.pending_amount, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
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
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
    display: 'flex',
    gap: '2vw',
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
    gridTemplateColumns: '0.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
    gap: '0.5vw',
    padding: '0 1vw',
  },
  headerCell: {
    paddingTop: '1.2vw',
    paddingBottom: '1.2vw',
    fontSize: '0.9vw',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#475569',
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5vw',
  },
  tableBody: {
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  dataRow: {
    display: 'grid',
    gridTemplateColumns: '0.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
    gap: '0.5vw',
    padding: '0 1vw',
    borderBottom: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  tableFooter: {
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    fontWeight: 600,
  },
  footerLabel: {
    fontSize: '0.9vw',
    fontWeight: 700,
    color: '#475569',
  },
  footerValue: {
    fontSize: '0.9vw',
    fontWeight: 700,
    color: '#046307',
  },
  cellId: {
    justifyContent: 'center',
  },
  cellNigra: {
    justifyContent: 'center',
  },
  cellArea: {
    justifyContent: 'center',
  },
  cellZone: {
    justifyContent: 'center',
  },
  cellHissa: {
    justifyContent: 'center',
  },
  cellAmount: {
    justifyContent: 'center',
  },
  cellPaid: {
    justifyContent: 'center',
  },
  cellPaidAmount: {
    justifyContent: 'center',
  },
  cellPending: {
    justifyContent: 'center',
  },
  cellPendingAmount: {
    justifyContent: 'center',
  },
  idText: {
    fontSize: '0.9vw',
    fontWeight: 700,
    color: '#046307',
  },
  nigraText: {
    fontSize: '0.9vw',
    fontWeight: 500,
  },
  areaText: {
    fontSize: '0.9vw',
  },
  zoneText: {
    fontSize: '0.9vw',
  },
  hissaText: {
    fontSize: '0.9vw',
    fontWeight: 600,
  },
  amountText: {
    fontSize: '0.9vw',
    fontWeight: 600,
    color: '#1e40af',
  },
  paidText: {
    fontSize: '0.9vw',
    fontWeight: 600,
    color: '#047857',
  },
  paidAmountText: {
    fontSize: '0.9vw',
    fontWeight: 600,
    color: '#047857',
  },
  pendingText: {
    fontSize: '0.9vw',
    fontWeight: 600,
    color: '#b91c1c',
  },
  pendingAmountText: {
    fontSize: '0.9vw',
    fontWeight: 600,
    color: '#b91c1c',
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
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6vw 0',
  },
  spinner: {
    width: '3vw',
    height: '3vw',
    border: '0.3vw solid #f3f4f6',
    borderTop: '0.3vw solid #046307',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1vw',
  },
  loadingText: {
    fontSize: '1.2vw',
    color: '#4b5563',
  },
};

export default OutOfMumbaiSummaryTable;
