'use client'
import { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, ArrowUpDown, Edit, Trash2, Check, X } from 'lucide-react';
import './style.css'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Shimmer from '@/app/Shimmer';

export default function DataTable() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState('');
  const [hissaCards, setHissaCards] = useState([{ id: 1, type: "", text: "", isDisabled: false, pairId: null }]);
  const [location, setLocation] = useState("Out Of Mumbai");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [zones, setZones] = useState(['Out of Mumbai', 'Mumbai']);

  const router = useRouter();
  
  const hissaOptions = [
    { value: "", label: "SELECT" },
    { value: "qurbani", label: "Qurbani" },
    { value: "aqeeqah_boy", label: "Aqeeqah (Boy)" },
    { value: "aqeeqah_girl", label: "Aqeeqah (Girl)" }
  ];

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

  const exportToExcel = () => {
    try {
      const dataToExport = data.filter(item => item.status === 1);
      
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
        'Status': 'Sent'
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

  useEffect(() => {
    const results = data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipt.includes(searchTerm) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.zone.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, data]);

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

      fetchData();

    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete record');
    }
  };

  // Modal functions
  const openEditModal = (receipt) => {
    setCurrentReceipt(receipt);
    const recordsWithSameReceipt = data.filter(item => item.recipt === receipt);
    
    // Transform records into hissaCards format
    const cards = [];
    let idCounter = 1;
    
    // Group by name and type to handle aqeeqah_boy duplicates
    const recordsMap = new Map();
    recordsWithSameReceipt.forEach(record => {
      const key = `${record.name}-${record.type}`;
      if (!recordsMap.has(key)) {
        recordsMap.set(key, record);
      }
    });

    recordsMap.forEach(record => {
      if (record.type === 'aqeeqah_boy') {
        // Add primary card
        cards.push({
          id: idCounter++,
          type: record.type,
          text: record.name,
          isDisabled: false,
          pairId: null
        });
        // Add paired disabled card
        cards.push({
          id: idCounter++,
          type: record.type,
          text: record.name,
          isDisabled: true,
          pairId: cards[cards.length - 1].id
        });
      } else {
        cards.push({
          id: idCounter++,
          type: record.type,
          text: record.name,
          isDisabled: false,
          pairId: null
        });
      }
    });
    
    setHissaCards(cards.length > 0 ? cards : [{ id: 1, type: "", text: "", isDisabled: false, pairId: null }]);
    setLocation(recordsWithSameReceipt[0]?.zone || "Out Of Mumbai");
    setReceiptNumber(receipt);
    setMobileNumber(recordsWithSameReceipt[0]?.phone || "");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setModalError(null);
    setModalSuccess(false);
    setHissaCards([{ id: 1, type: "", text: "", isDisabled: false, pairId: null }]);
  };

  const calculateTotalHissaWeight = () => {
    return hissaCards.reduce((total, card) => {
      if (card.pairId !== null) return total; // Skip paired cards to avoid double counting
      return total + (card.type === "aqeeqah_boy" ? 2 : card.type ? 1 : 0);
    }, 0);
  };

  const calculateRemainingCardSlots = () => {
    const totalWeight = calculateTotalHissaWeight();
    return 7 - totalWeight;
  };

  const addHissaCard = () => {
    if (calculateRemainingCardSlots() >= 1) {
      const newId = hissaCards.length > 0 ? Math.max(...hissaCards.map(c => c.id)) + 1 : 1;
      setHissaCards([...hissaCards, { id: newId, type: "qurbani", text: "", isDisabled: false, pairId: null }]);
    } else {
      setModalError("Cannot add more hissas. Maximum of 7 hissas allowed.");
    }
  };

  const handleSelectChange = (id, value) => {
    setHissaCards(prevCards => {
      // Remove any existing pair for this card
      const cardsWithoutPair = prevCards.filter(card => card.pairId !== id);
      
      // Find the card being changed
      const cardIndex = cardsWithoutPair.findIndex(card => card.id === id);
      if (cardIndex === -1) return prevCards;
      
      const updatedCards = [...cardsWithoutPair];
      const currentCard = updatedCards[cardIndex];
      
      // Calculate if we have space for the change
      const currentWeight = currentCard.type === "aqeeqah_boy" ? 2 : currentCard.type ? 1 : 0;
      const newWeight = value === "aqeeqah_boy" ? 2 : value ? 1 : 0;
      const totalWeight = calculateTotalHissaWeight();
      
      if (totalWeight - currentWeight + newWeight > 7) {
        setModalError("Cannot add more hissas. Maximum of 7 hissas allowed.");
        return prevCards;
      }
      
      // Update the main card
      updatedCards[cardIndex] = {
        ...currentCard,
        type: value,
        text: value === "aqeeqah_boy" ? currentCard.text : currentCard.text
      };
      
      // If changing to aqeeqah_boy, add a paired disabled card
      if (value === "aqeeqah_boy") {
        const pairId = id;
        const newPairCard = {
          id: Math.max(...updatedCards.map(c => c.id), 0) + 1,
          type: value,
          text: currentCard.text,
          isDisabled: true,
          pairId: pairId
        };
        updatedCards.push(newPairCard);
      }
      
      setModalError(null);
      return updatedCards;
    });
  };

  const handleTextChange = (id, text) => {
    setHissaCards(prevCards => {
      return prevCards.map(card => {
        // Update both the main card and its paired card
        if (card.id === id || card.pairId === id) {
          return { ...card, text: text };
        }
        return card;
      });
    });
  };

  const removeHissaCard = (id) => {
    if (id === 1 || hissaCards.length === 1) return;
    
    setHissaCards(prevCards => {
      // Find the card to remove
      const cardToRemove = prevCards.find(card => card.id === id);
      
      // Remove both the card and its pair if exists
      const cardsToKeep = prevCards.filter(card => 
        card.id !== id && card.pairId !== id
      );
      
      // Reindex the remaining cards
      return cardsToKeep.map((card, index) => ({
        ...card,
        id: index + 1,
        pairId: card.pairId ? index : null // Update pairId reference if needed
      }));
    });
  };

  const generateSplId = (name) => {
    if (!name) return "";
    const numericalName = name.toUpperCase().split('').map(char => {
      const code = char.charCodeAt(0) - 65;
      return code >= 0 && code <= 25 ? code : '';
    }).join('');
    const timestamp = Math.floor(Date.now() / 1000);
    return `${numericalName}_${timestamp}`;
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      setModalError(null);
      setModalSuccess(false);

      // Validate inputs
      if (hissaCards.length === 0) {
        throw new Error('At least one hissa card is required');
      }

      if (!receiptNumber) {
        throw new Error('Receipt number is required');
      }

      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.userId) {
        throw new Error('User not authenticated');
      }

      // 1. First delete all existing records with this receipt number
      const deleteResponse = await axios.delete('/api/customers?bulk=true', {
        data: {
          user_id: userData.userId,
          receipt: currentReceipt
        }
      });

      console.log('Delete response:', deleteResponse.data);

      // 2. Create new records with the updated data
      const validCards = hissaCards.filter(card => 
        card.type && card.text.trim() && !card.isDisabled
      );
      
      if (validCards.length === 0) {
        throw new Error('At least one valid hissa with type and name is required');
      }

      const requests = [];
      const createdRecords = [];

      for (const card of validCards) {
        const spl_id = generateSplId(card.text);
        
        if (card.type === "aqeeqah_boy") {
          // Create two identical records for aqeeqah_boy (counts as 2 hissas)
          for (let i = 0; i < 2; i++) {
            requests.push(
              axios.post('/api/customers', {
                user_id: userData.userId,
                recipt: receiptNumber,
                spl_id: spl_id,
                name: card.text,
                type: card.type,
                zone: location,
                phone: mobileNumber || null,
                status: false // Assuming default status is false/unsent
              })
            );
            createdRecords.push({
              type: card.type,
              name: card.text,
              spl_id
            });
          }
        } else {
          // Single record for other types
          requests.push(
            axios.post('/api/customers', {
              user_id: userData.userId,
              recipt: receiptNumber,
              spl_id: spl_id,
              name: card.text,
              type: card.type,
              zone: location,
              phone: mobileNumber || null,
              status: false
            })
          );
          createdRecords.push({
            type: card.type,
            name: card.text,
            spl_id
          });
        }
      }

      // Execute all requests
      const responses = await Promise.all(requests);
      console.log('Created records:', responses.map(r => r.data));

      // 3. Refresh the data and show success
      setModalSuccess(true);
      fetchData(); // Refresh the main table data
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        closeEditModal();
      }, 1500);

    } catch (err) {
      console.error('Update error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Failed to update records';
      setModalError(errorMessage);
      
      // If the error occurred after delete but before create,
      // we should refetch data to ensure consistency
      fetchData();
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUsedHissas = calculateTotalHissaWeight();
  const remainingHissas = 7 - totalUsedHissas;

  if (isLoading) {
    return <Shimmer />;
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
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-container">
            <div className="edit-modal-content">
              <div className="edit-modal-header">
                <h2 className="edit-modal-title">
                  Edit Shares for Receipt: <span className="edit-modal-title-receipt">{currentReceipt}</span>
                </h2>
                <button 
                  onClick={closeEditModal}
                  className="edit-modal-close-btn"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="edit-modal-content-inner">
                <div className="edit-modal-input-grid">
                  <select 
                    className="edit-modal-select custom-dropdown"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    {zones.map((zone, index) => (
                      <option key={index} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                  
                  <input 
                    type="text" 
                    placeholder="Enter Receipt Number *" 
                    className="edit-modal-input"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    required
                  />
                  
                  <input 
                    type="text" 
                    placeholder="Enter Mobile Number (Optional)" 
                    className="edit-modal-input"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
                
                <div className="edit-modal-counter">
                  <span className="edit-modal-counter-text">Hissa Usage</span>
                  <span className="edit-modal-counter-value">{totalUsedHissas}/7 Hissas</span>
                </div>

                <div className="edit-modal-cards">
                  {hissaCards.map((card) => {
                    const isPairedCard = card.pairId !== null;
                    const isAqeeqahBoy = card.type === 'aqeeqah_boy';
                    const availableSlotsExcludingThisCard = 7 - (totalUsedHissas - (isAqeeqahBoy && !isPairedCard ? 2 : card.type && !isPairedCard ? 1 : 0));
                    
                    return (
                      <div 
                        key={card.id} 
                        className={`edit-modal-card ${isAqeeqahBoy ? 'aqeeqah-boy-card' : ''} ${isPairedCard ? 'paired-card' : ''}`}
                      >
                        <div className="edit-modal-card-header">
                          <h3 className="edit-modal-card-title">
                            Hissa {card.id} {isPairedCard ? `(Paired with Hissa ${card.pairId})` : ''}
                          </h3>
                          {card.id !== 1 && !isPairedCard && (
                            <button 
                              className="edit-modal-card-remove"
                              onClick={() => removeHissaCard(card.id)}
                              aria-label="Remove Hissa"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        
                        <select 
                          value={card.type}
                          onChange={(e) => handleSelectChange(card.id, e.target.value)}
                          className="edit-modal-card-select custom-dropdown"
                          required
                          disabled={card.isDisabled}
                        >
                          {hissaOptions.map((option, index) => {
                            const isDisabled = option.value === "aqeeqah_boy" && 
                              availableSlotsExcludingThisCard < 2;
                            
                            return (
                              <option 
                                key={index} 
                                value={option.value}
                                disabled={isDisabled || card.isDisabled}
                              >
                                {option.label}
                              </option>
                            );
                          })}
                        </select>
                        
                        <input 
                          type="text" 
                          value={card.text}
                          onChange={(e) => handleTextChange(card.id, e.target.value)}
                          placeholder={card.isDisabled ? "Mirrors paired card" : "Enter name * (Maximum 250 characters)"}
                          className="edit-modal-card-input"
                          maxLength={250}
                          required={!card.isDisabled}
                          disabled={card.isDisabled}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {modalError && (
                  <div className="edit-modal-error">
                    {modalError}
                  </div>
                )}
                {modalSuccess && (
                  <div className="edit-modal-success">
                    Data updated successfully!
                  </div>
                )}
              </div>
              
              <div className="edit-modal-actions">
                <button 
                  className="edit-modal-cancel"
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                {remainingHissas >= 1 && (
                  <button 
                    onClick={addHissaCard} 
                    className="edit-modal-add-btn"
                  >
                    <span>Add Hissa</span>
                  </button>
                )}
                <button 
                  className="edit-modal-save"
                  onClick={handleUpdate}
                  disabled={isSubmitting || hissaCards.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span className="edit-modal-spinner"></span>
                      <span>Updating...</span>
                    </>
                  ) : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your DataTable component remains the same */}
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
            className="export-button flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
          >
            <FileSpreadsheet size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>
      
      <div className="main-table-container rounded-lg shadow overflow-hidden bg-white">
        <div className="table-header p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="font-medium">
            {filteredData.length} Record{filteredData.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="table-container">
            <div className="table-scroll-wrapper">
              <div className="table-heads grid grid-cols-7 bg-gray-100">
                <div className="table-cell cursor-pointer p-3 font-medium" >
                  <span className="flex items-center justify-center gap-1">
                    Sr no.
                  </span>
                </div>
                <div className="table-cell cursor-pointer p-3 font-medium" >
                  <span className="flex items-center justify-center gap-1">
                    Receipt no.
                  </span>
                </div>
                <div className="table-cell cursor-pointer p-3 font-medium" >
                  <span className="flex items-center justify-center gap-1">
                    Name
                  </span>
                </div>
                <div className="table-cell cursor-pointer p-3 font-medium" >
                  <span className="flex items-center justify-center gap-1">
                    Type
                  </span>
                </div>
                <div className="table-cell cursor-pointer p-3 font-medium" >
                  <span className="flex items-center justify-center gap-1">
                    Zone
                  </span>
                </div>
                <div className="table-cell p-3 font-medium">
                  <span className="flex items-center justify-center">
                    Phone
                  </span>
                </div>
                <div className="table-cell p-3 font-medium">
                  <span className="flex items-center justify-center">
                    Actions
                  </span>
                </div>
              </div>
              
              <div className="table-body">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <div className="table-body-item grid grid-cols-7 border-b hover:bg-gray-50" key={index}>
                      <div className="table-cell p-3 text-center">{index + 1}</div>
                      <div className="table-cell p-3 text-center">{item.recipt}</div>
                      <div className="table-cell p-3 text-center">{item.name}</div>
                      <div className="table-cell p-3 text-center">{item.type}</div>
                      <div className="table-cell p-3 text-center">{item.zone}</div>
                      <div className="table-cell p-3 text-center">{item?.phone || '-'}</div>
                      <div className="table-cell p-3 text-center">
                        {item.status ? (
                          <div className="sent-status inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            Sent
                          </div>
                        ) : (
                          <div className="action-buttons flex justify-center space-x-2">
                            <button 
                              className="action-button edit-button p-1 text-blue-500 hover:text-blue-700"
                              onClick={() => openEditModal(item.recipt)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="action-button delete-button p-1 text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(item.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 col-span-7">
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