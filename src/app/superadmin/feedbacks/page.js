'use client'
import React, { useState, useEffect } from 'react';
import './feedback-styles.css';

function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [notification, setNotification] = useState("null");

  // Fetch all feedbacks
  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }
      const data = await response.json();
      setFeedbacks(data.feedback || []);
      setError(null);
    } catch (err) {
      setError('Error loading feedbacks. Please try again later.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a feedback
  const deleteFeedback = async (id) => {
    try {
      const response = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }
      
      // Remove the deleted feedback from state
      setFeedbacks(feedbacks.filter(feedback => feedback.id !== id));
      
      // Show success notification
      showNotification('Feedback deleted successfully');
      
      // Close the modal
      setShowDeleteModal(false);
    } catch (err) {
      showNotification('Error deleting feedback', 'error');
      console.error('Delete error:', err);
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Open delete confirmation modal
  const openDeleteModal = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedFeedback(null);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Load feedbacks on component mount
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Shimmer loading UI
  const renderShimmerUI = () => {
    return (
      <div className="shimmer-container">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div className="shimmer-card" key={item}>
            <div className="shimmer-header">
              <div className="shimmer-username"></div>
              <div className="shimmer-date"></div>
            </div>
            <div className="shimmer-content">
              <div className="shimmer-line"></div>
              <div className="shimmer-line"></div>
              <div className="shimmer-line"></div>
            </div>
            <div className="shimmer-actions">
              <div className="shimmer-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Empty state UI
  const renderEmptyState = () => {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3>No Feedback Available</h3>
        <p>There are currently no feedback submissions to display. New feedback will appear here when users submit it.</p>
      </div>
    );
  };

  return (
    <div className="feedback-container">
      <header className="feedback-header">
        <h1>Feedback Management</h1>
        <button 
          className="refresh-button"
          onClick={fetchFeedbacks}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isLoading ? (
        renderShimmerUI()
      ) : (
        <>
          {feedbacks.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="feedback-list">
              {feedbacks.map((feedback) => (
                <div className="feedback-card" key={feedback.id}>
                  <div className="feedback-header">
                    <h3 className="username">{feedback.username}</h3>
                    <span className="date">{formatDate(feedback.created_at)}</span>
                  </div>
                  <p className="feedback-content">{feedback.feedback}</p>
                  <div className="feedback-actions">
                    <button 
                      className="delete-button"
                      onClick={() => openDeleteModal(feedback)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedFeedback && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button 
                className="close-button"
                onClick={closeDeleteModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this feedback from <strong>{selectedFeedback.username}</strong>?</p>
              <div className="feedback-preview">
                &quot;{selectedFeedback.feedback}&quot;
              </div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={() => deleteFeedback(selectedFeedback.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default FeedbackPage;
