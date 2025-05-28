'use client'
import React, { useState, useEffect } from 'react';
import './style.css';

function UserFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Form state
  const [username, setUsername] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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

  // Submit new feedback
  const submitFeedback = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    if (!feedbackText.trim()) {
      errors.feedback = 'Feedback is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          feedback: feedbackText.trim()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      // Reset form
      setUsername('');
      setFeedbackText('');
      
      // Show success notification
      showNotification('Feedback submitted successfully');
      
      // Refresh feedbacks
      fetchFeedbacks();
      
    } catch (err) {
      showNotification('Error submitting feedback', 'error');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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
        {[1, 2, 3, 4].map((item) => (
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
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="user-feedback-container">
      <div className="feedback-page-content">
        {/* Feedback List Section - Left Side */}
        <section className="feedback-list-section">
          <div className="list-header">
            <h2>Recent Feedback</h2>
            <button 
              className="refresh-icon-button"
              onClick={fetchFeedbacks}
              disabled={isLoading}
              title="Refresh feedbacks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
              </svg>
              {isLoading && <span className="loading-dot-animation"></span>}
            </button>
          </div>
          
          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}
          
          {isLoading ? (
            renderShimmerUI()
          ) : (
            <>
              {feedbacks.length === 0 ? (
                <div className="empty-feedback">
                  <div className="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p>No feedback has been submitted yet.</p>
                  <p>Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="feedback-cards">
                  {feedbacks.map((feedback) => (
                    <div className="feedback-card" key={feedback.id}>
                      <div className="feedback-card-header">
                        <h3 className="feedback-username">{feedback.username}</h3>
                        <span className="feedback-date">{formatDate(feedback.created_at)}</span>
                      </div>
                      <p className="feedback-text">{feedback.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
        
        {/* Feedback Form Section - Right Side */}
        <section className="feedback-form-section">
          <div className="form-container">
            <h2>Share Your Feedback</h2>
            <p className="form-description">
              We value your opinion! Please share your thoughts, suggestions, or concerns with us.
            </p>
            
            <form onSubmit={submitFeedback} className="feedback-form">
              <div className="form-group">
                <label htmlFor="username">Your Name</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className={formErrors.username ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {formErrors.username && <span className="error-message">{formErrors.username}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="feedback">Your Feedback</label>
                <textarea
                  id="feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter your feedback here..."
                  rows="5"
                  className={formErrors.feedback ? 'error' : ''}
                  disabled={isSubmitting}
                ></textarea>
                {formErrors.feedback && <span className="error-message">{formErrors.feedback}</span>}
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </section>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default UserFeedbackPage;
