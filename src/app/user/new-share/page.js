'use client'

import { useEffect, useState } from 'react';
import './style.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const hissaOptions = [
  { value: "", label: "SELECT" },
  { value: "qurbani", label: "Qurbani" },
  { value: "aqeeqah_boy", label: "Aqeeqah (Boy)" },
  { value: "aqeeqah_girl", label: "Aqeeqah (Girl)" }
];

export default function QurbaniApp() {
  const [hissaCards, setHissaCards] = useState([{ id: 1, type: "", text: "", isDisabled: false, pairId: null }]);
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

  const generateSplId = (name) => {
    if (!name) return "";
    const numericalName = name.toUpperCase().split('').map(char => {
      const code = char.charCodeAt(0) - 65;
      return code >= 0 && code <= 25 ? code : '';
    }).join('');
    const timestamp = Math.floor(Date.now() / 1000);
    return `${numericalName}_${timestamp}`;
  };

  const calculateTotalHissaWeight = () => {
    return hissaCards.reduce((total, card) => {
      if (card.pairId !== null && !card.isDisabled) return total; // Skip the paired card to avoid double counting
      return total + (card.type === "aqeeqah_boy" ? 1 : card.type ? 1 : 0);
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
      setError("Cannot add more hissas. Maximum of 7 hissas allowed.");
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
        setError("Cannot add more hissas. Maximum of 7 hissas allowed.");
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
      
      setError(null);
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

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

      // Filter out empty cards and only include primary cards (not disabled pairs)
      const validCards = hissaCards.filter(card => 
        card.type && card.text.trim() && !card.isDisabled
      );
      
      if (validCards.length === 0) {
        throw new Error('At least one valid hissa with type and name is required');
      }

      const requests = [];
  
      validCards.forEach(card => {
        const spl_id = generateSplId(card.text);
        
        if (card.type === "aqeeqah_boy") {
          // Send two identical requests for aqeeqah boy
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

      await Promise.all(requests);
      
      setSuccess(true);
      setHissaCards([{ id: 1, type: "", text: "", isDisabled: false, pairId: null }]);
      setReceiptNumber("");
      setMobileNumber("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error submitting data:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUsedHissas = calculateTotalHissaWeight();
  const remainingHissas = 7 - totalUsedHissas;

  return (
    <div className="app-container">   
      <main className="main-content">
        <div className="header-section">
          <h2>Add Shares</h2>
          {remainingHissas >= 1 && (
            <button onClick={addHissaCard} className="button add-button">
              Add Hissa
            </button>
          )}
        </div>
        
        <div className="input-section">
          <select 
            className="form-input location-input custom-dropdown"
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
            const isPairedCard = card.pairId !== null;
            const isAqeeqahBoy = card.type === 'aqeeqah_boy';
            
            return (
              <div 
                key={card.id} 
                className={`hissa-card ${isAqeeqahBoy ? 'aqeeqah-boy-card' : ''} ${isPairedCard ? 'paired-card' : ''}`}
              >
                <div className="hissa-card-header">
                  <h3>
                    Hissa {card.id} {isPairedCard ? `(Paired with Hissa ${card.pairId})` : ''}
                  </h3>
                  {card.id !== 1 && !isPairedCard && (
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
                  className="form-input custom-dropdown"
                  required
                  disabled={card.isDisabled}
                >
                  {hissaOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <input 
                  type="text" 
                  value={card.text}
                  onChange={(e) => handleTextChange(card.id, e.target.value)}
                  placeholder={card.isDisabled ? "Mirrors paired card" : "Enter name * (Maximum 250 characters)"}
                  className="form-input"
                  maxLength={250}
                  required={!card.isDisabled}
                  disabled={card.isDisabled}
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