'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Search, X, FileText, Check } from 'lucide-react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './style.css';
import Shimmer from '@/app/Shimmer';

export default function InvoicePage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData?.userId === 0 && !userData?.isAuthenticated) {
      router.replace('/');
    } else {
      fetchReceipts();
    }
  }, [router]);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await axios.get(`/api/receipt?user_id=${userData.userId}`);
      
      if (Array.isArray(response.data)) {
        setReceipts(response.data);
        setFilteredReceipts(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setReceipts([]);
        setFilteredReceipts([]);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setReceipts([]);
      setFilteredReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const results = receipts.filter(receipt => 
      (receipt.id && receipt.id.toString().includes(searchTerm.toLowerCase())) ||
      (receipt.zone && receipt.zone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (receipt.area && receipt.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (receipt.purpose && receipt.purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (receipt.paid_by && receipt.paid_by.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (receipt.created_at && receipt.created_at.includes(searchTerm))
    );
    setFilteredReceipts(results);
  }, [searchTerm, receipts]);

  // Function to show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Direct download function without opening modal
  const directDownloadReceipt = async (receipt) => {
    showNotification('Generating PDF...');
    
    // Create a temporary hidden modal for PDF generation with fixed width
    const tempModal = document.createElement('div');
    tempModal.style.position = 'absolute';
    tempModal.style.left = '-9999px';
    tempModal.style.top = '-9999px';
    tempModal.style.width = '800px'; // Fixed width to match CSS
    tempModal.innerHTML = `
      <div class="receipt-preview" id="tempReceiptPreview">
        <div class="receipt-header">
          <h1 class="receipt-title">Qurbani Management System</h1>
          <h2 class="receipt-subtitle">RECEIPT</h2>
        </div>
        
        <div class="receipt-details">
          <div>
            <p><strong>Receipt #:</strong> ${receipt.id}</p>
            <p><strong>Date:</strong> ${new Date(receipt.created_at).toLocaleDateString()}</p>
            <p><strong>Zone:</strong> ${receipt.zone}</p>
            <p><strong>Area:</strong> ${receipt.area}</p>
          </div>
          <div>
            <p><strong>Purpose:</strong> ${receipt.purpose}</p>
            <p><strong>Paid By:</strong> ${receipt.paid_by}</p>
            <p><strong>Received By:</strong> ${receipt.received_by}</p>
          </div>
        </div>
        
        <div class="receipt-table-container">
          <div class="receipt-table">
            <div class="receipt-table-header">
              <div class="receipt-header-cell">Description</div>
              <div class="receipt-header-cell text-right">Quantity</div>
              <div class="receipt-header-cell text-right">Rate</div>
              <div class="receipt-header-cell text-right">Amount</div>
            </div>
            <div class="receipt-table-body">
              <div class="receipt-table-row">
                <div class="receipt-table-cell">Qurbani Share</div>
                <div class="receipt-table-cell text-right">${receipt.quantity}</div>
                <div class="receipt-table-cell text-right">₹${receipt.rate}</div>
                <div class="receipt-table-cell text-right">₹${receipt.net_total}</div>
              </div>
            </div>
            <div class="receipt-table-footer">
              <div class="receipt-footer-cell" style="text-align: right; flex: 3">Total:</div>
              <div class="receipt-footer-cell text-right">₹${receipt.net_total}</div>
            </div>
          </div>
        </div>
        
        <div class="receipt-footer">
          <p>Thank you for your payment!</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(tempModal);
    
    try {
      // Use HTML2Canvas to capture the receipt
      const receiptElement = document.getElementById('tempReceiptPreview');
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Create PDF using jsPDF - use fixed dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`receipt_${receipt.id}.pdf`);
      
      // Update notification
      showNotification('PDF Downloaded Successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('Error generating PDF. Please try again.', 'error');
    } finally {
      // Clean up
      document.body.removeChild(tempModal);
    }
  };

  // Original download function for modal view
  const downloadReceipt = async () => {
    if (!selectedReceipt) return;
    
    const receiptElement = document.getElementById('receiptPreview');
    
    try {
      // Hide buttons during capture
      const modalActions = document.querySelector('.modal-actions');
      const modalHeader = document.querySelector('.modal-header');
      const originalModalStyle = modalActions.style.display;
      const originalHeaderStyle = modalHeader.style.display;
      
      modalActions.style.display = 'none';
      modalHeader.style.display = 'none';
      
      showNotification('Generating PDF...');
      
      // Use HTML2Canvas to capture the receipt
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Restore buttons
      modalActions.style.display = originalModalStyle;
      modalHeader.style.display = originalHeaderStyle;
      
      // Create PDF using jsPDF - use fixed dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`receipt_${selectedReceipt.id}.pdf`);
      
      // Update notification
      showNotification('PDF Downloaded Successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('Error generating PDF. Please try again.', 'error');
    }
  };

  const viewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
  };

  if (isLoading) {
    return <Shimmer />;
  }

  return (
    <div className="container">
      <div className="search-container">
        <div className="search-input-container">
          <Search className="search-icon" size={22} />
          <input
            type="text"
            placeholder="Search receipts..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <div className="table">
            {/* Fixed Header */}
            <div className="table-header">
              <div className="header-cell" data-column="receipt">Receipt</div>
              <div className="header-cell" data-column="date">Date</div>
              <div className="header-cell" data-column="zone">Zone</div>
              <div className="header-cell" data-column="area">Area</div>
              <div className="header-cell" data-column="purpose">Purpose</div>
              <div className="header-cell" data-column="quantity">Quantity</div>
              <div className="header-cell" data-column="rate">Rate</div>
              <div className="header-cell" data-column="total">Total</div>
              <div className="header-cell" data-column="view">View</div>
              <div className="header-cell" data-column="download">Download</div>
            </div>
            
            {/* Scrollable Body */}
            <div className="table-body">
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => (
                  <div className="table-row" key={receipt.id}>
                    <div className="table-cell" data-column="receipt">{receipt.id}</div>
                    <div className="table-cell" data-column="date">{new Date(receipt.created_at).toLocaleDateString()}</div>
                    <div className="table-cell" data-column="zone">{receipt.zone}</div>
                    <div className="table-cell" data-column="area">{receipt.area}</div>
                    <div className="table-cell" data-column="purpose">{receipt.purpose}</div>
                    <div className="table-cell" data-column="quantity">{receipt.quantity}</div>
                    <div className="table-cell" data-column="rate">₹{receipt.rate}</div>
                    <div className="table-cell" data-column="total">₹{receipt.net_total}</div>
                    <div className="table-cell" data-column="view">
                      <FileText 
                        className="action-icon view-icon" 
                        size={24} 
                        onClick={() => viewReceipt(receipt)} 
                        title="View Receipt"
                      />
                    </div>
                    <div className="table-cell" data-column="download">
                      <Download 
                        className="action-icon download-icon" 
                        size={24} 
                        onClick={() => directDownloadReceipt(receipt)} 
                        title="Download PDF"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-row">
                  <div className="table-cell" style={{flex: 1, textAlign: 'center', padding: '20px', fontSize: '18px'}}>
                    {searchTerm ? 'No matching receipts found' : 'No receipts available'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedReceipt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Receipt Preview</h2>
              <X 
                className="modal-close" 
                size={30} 
                onClick={() => setSelectedReceipt(null)} 
              />
            </div>
            
            <div className="receipt-preview" id="receiptPreview">
              <div className="receipt-header">
                <h1 className="receipt-title">Qurbani Management System</h1>
                <h2 className="receipt-subtitle">RECEIPT</h2>
              </div>
              
              <div className="receipt-details">
                <div>
                  <p><strong>Receipt #:</strong> {selectedReceipt.id}</p>
                  <p><strong>Date:</strong> {new Date(selectedReceipt.created_at).toLocaleDateString()}</p>
                  <p><strong>Zone:</strong> {selectedReceipt.zone}</p>
                  <p><strong>Area:</strong> {selectedReceipt.area}</p>
                </div>
                <div>
                  <p><strong>Purpose:</strong> {selectedReceipt.purpose}</p>
                  <p><strong>Paid By:</strong> {selectedReceipt.paid_by}</p>
                  <p><strong>Received By:</strong> {selectedReceipt.received_by}</p>
                </div>
              </div>
              
              <div className="receipt-table-container">
                <div className="receipt-table">
                  <div className="receipt-table-header">
                    <div className="receipt-header-cell">Description</div>
                    <div className="receipt-header-cell text-right">Quantity</div>
                    <div className="receipt-header-cell text-right">Rate</div>
                    <div className="receipt-header-cell text-right">Amount</div>
                  </div>
                  <div className="receipt-table-body">
                    <div className="receipt-table-row">
                      <div className="receipt-table-cell">Qurbani Share</div>
                      <div className="receipt-table-cell text-right">{selectedReceipt.quantity}</div>
                      <div className="receipt-table-cell text-right">₹{selectedReceipt.rate}</div>
                      <div className="receipt-table-cell text-right">₹{selectedReceipt.net_total}</div>
                    </div>
                  </div>
                  <div className="receipt-table-footer">
                    <div className="receipt-footer-cell" style={{textAlign: 'right', flex: 3}}>Total:</div>
                    <div className="receipt-footer-cell text-right">₹{selectedReceipt.net_total}</div>
                  </div>
                </div>
              </div>
              
              <div className="receipt-footer">
                <p>Thank you for your payment!</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="action-button download-button"
                onClick={downloadReceipt}
              >
                <Download size={20} />
                Download Receipt
              </button>
              <button 
                className="action-button close-button"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="notification" style={{backgroundColor: notification.type === 'error' ? '#e53e3e' : '#046307'}}>
          {notification.type === 'success' ? <Check size={22} /> : null}
          {notification.message}
        </div>
      )}
    </div>
  );
}
