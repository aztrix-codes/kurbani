'use client'

import { useEffect, useState } from 'react';
import './style.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const hissaOptions = [
  { value: "", label: "SELECT" },
  { value: "qurbani", label: "Qurbani" },
  { value: "aqeeqah_boy", label: "Aqeeqah (Boy - 02 Hissa)", hissaCount: 2 },
  { value: "aqeeqah_girl", label: "Aqeeqah (Girl - 01 Hissa)", hissaCount: 1 }
];

export default function QurbaniApp() {
  // Each card now tracks its own hissaWeight (how many hissas it counts as)
  const [hissaCards, setHissaCards] = useState([{ id: 1, type: "", text: "", hissaWeight: 0 }]);
  const [location, setLocation] = useState("Out Of Mumbai");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  const [zones, setZones] = useState(['Out of Mumbai', 'Mumbai'])
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (
      userData.userId === 0 &&
      userData.isAuthenticated === false &&
      userData.status === 0
    ) {
      router.replace('/auth/user');
    }
    
  }, [router]);

  // Generate spl_id based on name and timestamp
  const generateSplId = (name) => {
    if (!name) return "";
    const numericalName = name.toUpperCase().split('').map(char => {
      const code = char.charCodeAt(0) - 65;
      return code >= 0 && code <= 25 ? code : '';
    }).join('');
    const timestamp = Math.floor(Date.now() / 1000);
    return `${numericalName}_${timestamp}`;
  };

  // Calculate total used hissa weight
  const calculateTotalHissaWeight = () => {
    return hissaCards.reduce((total, card) => {
      return total + (card.type === "aqeeqah_boy" ? 2 : card.type ? 1 : 0);
    }, 0);
  };

  // Calculate number of remaining cards allowed
  const calculateRemainingCardSlots = () => {
    const totalWeight = calculateTotalHissaWeight();
    return 7 - totalWeight;
  };

  const addHissaCard = () => {
    // Check if we can add one more regular card
    if (calculateRemainingCardSlots() >= 1) {
      const newId = hissaCards.length + 1;
      setHissaCards([...hissaCards, { id: newId, type: "qurbani", text: "", hissaWeight: 1 }]);
    } else {
      setError("Cannot add more hissas. Maximum of 7 hissas allowed.");
    }
  };

  const handleSelectChange = (id, value) => {
    const updatedCards = [...hissaCards];
    const cardIndex = updatedCards.findIndex(card => card.id === id);
    const currentType = updatedCards[cardIndex].type;
    
    // Calculate current total weight
    const currentTotalWeight = calculateTotalHissaWeight();
    
    // Calculate weight difference if we change this card's type
    const currentCardWeight = currentType === "aqeeqah_boy" ? 2 : currentType ? 1 : 0;
    const newCardWeight = value === "aqeeqah_boy" ? 2 : value ? 1 : 0;
    const weightDifference = newCardWeight - currentCardWeight;
    
    // Check if the change would exceed the 7-hissa limit
    if (currentTotalWeight + weightDifference > 7) {
      setError("Cannot add more hissas. Maximum of 7 hissas allowed.");
      return;
    }
    
    // Update the card's type and weight
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      type: value,
      hissaWeight: newCardWeight
    };
    
    setHissaCards(updatedCards);
    setError(null); // Clear any errors
  };

  const handleTextChange = (id, text) => {
    const updatedCards = [...hissaCards];
    const cardIndex = updatedCards.findIndex(card => card.id === id);
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      text: text
    };
    setHissaCards(updatedCards);
  };

  const removeHissaCard = (id) => {
    // Don't allow removing the first card
    if (id === 1 || hissaCards.length === 1) return;
    
    // Remove the card and reindex the remaining cards
    const filteredCards = hissaCards
      .filter(card => card.id !== id)
      .map((card, index) => ({
        ...card,
        id: index + 1
      }));
    
    setHissaCards(filteredCards);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      // Validate at least one card exists
      if (hissaCards.length === 0) {
        throw new Error('At least one hissa card is required');
      }

      // Validate required fields
      if (!receiptNumber) {
        throw new Error('Receipt number is required');
      }

      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.userId) {
        throw new Error('User not authenticated');
      }

      // Filter out empty cards
      const validCards = hissaCards.filter(card => card.type && card.text.trim());
      
      if (validCards.length === 0) {
        throw new Error('At least one valid hissa with type and name is required');
      }

      // Prepare data for each card
      const requests = [];
  
      validCards.forEach(card => {
        // Generate a single spl_id for this card
        const spl_id = generateSplId(card.text);
        
        // For aqeeqah_boy (which counts as 2 hissas), send two identical requests
        if (card.type === "aqeeqah_boy") {
          // First request
          requests.push(
            axios.post('/api/customers', {
              user_id: userData.userId,
              recipt: receiptNumber,
              spl_id: spl_id,
              name: card.text,
              type: card.type,
              zone: location,
              phone: mobileNumber || null
            })
          );
          
          // Second request (same data, represents second hissa)
          requests.push(
            axios.post('/api/customers', {
              user_id: userData.userId,
              recipt: receiptNumber,
              spl_id: spl_id,
              name: card.text,
              type: card.type,
              zone: location,
              phone: mobileNumber || null
            })
          );
        } else {
          // For other types, send just one request
          requests.push(
            axios.post('/api/customers', {
              user_id: userData.userId,
              recipt: receiptNumber,
              spl_id: spl_id,
              name: card.text,
              type: card.type,
              zone: location,
              phone: mobileNumber || null
            })
          );
        }
      });

      // Send all requests
      await Promise.all(requests);
      
      setSuccess(true);
      // Reset form after successful submission
      setHissaCards([{ id: 1, type: "qurbani", text: "", hissaWeight: 1 }]);
      setReceiptNumber("");
      setMobileNumber("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error submitting data:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total used hissas for display
  const totalUsedHissas = calculateTotalHissaWeight();
  const remainingHissas = 7 - totalUsedHissas;

  return (
    <div className="app-container">   
      <main className="main-content">
        <div className="header-section">
          <h2>Add Shares</h2>
          {/* Only show Add Hissa button if we have room for at least one more regular hissa */}
          {remainingHissas >= 1 && (
            <button onClick={addHissaCard} className="button add-button">
              Add Hissa
            </button>
          )}
        </div>
        
        <div className="input-section">
          <select 
            className="form-input location-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
          >
            {isLoading ? (
              <option>Loading zones...</option>
            ) : zones.length > 0 ? (
              zones.map((zone,index) => (
                <option key={index} value={zone}>
                  {zone}
                </option>
              ))
            ) : (
              <option value="">No zones available</option>
            )}
          </select>
          
          <input 
            type="text" 
            placeholder="Enter Receipt Number *" 
            className="form-input receipt-input"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            required
          />
          
          <input 
            type="text" 
            placeholder="Enter Mobile Number (Optional)" 
            className="form-input mobile-input"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
        </div>
        
        <div className="hissa-counter">
          <span>Used: {totalUsedHissas}/7 Hissas</span>
        </div>
        
        <div className="cards-container">
          {hissaCards.map((card) => {
            const isAqeeqahBoy = card.type === 'aqeeqah_boy';
            // Calculate how many slots would be available if this card's weight was removed
            const availableSlotsExcludingThisCard = 7 - (totalUsedHissas - (isAqeeqahBoy ? 2 : card.type ? 1 : 0));
            
            return (
              <div key={card.id} className={`hissa-card ${isAqeeqahBoy ? 'double-hissa' : ''}`}>
                <div className="hissa-card-header">
                  <h3>
                    Hissa {card.id} {isAqeeqahBoy ? '(Counts as 2)' : ''}
                  </h3>
                  {card.id !== 1 && (
                    <button 
                      className="close-button"
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
                  className="form-input"
                  required
                >
                  {hissaOptions.map((option, index) => {
                    // Disable aqeeqah_boy option if selecting it would exceed limit
                    // Consider this card's current weight when calculating if there's enough room
                    const isDisabled = option.value === "aqeeqah_boy" && 
                      availableSlotsExcludingThisCard < 2;
                    
                    return (
                      <option 
                        key={index} 
                        value={option.value}
                        disabled={isDisabled}
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
                  placeholder="Enter name * (Maximum 250 characters)" 
                  className="form-input"
                  maxLength={250}
                  required
                />
              </div>
            );
          })}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Data saved successfully!</div>}
        
        <div className="save-section">
          <button 
            className="button save-button"
            onClick={handleSubmit}
            disabled={isSubmitting || hissaCards.length === 0}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                <span>Saving...</span>
              </>
            ) : 'Save'}
          </button>
        </div>
      </main>
    </div>
  );
}