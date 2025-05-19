'use client'
import { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, ArrowUpDown, Edit, Trash2, Check, X } from 'lucide-react';
import './style.css'

export default function DataTable() {
  const [data, setData] = useState([
    { id: 1, receipt: 28365, name: "John Smith", type: "qurbani", zone: "out of mumbai", status: false },
    { id: 2, receipt: 39471, name: "Sarah Johnson", type: "sadaqah", zone: "mumbai", status: false },
    { id: 3, receipt: 47295, name: "Ahmed Khan", type: "qurbani", zone: "out of mumbai", status: true },
    { id: 4, receipt: 58302, name: "Priya Patel", type: "zakat", zone: "mumbai", status: false },
    { id: 5, receipt: 61947, name: "Michael Brown", type: "sadaqah", zone: "out of mumbai", status: false },
    { id: 6, receipt: 73026, name: "Fatima Ali", type: "qurbani", zone: "mumbai", status: true },
    { id: 7, receipt: 84159, name: "David Chen", type: "zakat", zone: "out of mumbai", status: false },
    { id: 8, receipt: 92748, name: "Aisha Rahman", type: "sadaqah", zone: "mumbai", status: false },
    { id: 9, receipt: 10384, name: "James Wilson", type: "qurbani", zone: "out of mumbai", status: true },
    { id: 10, receipt: 11526, name: "Leila Hassan", type: "zakat", zone: "mumbai", status: true }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredData, setFilteredData] = useState(data);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');

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
  
  // Handle edit button click
  const handleEditClick = (id, name) => {
    setEditingId(id);
    setEditedName(name);
  };
  
  // Save edited name
  const saveEditedName = (id) => {
    const newData = data.map(item => {
      if (item.id === id) {
        return { ...item, name: editedName };
      }
      return item;
    });
    setData(newData);
    setEditingId(null);
    setEditedName('');
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditedName('');
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
                      <div className="table-cell">
                        {editingId === item.id ? (
                          <div className="name-edit-container">
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="name-edit-input"
                              autoFocus
                            />
                          </div>
                        ) : (
                          item.name
                        )}
                      </div>
                      <div className="table-cell">{item.type}</div>
                      <div className="table-cell">{item.zone}</div>
                      <div className="table-cell actions-cell">
                        {item.status ? (
                          <div className="sent-status">Sent</div>
                        ) : (
                          <div className="action-buttons">
                            {editingId === item.id ? (
                              <div className="edit-actions">
                                <button 
                                  onClick={() => saveEditedName(item.id)}
                                  className="edit-action-button save-button"
                                  title="Save"
                                >
                                  <Check size={16} />
                                </button>
                                <button 
                                  onClick={cancelEdit}
                                  className="edit-action-button cancel-button"
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  className="action-button edit-button"
                                  onClick={() => handleEditClick(item.id, item.name)}
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
                              </>
                            )}
                          </div>
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