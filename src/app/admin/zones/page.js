'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { Switch } from '@headlessui/react';
import axios from 'axios';
import './zonesStyle.css';
import { useRouter } from 'next/navigation';
import Shimmer from '@/app/Shimmer';

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    zone: '',
    nigra: '',
    mobile: '',
    email: '',
    published: 1 // Default to 1 (true)
  });
  const [currentEditId, setCurrentEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  

  useEffect(() => {
    // Check if user is already logged in
    const isLogged = localStorage.getItem('adminLoggedIn') === 'false';
    if (isLogged) {
      // Redirect to admin dashboard if already logged in
      router.replace('/auth/admin');
    }
  }, [router]);

  // Format date to "YYYY-MM-DD HH:MM am/pm" format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  // Fetch zones on component mount
  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/zones');
      // Map the API data to match our frontend structure
      const mappedZones = response.data.map(zone => ({
        id: zone.zone_id,
        zone: zone.zone_name,
        nigra: zone.zone_incharge,
        mobile: zone.phone,
        email: zone.email,
        published: zone.status === 1,
        createdDate: formatDate(zone.created_date)
      }));
      setZones(mappedZones);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching zones:', error);
      setErrorMessage('Failed to fetch zones');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.nigra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.mobile.includes(searchTerm)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePublished = () => {
    setFormData(prev => ({ ...prev, published: prev.published === 1 ? 0 : 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const requestData = {
        zone_name: formData.zone,
        zone_incharge: formData.nigra,
        phone: formData.mobile,
        email: formData.email,
        created_date: formattedDate,
        status: formData.published
      };
      
      console.log('Submitting form with data:', currentEditId ? { ...requestData, zone_id: currentEditId } : requestData);
      
      let response;
      if (currentEditId) {
        response = await axios.put('/api/zones', {
          ...requestData,
          zone_id: currentEditId
        });
      } else {
        response = await axios.post('/api/zones', requestData);
      }
      
      console.log('Server response:', response.data);
      
      await fetchZones();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving zone:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setErrorMessage(`Failed to save zone: ${error.response.data.error || error.message}`);
      } else {
        setErrorMessage(`Failed to save zone: ${error.message}`);
      }
    }
  };

  const handleEdit = (zone) => {
    setFormData({
      zone: zone.zone,
      nigra: zone.nigra,
      mobile: zone.mobile,
      email: zone.email || '',
      published: zone.published ? 1 : 0
    });
    setCurrentEditId(zone.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      try {
        await axios.delete('/api/zones', { data: { zone_id: id } });
        await fetchZones();
        setErrorMessage('');
      } catch (error) {
        console.error('Error deleting zone:', error);
        setErrorMessage('Failed to delete zone');
      }
    }
  };

  const togglePublishedStatus = async (id) => {
    try {
      const zone = zones.find(z => z.id === id);
      const newStatus = zone.published ? 0 : 1;
      
      await axios.patch('/api/zones', {
        zone_id: id,
        status: newStatus
      });
      
      // Update local state to reflect the change
      setZones(zones.map(zone =>
        zone.id === id ? { ...zone, published: newStatus === 1 } : zone
      ));
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({ zone: '', nigra: '', mobile: '', email: '', published: 1 });
    setCurrentEditId(null);
    setErrorMessage('');
  };

  if (isLoading) {
    return <Shimmer  />;
  }

  return (
    <div className="zones-page" key={router.asPath}>
      <div className="page-header">
        <h1>Manage Zone</h1>
        <button onClick={() => setIsModalOpen(true)} className="add-button">
          <FiPlus /> Add Zone
        </button>
      </div>

      {errorMessage && (
        <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
          {errorMessage}
        </div>
      )}

      <div className="search-box">
        <div className="search-input">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="search-count">{filteredZones.length} record(s) found</div>
      </div>

      <div className='table-container'>
        <div className='table-scroll-wrapper'>
          <div className='table-heads'>
            <div className='table-cell'>Sr no.</div>
            <div className='table-cell'>Nigra</div>
            <div className='table-cell'>Zone</div>
            <div className='table-cell'>Mobile</div>
            <div className='table-cell'>Email</div>
            <div className='table-cell'>Published</div>
            <div className='table-cell'>Created Date</div>
            <div className='table-cell'>Actions</div>
          </div>
          <div className='table-body'>
            {filteredZones.map((zone, index) => (
              <div className='table-body-item' key={zone.id}>
                <div className='table-cell'>{index + 1}</div>
                <div className='table-cell'>{zone.nigra}</div>
                <div className='table-cell'>{zone.zone}</div>
                <div className='table-cell'>{zone.mobile}</div>
                <div className='table-cell'>{zone.email || '-'}</div>
                <div className='table-cell'>
                  <Switch
                    checked={zone.published}
                    onChange={() => togglePublishedStatus(zone.id)}
                    className={`toggle-switch ${zone.published ? 'on' : 'off'}`}
                  >
                    <span className="switch-thumb" />
                  </Switch>
                </div>
                <div className='table-cell'>{zone.createdDate}</div>
                <div className='table-cell actions-cell'>
                  <button 
                    onClick={() => handleEdit(zone)} 
                    className="edit-button" 
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => handleDelete(zone.id)} 
                    className="delete-button" 
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{currentEditId ? 'Edit Zone' : 'Add New Zone'}</h2>
              <button onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }} className="close-button">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                Zone Name*
                <input name="zone" required value={formData.zone} onChange={handleInputChange} />
              </label>
              <label>
                Zonal Nigra Name*
                <input name="nigra" required value={formData.nigra} onChange={handleInputChange} />
              </label>
              <label>
                Phone Number*
                <input name="mobile" type="tel" required value={formData.mobile} onChange={handleInputChange} />
              </label>
              <label>
                Email
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </label>
              
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit">
                  {currentEditId ? 'Update Zone' : 'Add Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}