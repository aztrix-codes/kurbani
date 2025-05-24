'use client'

import React, { useState } from 'react';

const DataTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data] = useState([ 
    { id: 1, name: "Ahmed Hassan", receipt: "RCP001", type: "qurbani", phone: "+1234567890", status: 0 }, 
    { id: 2, name: "Fatima Ali", receipt: "RCP002", type: "aqeeqah boy", phone: "+1234567891", status: 0 }, 
    { id: 3, name: "Omar Sheikh", receipt: "RCP003", type: "qurbani", phone: "+1234567892", status: 0 }, 
    { id: 4, name: "Aisha Khan", receipt: "RCP004", type: "aqeeqah girl", phone: "+1234567893", status: 0 }, 
    { id: 5, name: "Ibrahim Malik", receipt: "RCP005", type: "qurbani", phone: "+1234567894", status: 0 }, 
    { id: 6, name: "Zainab Ahmed", receipt: "RCP006", type: "aqeeqah boy", phone: "+1234567895", status: 0 }, 
    { id: 7, name: "Muhammad Tariq", receipt: "RCP007", type: "qurbani", phone: "+1234567896", status: 0 }, 
    { id: 8, name: "Khadija Begum", receipt: "RCP008", type: "aqeeqah girl", phone: "+1234567897", status: 0 }, 
    { id: 9, name: "Yusuf Rahman", receipt: "RCP009", type: "qurbani", phone: "+1234567898", status: 0 }, 
    { id: 10, name: "Mariam Siddique", receipt: "RCP010", type: "aqeeqah boy", phone: "+1234567899", status: 0 } 
  ]);

  const exportToExcel = () => {
    console.log('Exporting to Excel...');
  };

  const filteredData = data.filter(item =>
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
              <h1 style={styles.h1}>All Records - Out of Mumbai</h1>
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
              <div style={{...styles.tableCell, ...styles.cellId, ...styles.headerCell}}>Sr no.</div>
              <div style={{...styles.tableCell, ...styles.cellName, ...styles.headerCell}}>NAME</div>
              <div style={{...styles.tableCell, ...styles.cellType, ...styles.headerCell}}>TYPE</div>
              <div style={{...styles.tableCell, ...styles.cellPhone, ...styles.headerCell}}>PHONE</div>
              <div style={{...styles.tableCell, ...styles.cellStatus, ...styles.headerCell}}>STATUS</div>
            </div>
          </div>

          {/* Table Body */}
          <div style={styles.tableBody}>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <div 
                  key={item.id} 
                  style={styles.dataRow}
                  className="data-row" // For hover effect
                >
                  {/* ID */}
                  <div style={{...styles.tableCell, ...styles.cellId}}>
                    <span style={styles.idText}>{index + 1}</span>
                  </div>
                  
                  {/* Name */}
                  <div style={{...styles.tableCell, ...styles.cellName}}>
                    <span style={styles.nameText}>{item.name}</span>
                  </div>
                  
                  {/* Type */}
                  <div style={{...styles.tableCell, ...styles.cellType}}>
                    <span style={styles.typeText}>{item.type}</span>
                  </div>
                  
                  {/* Phone */}
                  <div style={{...styles.tableCell, ...styles.cellPhone}}>
                    <span style={styles.phoneText}>{item?.phone}</span>
                  </div>
                  
                  {/* Status */}
                  <div style={{...styles.tableCell, ...styles.cellStatus}}>
                    <span style={styles.statusBadgePending}>Pending</span>
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
    background: 'linear-gradient(to right, #046307, #057309)',
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
    gridTemplateColumns: '0.5fr 1.5fr 1fr 1fr 1fr',
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
    gridTemplateColumns: '0.5fr 1.5fr 1fr 1fr 1fr',
    gap: '1vw',
    padding: '1vw 2vw',
    borderBottom: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  cellId: {
    justifyContent: 'center',
  },
  cellName: {
    justifyContent: 'center',
  },
  cellType: {
    justifyContent: 'center',
  },
  cellPhone: {
    justifyContent: 'center',
  },
  cellStatus: {
    justifyContent: 'center',
  },
  idText: {
    fontSize: '1vw',
    fontWeight: 700,
    color: '#046307',
  },
  nameText: {
    fontSize: '1vw',
    fontWeight: 500,
  },
  typeText: {
    fontSize: '1vw',
    textTransform: 'capitalize',
  },
  phoneText: {
    fontSize: '1vw',
  },
  statusBadgePending: {
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

export default DataTable;
