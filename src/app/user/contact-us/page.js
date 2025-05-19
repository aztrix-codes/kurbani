'use client'
import React, { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import './style.css'
import { useRouter } from 'next/navigation';

function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const router = useRouter() 
  
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (
        userData &&
        userData.userId === 0 &&
        userData.isAuthenticated === false &&
        userData.status === 0
      ) {
        router.replace('/auth/user');
      }
    }, [router]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form data submitted:', formData);
    
    // Show success message
    setFormSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="contact-container">
      <div className="contact-wrapper">


        {/* Main Content */}
        <div className="contact-content">
          {/* Contact Information */}
          <div className="contact-info">
            {/* Qurbani Issues */}
            <div className="contact-section">
              <h2>Qurbani Issues</h2>
              <div className="contact-item">
                <Phone className="contact-icon" size={20} />
                <div className="contact-details">
                  <div className="contact-name">Ilyas Razvi</div>
                  <div className="contact-value">+918291110603</div>
                </div>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" size={20} />
                <div className="contact-details">
                  <div className="contact-name">Imran Rathod</div>
                  <div className="contact-value">+919324896595</div>
                </div>
              </div>
            </div>

            {/* Technical Issues */}
            <div className="contact-section">
              <h2>Technical Issues</h2>
              <div className="contact-item">
                <Phone className="contact-icon" size={20} />
                <div className="contact-details">
                  <div className="contact-name">Faraz Shaikh</div>
                  <div className="contact-value">+919833401654</div>
                </div>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" size={20} />
                <div className="contact-details">
                  <div className="contact-name">Asad Khan</div>
                  <div className="contact-value">+918080859144</div>
                </div>
              </div>
            </div>

            {/* Additional Contact Methods */}
            <div className="contact-methods">
              <div className="contact-method">
                <Mail className="method-icon" size={20} />
                <div className="method-info">
                  <h3>Email Us</h3>
                  <p>info@example.com</p>
                </div>
              </div>
              <div className="contact-method">
                <MapPin className="method-icon" size={20} />
                <div className="method-info">
                  <h3>Location</h3>
                  <p>Mumbai, India</p>
                </div>
              </div>
              <div className="contact-method">
                <Clock className="method-icon" size={20} />
                <div className="method-info">
                  <h3>Office Hours</h3>
                  <p>Mon-Fri: 9am-5pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <h2>Send us a message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              {formSubmitted ? (
                <div className="form-success">
                  <CheckCircle size={50} className="success-icon" />
                  <h3>Message Sent!</h3>
                  <p>We will get back to you as soon as possible.</p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Your Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="form-input" 
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="form-input" 
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="form-input" 
                      placeholder="Enter subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea 
                      id="message" 
                      className="form-input" 
                      placeholder="Enter your message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="submit-btn">
                    <Send size={18} style={{ marginRight: '8px' }} />
                    Send Message
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
        <div className="contact-footer">
          © {new Date().getFullYear()} All Rights Reserved.
        </div>
      </div>
    </div>
  )
}

export default ContactPage