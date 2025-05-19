'use client'
import { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import './style.css'

// Custom Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, disabled }) => {
  if (checked) {
    return (
      <div className="sent-status">Sent</div>
    );
  }
  
  return (
    <button
      className={`toggle-switch ${checked ? 'on' : ''}`}
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
    >
      <span className="switch-thumb" />
    </button>
  );
};

// Sample data
const sampleData = [
  { id: 1, receipt: 28365, name: "John Smith", type: "qurbani", zone: "out of mumbai", status: false },
  { id: 2, receipt: 39471, name: "Sarah Johnson", type: "sadaqah", zone: "mumbai", status: false },
  { id: 3, receipt: 47295, name: "Ahmed Khan", type: "qurbani", zone: "out of mumbai", status: true },
  { id: 4, receipt: 58302, name: "Priya Patel", type: "zakat", zone: "mumbai", status: false },
  { id: 5, receipt: 61947, name: "Michael Brown", type: "sadaqah", zone: "out of mumbai", status: false },
  { id: 6, receipt: 73026, name: "Fatima Ali", type: "qurbani", zone: "mumbai", status: true },
  { id: 7, receipt: 84159, name: "David Chen", type: "zakat", zone: "out of mumbai", status: false },
  { id: 8, receipt: 92748, name: "Aisha Rahman", type: "sadaqah", zone: "mumbai", status: false },
  { id: 9, receipt: 10384, name: "James Wilson", type: "qurbani", zone: "out of mumbai", status: true },
  { id: 10, receipt: 11526, name: "Leila Hassan", type: "zakat", zone: "mumbai", status: false }
];

export default function DataTable() {
  const [data, setData] = useState(sampleData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredData, setFilteredData] = useState(data);
  const [editingId, setEditingId] = useState(null);
  const [editTimer, setEditTimer] = useState(null);

  // Handle search functionality
  useEffect(() => {
    const results = data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.receipt.toString().includes(searchTerm) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.zone.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, data]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredData(sortedData);
  };

  // Handle status toggle - only allow false to true (not reversible)
  const handleStatusToggle = (id) => {
    const newData = data.map(item => {
      // Only allow changing from false to true, not from true to false
      if (item.id === id && item.status === false) {
        return { ...item, status: true };
      }
      return item;
    });
    setData(newData);
    
    // Clear the editing state immediately after toggle
    setEditingId(null);
    if (editTimer) {
      clearTimeout(editTimer);
      setEditTimer(null);
    }
  };
  
  // Handle edit button click - show toggle for 3 seconds
  const handleEditClick = (id) => {
    // Clear any existing timer
    if (editTimer) {
      clearTimeout(editTimer);
    }
    
    // Set the current item to editing mode
    setEditingId(id);
    
    // Set a timer to exit edit mode after 3 seconds
    const timer = setTimeout(() => {
      setEditingId(null);
    }, 3000);
    
    setEditTimer(timer);
  };
  
  // Handle delete functionality
  const handleDelete = (id) => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
  };

  // Export to Excel (placeholder function)
  const exportToExcel = () => {
    alert("Export to Excel functionality would be implemented here");
  };
  
  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (editTimer) {
        clearTimeout(editTimer);
      }
    };
  }, [editTimer]);

  return (
    <div className="fixed-color-theme flex flex-col p-4 max-w-full min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Records Management</h1>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search records..."
              className="search-input pl-10 pr-4 py-2 border rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          </div>
          
          <button 
            onClick={exportToExcel}
            className="export-button flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg"
          >
            <FileSpreadsheet size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>
      
      <div className="main-table-container rounded-lg shadow overflow-hidden">
        <div className="table-header p-4 border-b flex justify-between items-center">
          <div className="font-medium">
            {filteredData.length} Record{filteredData.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="table-container">
            <div className="table-scroll-wrapper">
              <div className="table-heads">
                <div className="table-cell cursor-pointer" onClick={() => requestSort('id')}>
                  <span className="flex items-center justify-center gap-1">
                    Sr no. <ArrowUpDown size={14} />
                  </span>
                </div>
                <div className="table-cell cursor-pointer" onClick={() => requestSort('receipt')}>
                  <span className="flex items-center justify-center gap-1">
                    Receipt no. <ArrowUpDown size={14} />
                  </span>
                </div>
                <div className="table-cell cursor-pointer" onClick={() => requestSort('name')}>
                  <span className="flex items-center justify-center gap-1">
                    Name <ArrowUpDown size={14} />
                  </span>
                </div>
                <div className="table-cell cursor-pointer" onClick={() => requestSort('type')}>
                  <span className="flex items-center justify-center gap-1">
                    Type <ArrowUpDown size={14} />
                  </span>
                </div>
                <div className="table-cell cursor-pointer" onClick={() => requestSort('zone')}>
                  <span className="flex items-center justify-center gap-1">
                    Zone <ArrowUpDown size={14} />
                  </span>
                </div>
                <div className="table-cell">
                  <span className="flex items-center justify-center">
                    Actions
                  </span>
                </div>
              </div>
              
              <div className="table-body">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <div className="table-body-item" key={item.id}>
                      <div className="table-cell">{item.id}</div>
                      <div className="table-cell">{item.receipt}</div>
                      <div className="table-cell">{item.name}</div>
                      <div className="table-cell">{item.type}</div>
                      <div className="table-cell">{item.zone}</div>
                      <div className="table-cell actions-cell">
                        {item.status ? (
                          <div className="sent-status">Sent</div>
                        ) : (
                          editingId === item.id ? (
                            <ToggleSwitch
                              checked={item.status}
                              onChange={() => handleStatusToggle(item.id)}
                              disabled={item.status}
                            />
                          ) : (
                            <div className="action-buttons">
                              <button 
                                className="action-button edit-button"
                                onClick={() => handleEditClick(item.id)}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="action-button delete-button"
                                onClick={() => handleDelete(item.id)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No records found matching your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}