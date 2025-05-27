'use client'

import { useEffect, useState } from 'react';
import './style.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const hissaOptions = [
  { value: "Qurbani", label: "Qurbani" },
  { value: "Aqeeqah (Boy)", label: "Aqeeqah (Boy)" },
  { value: "Aqeeqah (Girl)", label: "Aqeeqah (Girl)" }
];

export default function QurbaniApp() {
  const [hissaCards, setHissaCards] = useState([{ id: 1, type: "Qurbani", text: "", isDisabled: false, pairId: null }]);
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
    if(userData.isAuthenticated) {
        if (userData.m && userData.oom) {
        setZones(['Out of Mumbai', 'Mumbai']);
        setLocation('Out of Mumbai'); 
      } else if (userData.m) {
        setZones(['Mumbai']);
        setLocation('Mumbai');
      } else {
        setZones(['Out of Mumbai']);
        setLocation('Out of Mumbai');
      }
    } else{
      router.replace('/');
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
      if (card.pairId !== null && card.isDisabled) return total; // Skip paired cards
      return total + (card.type === "Aqeeqah (Boy)" ? 2 : card.type ? 1 : 0);
    }, 0);
  };

  const calculateRemainingCardSlots = () => {
    const totalWeight = calculateTotalHissaWeight();
    return 7 - totalWeight;
  };

  // Helper function to reorder cards so paired cards appear right after their parent and reassign IDs
  const reorderCards = (cards) => {
    const result = [];
    const processedIds = new Set();
    let currentId = 1;
    
    // First, sort cards by their original ID to maintain relative order
    const sortedCards = [...cards].sort((a, b) => {
      // If one is a pair of the other, handle specially
      if (a.pairId === b.id) return 1;
      if (b.pairId === a.id) return -1;
      return a.id - b.id;
    });
    
    sortedCards.forEach(card => {
      if (processedIds.has(card.id)) return;
      
      // Add the main card with new sequential ID
      if (!card.isDisabled) {
        const newMainCard = { ...card, id: currentId };
        result.push(newMainCard);
        processedIds.add(card.id);
        
        // If this card has a pair, add it right after with next sequential ID
        const pairedCard = cards.find(c => c.pairId === card.id);
        if (pairedCard) {
          const newPairedCard = { 
            ...pairedCard, 
            id: currentId + 1, 
            pairId: currentId 
          };
          result.push(newPairedCard);
          processedIds.add(pairedCard.id);
          currentId += 2; // Skip 2 IDs since we used currentId and currentId + 1
        } else {
          currentId += 1; // Skip 1 ID
        }
      }
    });
    
    return result;
  };

  const addHissaCard = () => {
    // Calculate remaining slots including cards without type selected
    const totalCards = hissaCards.filter(card => !card.isDisabled).length;
    const remainingSlots = calculateRemainingCardSlots();
    
    if (remainingSlots >= 1 && totalCards < 7) {
      const newId = hissaCards.length > 0 ? Math.max(...hissaCards.map(c => c.id)) + 1 : 1;
      setHissaCards(prevCards => {
        const newCards = [...prevCards, { id: newId, type: "Qurbani", text: "", isDisabled: false, pairId: null }];
        return reorderCards(newCards);
      });
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
      const currentWeight = currentCard.type === "Aqeeqah (Boy)" ? 2 : currentCard.type ? 1 : 0;
      const newWeight = value === "Aqeeqah (Boy)" ? 2 : value ? 1 : 0;
      
      // Calculate total weight excluding the current card
      const totalWeightExcludingCurrent = updatedCards.reduce((total, card) => {
        if (card.id === id || (card.pairId !== null && card.isDisabled)) return total;
        return total + (card.type === "Aqeeqah (Boy)" ? 2 : card.type ? 1 : 0);
      }, 0);
      
      // Special case: If changing to Aqeeqah (Boy) and total weight would exceed 7
      if (value === "Aqeeqah (Boy)" && totalWeightExcludingCurrent + newWeight > 7) {
        // Get non-disabled cards sorted by ID
        const nonDisabledCards = updatedCards.filter(card => !card.isDisabled).sort((a, b) => a.id - b.id);
        
        // If we have exactly 7 non-disabled cards
        if (nonDisabledCards.length === 7) {
          // Find the position of the current card among non-disabled cards
          const currentCardPosition = nonDisabledCards.findIndex(card => card.id === id);
          
          // If this is the 6th card (index 5), remove the 7th card (index 6)
          if (currentCardPosition === 5) {
            const seventhCard = nonDisabledCards[6];
            
            // Remove the 7th card and any of its pairs from the original cards
            let finalCards = updatedCards.filter(card => 
              card.id !== seventhCard.id && card.pairId !== seventhCard.id
            );
            
            // Update the current card (6th card) to Aqeeqah (Boy)
            finalCards = finalCards.map(card => {
              if (card.id === id) {
                return { ...card, type: value, text: card.text };
              }
              return card;
            });
            
            // Add the paired card for the current card
            const newPairCard = {
              id: id + 0.1, // Temporary ID to ensure it gets placed after the main card
              type: value,
              text: currentCard.text,
              isDisabled: true,
              pairId: id
            };
            finalCards.push(newPairCard);
            
            setError(null);
            return reorderCards(finalCards);
          }
        }
        
        setError("Cannot add more hissas. Maximum of 7 hissas allowed.");
        return prevCards;
      }
      
      // Regular case: check if we have space
      if (totalWeightExcludingCurrent + newWeight > 7) {
        setError("Cannot add more hissas. Maximum of 7 hissas allowed.");
        return prevCards;
      }
      
      // Update the main card
      updatedCards[cardIndex] = {
        ...currentCard,
        type: value,
        text: currentCard.text
      };
      
      // If changing to Aqeeqah (Boy), add a paired disabled card
      if (value === "Aqeeqah (Boy)") {
        const newPairCard = {
          id: id + 0.1, // Temporary ID to ensure it gets placed after the main card
          type: value,
          text: currentCard.text,
          isDisabled: true,
          pairId: id
        };
        updatedCards.push(newPairCard);
      }
      
      setError(null);
      return reorderCards(updatedCards);
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
      // Remove both the card and its pair if exists
      const cardsToKeep = prevCards.filter(card => 
        card.id !== id && card.pairId !== id
      );
      
      // Reorder and reassign IDs
      return reorderCards(cardsToKeep);
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
      // Sort by ID to ensure proper order for API calls
      const validCards = hissaCards
        .filter(card => card.type && card.text.trim() && !card.isDisabled)
        .sort((a, b) => a.id - b.id);
      
      if (validCards.length === 0) {
        throw new Error('At least one valid hissa with type and name is required');
      }

      const requests = [];
  
      validCards.forEach(card => {
        const spl_id = generateSplId(card.text);
        
        if (card.type === "Aqeeqah (Boy)") {
          // Send two identical requests for aqeeqah boy in sequence
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

      // Execute requests sequentially to maintain order
      for (const request of requests) {
        await request;
      }
      
      setSuccess(true);
      setHissaCards([{ id: 1, type: "Qurbani", text: "", isDisabled: false, pairId: null }]);
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

  // Reorder cards for display
  const orderedCards = reorderCards(hissaCards);

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
          {orderedCards.map((card) => {
            const isPairedCard = card.pairId !== null;
            const isAqeeqahBoy = card.type === 'Aqeeqah (Boy)';
            
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