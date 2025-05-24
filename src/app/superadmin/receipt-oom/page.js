'use client'

import React, { useState } from 'react';

const DataTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data] = useState([
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
              <h1 style={styles.h1}>Data Records - Out of Mumbai</h1>
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
              <div style={{...styles.tableCell, ...styles.cellSubmitted, ...styles.headerCell}}>SUBMITTED BY</div>
              <div style={{...styles.tableCell, ...styles.cellHissa, ...styles.headerCell}}>TOTAL HISSA</div>
              <div style={{...styles.tableCell, ...styles.cellReceipt, ...styles.headerCell}}>RECEIPT</div>
              <div style={{...styles.tableCell, ...styles.cellActions, ...styles.headerCell}}>VIEW</div>
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
                    <span style={styles.hissaBadge}>
                      {item.totalHissa}
                    </span>
                  </div>
                  
                  {/* Generate Receipt */}
                  <div style={{...styles.tableCell, ...styles.cellReceipt}}>
                    <button style={{...styles.btn, ...styles.btnPrimary}}>
                      <FileTextIcon style={styles.btnIcon} />
                    </button>
                  </div>
                  
                  {/* Actions */}
                  <div style={{...styles.tableCell, ...styles.cellActions}}>
                    <button style={{...styles.btn, ...styles.btnSecondary}}>
                      <EyeIcon style={styles.btnIcon} />
                    </button>
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
    gridTemplateColumns: '0.5fr 1fr 1fr 1.5fr 1fr 0.5fr 0.5fr',
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
    gridTemplateColumns: '0.5fr 1fr 1fr 1.5fr 1fr 0.5fr 0.5fr',
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
