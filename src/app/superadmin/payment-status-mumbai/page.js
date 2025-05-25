'use client'

import React, { useState } from 'react';

const FinancialTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data] = useState([ 
    { id: 1, zone: "North Zone", area: "Andheri", submittedBy: "Ahmed Hassan", totalHissa: 3, totalAmount: 45000, totalPaid: 30000, balance: 15000 }, 
    { id: 2, zone: "South Zone", area: "Bandra", submittedBy: "Fatima Ali", totalHissa: 2, totalAmount: 30000, totalPaid: 30000, balance: 0 }, 
    { id: 3, zone: "East Zone", area: "Kurla", submittedBy: "Omar Sheikh", totalHissa: 5, totalAmount: 75000, totalPaid: 50000, balance: 25000 }, 
    { id: 4, zone: "West Zone", area: "Juhu", submittedBy: "Aisha Khan", totalHissa: 1, totalAmount: 15000, totalPaid: 10000, balance: 5000 }, 
    { id: 5, zone: "Central Zone", area: "Dadar", submittedBy: "Ibrahim Malik", totalHissa: 4, totalAmount: 60000, totalPaid: 60000, balance: 0 }, 
    { id: 6, zone: "North Zone", area: "Goregaon", submittedBy: "Zainab Ahmed", totalHissa: 2, totalAmount: 30000, totalPaid: 15000, balance: 15000 }, 
    { id: 7, zone: "South Zone", area: "Colaba", submittedBy: "Muhammad Tariq", totalHissa: 3, totalAmount: 45000, totalPaid: 45000, balance: 0 }, 
    { id: 8, zone: "East Zone", area: "Chembur", submittedBy: "Khadija Begum", totalHissa: 1, totalAmount: 15000, totalPaid: 5000, balance: 10000 }, 
    { id: 9, zone: "West Zone", area: "Versova", submittedBy: "Yusuf Rahman", totalHissa: 2, totalAmount: 30000, totalPaid: 30000, balance: 0 }, 
    { id: 10, zone: "Central Zone", area: "Parel", submittedBy: "Mariam Siddique", totalHissa: 3, totalAmount: 45000, totalPaid: 30000, balance: 15000 } 
  ]);

  const exportToExcel = () => {
    console.log('Exporting to Excel...');
  };

  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate totals for the stats section
  const totalHissa = data.reduce((sum, item) => sum + item.totalHissa, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalPaid = data.reduce((sum, item) => sum + item.totalPaid, 0);
  const totalBalance = data.reduce((sum, item) => sum + item.balance, 0);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerTitle}>
              <h1 style={styles.h1}>Payment Status - Mumbai</h1>
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
            <div style={styles.statsRow}>
              <div style={styles.statsItem}>
                <span style={styles.statsLabel}>Total Hissa:</span>
                <span style={styles.statsValue}>{totalHissa}</span>
              </div>
              <div style={styles.statsItem}>
                <span style={styles.statsLabel}>Total Amount:</span>
                <span style={styles.statsValue}>{formatCurrency(totalAmount)}</span>
              </div>
              <div style={styles.statsItem}>
                <span style={styles.statsLabel}>Total Paid:</span>
                <span style={styles.statsValue}>{formatCurrency(totalPaid)}</span>
              </div>
              <div style={styles.statsItem}>
                <span style={styles.statsLabel}>Balance:</span>
                <span style={styles.statsValue}>{formatCurrency(totalBalance)}</span>
              </div>
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
              <div style={{...styles.tableCell, ...styles.cellAmount, ...styles.headerCell}}>TOTAL AMOUNT</div>
              <div style={{...styles.tableCell, ...styles.cellPaid, ...styles.headerCell}}>TOTAL PAID</div>
              <div style={{...styles.tableCell, ...styles.cellBalance, ...styles.headerCell}}>BALANCE</div>
            </div>
          </div>

          {/* Table Body */}
          <div style={styles.tableBody}>
            {filteredData.length > 0 ? (
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
                  
                  {/* Zone */}
                  <div style={{...styles.tableCell, ...styles.cellZone}}>
                    <span style={styles.zoneText}>{item.zone}</span>
                  </div>
                  
                  {/* Area */}
                  <div style={{...styles.tableCell, ...styles.cellArea}}>
                    <span style={styles.areaText}>{item.area}</span>
                  </div>
                  
                  {/* Submitted By */}
                  <div style={{...styles.tableCell, ...styles.cellSubmitted}}>
                    <span style={styles.submittedText}>{item.submittedBy}</span>
                  </div>
                  
                  {/* Total Hissa */}
                  <div style={{...styles.tableCell, ...styles.cellHissa}}>
                    <span style={styles.hissaBadge}>{item.totalHissa}</span>
                  </div>
                  
                  {/* Total Amount */}
                  <div style={{...styles.tableCell, ...styles.cellAmount}}>
                    <span style={styles.amountText}>{formatCurrency(item.totalAmount)}</span>
                  </div>
                  
                  {/* Total Paid */}
                  <div style={{...styles.tableCell, ...styles.cellPaid}}>
                    <span style={styles.paidText}>{formatCurrency(item.totalPaid)}</span>
                  </div>
                  
                  {/* Balance */}
                  <div style={{...styles.tableCell, ...styles.cellBalance}}>
                    {item.balance > 0 ? (
                      <span style={styles.balanceBadge}>{formatCurrency(item.balance)}</span>
                    ) : (
                      <span style={styles.paidFullBadge}>Paid</span>
                    )}
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
  },
  statsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2vw',
  },
  statsItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3vw',
  },
  statsLabel: {
    fontSize: '0.9vw',
    opacity: 0.9,
  },
  statsValue: {
    fontSize: '1.2vw',
    fontWeight: 600,
  },
  statsText: {
    fontSize: '1vw',
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
    gridTemplateColumns: '0.5fr 1fr 1fr 1.5fr 0.8fr 1fr 1fr 1fr',
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
    gridTemplateColumns: '0.5fr 1fr 1fr 1.5fr 0.8fr 1fr 1fr 1fr',
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
  cellAmount: {
    justifyContent: 'center',
  },
  cellPaid: {
    justifyContent: 'center',
  },
  cellBalance: {
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
  hissaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.3vw 0.8vw',
    backgroundColor: 'rgba(4, 99, 7, 0.1)',
    color: '#046307',
    fontWeight: 500,
    borderRadius: '2vw',
    fontSize: '0.9vw',
    minWidth: '3vw',
  },
  amountText: {
    fontSize: '1vw',
    fontWeight: 500,
  },
  paidText: {
    fontSize: '1vw',
    fontWeight: 500,
  },
  balanceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.3vw 0.8vw',
    backgroundColor: '#fef3c7', // Yellow background
    color: '#92400e', // Yellow-brown text
    fontWeight: 500,
    borderRadius: '2vw',
    fontSize: '0.9vw',
    minWidth: '5vw',
  },
  paidFullBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.3vw 0.8vw',
    backgroundColor: '#dcfce7', // Green background
    color: '#166534', // Green text
    fontWeight: 500,
    borderRadius: '2vw',
    fontSize: '0.9vw',
    minWidth: '5vw',
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
};

export default FinancialTable;
