'use client'

import { useState } from 'react';
import './style.css';

const hissaOptions = [
  { value: "", label: "SELECT" },
  { value: "qurbani", label: "Qurbani" },
  { value: "aqeeqah_boy", label: "Aqeeqah (Boy - 02 Hissa)", hissaCount: 2 },
  { value: "aqeeqah_girl", label: "Aqeeqah (Girl - 01 Hissa)", hissaCount: 1 }
];

export default function QurbaniApp() {
  const [hissaCards, setHissaCards] = useState([
    { id: 1, type: "", text: "" }
  ]);

  const addHissaCard = () => {
    if (hissaCards.length < 7) {
      const newId = hissaCards.length + 1;
      setHissaCards([...hissaCards, { id: newId, type: "", text: "" }]);
    }
  };

  const updateHissaCard = (id, field, value) => {
    setHissaCards(hissaCards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const handleSelectChange = (id, value) => {
    updateHissaCard(id, 'type', value);
    
    const selectedOption = hissaOptions.find(option => option.value === value);
    
    if (selectedOption && selectedOption.hissaCount) {
      const currentCardIndex = hissaCards.findIndex(card => card.id === id);
      const currentCount = hissaCards.length;
      const requiredCount = currentCardIndex + selectedOption.hissaCount;
      
      if (requiredCount <= 7) {
        if (requiredCount > currentCount) {
          const newCards = [];
          for (let i = currentCount + 1; i <= requiredCount; i++) {
            newCards.push({ id: i, type: "", text: "" });
          }
          setHissaCards([...hissaCards, ...newCards]);
        } else if (requiredCount < currentCount) {
          setHissaCards(hissaCards.slice(0, requiredCount));
        }
      }
    }
  };

  const removeHissaCard = (id) => {
    // Don't allow removing the first card
    if (id === 1 || hissaCards.length === 1) return;
    
    // Remove the card and renumber the remaining cards
    const filteredCards = hissaCards.filter(card => card.id !== id);
    const renumberedCards = filteredCards.map((card, index) => ({
      ...card,
      id: index + 1
    }));
    
    setHissaCards(renumberedCards);
  };

  const getAvailableOptions = (cardId) => {
    if (hissaCards.length >= 7 && cardId === hissaCards.length) {
      return hissaOptions.filter(option => !option.hissaCount || option.hissaCount === 1);
    }
    
    return hissaOptions.filter(option => {
      if (!option.hissaCount) return true;
      const cardIndex = hissaCards.findIndex(card => card.id === cardId);
      return cardIndex + option.hissaCount <= 7;
    });
  };

  return (
    <div className="app-container">   
      <main className="main-content">
        <div className="header-section">
          <h2>Add Shares</h2>
          {hissaCards.length < 7 && (
            <button onClick={addHissaCard} className="button add-button">
              Add Hissa
            </button>
          )}
        </div>
        
        <div className="input-section">
          <select className="form-input location-input">
            <option>Out Of Mumbai</option>
            <option>In Mumbai</option>
          </select>
          
          <input 
            type="text" 
            placeholder="Enter Receipt Number" 
            className="form-input receipt-input"
          />
          
          <input 
            type="text" 
            placeholder="Enter Mobile Number (Optional)" 
            className="form-input mobile-input"
          />
        </div>
        
        <div className="cards-container">
          {hissaCards.map((card) => (
            <div key={card.id} className="hissa-card">
              <div className="hissa-card-header">
                <h3>Hissa {card.id}</h3>
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
              >
                {getAvailableOptions(card.id).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <input 
                type="text" 
                value={card.text}
                onChange={(e) => updateHissaCard(card.id, 'text', e.target.value)}
                placeholder="Maximum character limit is 250" 
                className="form-input"
                maxLength={250}
              />
            </div>
          ))}
        </div>
        
        <div className="save-section">
          <button className="button save-button">
            Save
          </button>
        </div>
      </main>
      
    </div>
  );
}