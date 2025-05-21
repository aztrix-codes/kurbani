'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, ArrowLeft, Printer, Search } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './style.css';

export default function InvoicePage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData?.userId === 0 && !userData?.isAuthenticated) {
      router.replace('/auth/user');
    } else {
      fetchInvoices();
    }
  }, [router]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await axios.get(`/api/invoices?user_id=${userData.userId}`);
      setInvoices(response.data);
      setFilteredInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const results = invoices.filter(invoice => 
      invoice.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.date.includes(searchTerm)
    );
    setFilteredInvoices(results);
  }, [searchTerm, invoices]);

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    
    // Add logo or header
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147);
    doc.text('Qurbani Management System', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 105, 30, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(12);
    doc.text(`Receipt #: ${invoice.receiptNumber}`, 20, 45);
    doc.text(`Date: ${invoice.date}`, 20, 55);
    doc.text(`Customer: ${invoice.customerName}`, 20, 65);
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, 75, 170, 10, 'F');
    doc.text('Type', 30, 82);
    doc.text('Name', 80, 82);
    doc.text('Amount', 150, 82);
    
    // Table rows
    doc.setFillColor(255, 255, 255);
    doc.setTextColor(0, 0, 0);
    let y = 90;
    
    invoice.items.forEach(item => {
      doc.text(item.type, 30, y);
      doc.text(item.name, 80, y);
      doc.text(`$${item.amount}`, 150, y);
      y += 10;
    });
    
    // Total
    doc.setFontSize(14);
    doc.text(`Total: $${invoice.total}`, 150, y + 10);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your payment!', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`invoice_${invoice.receiptNumber}.pdf`);
  };

  const printInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { color: #283593; font-size: 24px; font-weight: bold; }
            .subtitle { font-size: 18px; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #3b82f6; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .total { text-align: right; font-weight: bold; font-size: 16px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
            @media print {
              body { margin: 0; padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Qurbani Management System</div>
            <div class="subtitle">INVOICE</div>
          </div>
          
          <div class="details">
            <div><strong>Receipt #:</strong> ${invoice.receiptNumber}</div>
            <div><strong>Date:</strong> ${invoice.date}</div>
            <div><strong>Customer:</strong> ${invoice.customerName}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.type}</td>
                  <td>${item.name}</td>
                  <td>$${item.amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">Total: $${invoice.total}</div>
          
          <div class="footer">
            Thank you for your payment!
          </div>
          
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 15px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Invoice
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  return (
    <div className="fixed-color-theme flex flex-col p-4 max-w-full min-h-screen">
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoice Management</h1>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search invoices..."
            className="search-input pl-10 pr-4 py-2 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.receiptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => generatePDF(invoice)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="Download PDF"
                        >
                          <Download size={16} className="mr-1" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                          onClick={() => printInvoice(invoice)}
                          className="text-gray-600 hover:text-gray-900 flex items-center"
                          title="Print Invoice"
                        >
                          <Printer size={16} className="mr-1" />
                          <span className="hidden sm:inline">Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Invoice Preview</h2>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              {/* Invoice preview content would go here */}
              <div className="mt-4 flex justify-end space-x-3">
                <button 
                  className="button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => generatePDF(selectedInvoice)}
                >
                  Download PDF
                </button>
                <button 
                  className="button bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}