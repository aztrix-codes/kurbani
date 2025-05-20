'use client'
import { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, ArrowUpDown, Edit, Trash2, Check, X } from 'lucide-react';
import './style.css'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function DataTable() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredData, setFilteredData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (
      userData.userId === 0 &&
      userData.isAuthenticated === false &&
      userData.status === 0
    ) {
      router.replace('/auth/user');
    } else {
      fetchData();
    }
  }, [router]);

     const exportToExcel = () => {
    try {
      const dataToExport = filteredData.filter(item => item.status === 1);
      
      if (dataToExport.length === 0) {
        alert("No records with 'Sent' status found to export.");
        return;
      }
      
      const excelData = dataToExport.map(item => ({
        'Sr No.': item.id,
        'Receipt No.': item.recipt,
        'Name': item.name,
        'Type': item.type,
        'Zone': item.zone,
        'Phone': item.phone || '',
        'Status': 'Sent' // Show "Sent" for status column
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');
      
      XLSX.writeFile(workbook, 'records_export.xlsx');
      
      console.log('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data to Excel');
    }
  };


  // Fetch data from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData?.userId;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axios.get(`/api/customers?user_id=${userId}`);
      setData(response.data);
      setFilteredData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(data)

  // Handle search functionality
  useEffect(() => {
    const results = data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipt.includes(searchTerm) ||
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
  const saveEditedName = async (id) => {
    try {
      const itemToUpdate = data.find(item => item.id === id);
      if (!itemToUpdate) return;

      await axios.put('/api/customers', {
        user_id: itemToUpdate.user_id,
        spl_id: itemToUpdate.spl_id,
        name: editedName
      });

      // Update local state
      const newData = data.map(item => {
        if (item.id === id) {
          return { ...item, name: editedName };
        }
        return item;
      });
      
      setData(newData);
      setEditingId(null);
      setEditedName('');
    } catch (err) {
      console.error('Error updating name:', err);
      alert('Failed to update name');
    }
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditedName('');
  };
  
  // Handle delete functionality
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const itemToDelete = data.find(item => item.id === id);
      if (!itemToDelete) return;

      await axios.delete('/api/customers', {
        data: {
          user_id: itemToDelete.user_id,
          spl_id: itemToDelete.spl_id
        }
      });

      // Update local state
      const newData = data.filter(item => item.id !== id);
      setData(newData);
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete record');
    }
  };


  if (isLoading) {
    return (
      <div className="fixed-color-theme flex flex-col p-4 max-w-full min-h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed-color-theme flex flex-col p-4 max-w-full min-h-screen">
        <div className="text-red-500 text-center p-8">{error}</div>
      </div>
    );
  }

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
                <div className="table-cell cursor-pointer">
                  <span className="flex items-center justify-center">
                    Phone
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
                      <div className="table-cell">{item.recipt}</div>
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
                      <div className="table-cell">{item?.phone}</div>
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