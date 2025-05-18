'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { Switch } from '@headlessui/react';
import axios from 'axios';
import './areasStyle.css';
import { useRouter } from 'next/navigation';

export default function AreasPage() {
  const [zonesList, setZonesList] = useState([]); // Will be populated from API
  const [areas, setAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    area: '',
    nigra: '',
    mobile: '',
    email: '',
    zone: '',
    published: 1
  });
  const [currentEditId, setCurrentEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isZonesLoading, setIsZonesLoading] = useState(true);
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
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  // Fetch zones where status = 1
  const fetchZones = async () => {
    try {
      setIsZonesLoading(true);
      const response = await axios.get('/api/zones');
      const publishedZones = response.data
        .filter(zone => zone.status === 1)
        .map(zone => zone.zone_name);
      setZonesList(publishedZones);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching zones:', error);
      setErrorMessage('Failed to fetch zones');
    } finally {
      setIsZonesLoading(false);
    }
  };

  // Fetch areas
  const fetchAreas = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/areas');
      const mappedAreas = response.data.map(area => ({
        id: area.area_id,
        area: area.area_name,
        nigra: area.area_incharge,
        mobile: area.phone,
        email: area.email,
        zone: area.zone_name,
        published: area.status === 1,
        createdDate: formatDate(area.created_date)
      }));
      setAreas(mappedAreas);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching areas:', error);
      setErrorMessage('Failed to fetch areas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
    fetchAreas();
  }, []);

  const filteredAreas = areas.filter(area =>
    area.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.nigra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.mobile.includes(searchTerm) ||
    area.zone.toLowerCase().includes(searchTerm.toLowerCase())
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
        area_name: formData.area,
        area_incharge: formData.nigra,
        phone: formData.mobile,
        email: formData.email,
        zone_name: formData.zone,
        created_date: formattedDate,
        status: formData.published
      };
      
      console.log('Submitting form with data:', currentEditId ? { ...requestData, area_id: currentEditId } : requestData);
      
      let response;
      if (currentEditId) {
        response = await axios.put('/api/areas', {
          ...requestData,
          area_id: currentEditId
        });
      } else {
        response = await axios.post('/api/areas', requestData);
      }
      
      console.log('Server response:', response.data);
      
      await fetchAreas();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving area:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setErrorMessage(`Failed to save area: ${error.response.data.error || error.message}`);
      } else {
        setErrorMessage(`Failed to save area: ${error.message}`);
      }
    }
  };

  const handleEdit = (area) => {
    setFormData({
      area: area.area,
      nigra: area.nigra,
      mobile: area.mobile,
      email: area.email || '',
      zone: area.zone,
      published: area.published ? 1 : 0
    });
    setCurrentEditId(area.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this area?')) {
      try {
        await axios.delete('/api/areas', { data: { area_id: id } });
        await fetchAreas();
        setErrorMessage('');
      } catch (error) {
        console.error('Error deleting area:', error);
        setErrorMessage('Failed to delete area');
      }
    }
  };

  const togglePublishedStatus = async (id) => {
    try {
      const area = areas.find(a => a.id === id);
      const newStatus = area.published ? 0 : 1;
      
      await axios.patch('/api/areas', {
        area_id: id,
        status: newStatus
      });
      
      setAreas(areas.map(area =>
        area.id === id ? { ...area, published: newStatus === 1 } : area
      ));
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({ area: '', nigra: '', mobile: '', email: '', zone: '', published: 1 });
    setCurrentEditId(null);
    setErrorMessage('');
  };

  if (isLoading || isZonesLoading) {
    return <div className="areas-page">Loading data...</div>;
  }

  return (
    <div className="areas-page">
      <div className="page-header">
        <h1>Manage Area</h1>
        <button onClick={() => setIsModalOpen(true)} className="add-button">
          <FiPlus /> Add Area
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
            placeholder="Search areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="search-count">{filteredAreas.length} record(s) found</div>
      </div>

      <div className="table-container">
        <div className="table-scroll-wrapper">
          <div className="table-heads">
            <div className="table-cell">Sr No</div>
            <div className="table-cell">Nigra</div>
            <div className="table-cell">Area</div>
            <div className="table-cell">Zone</div>
            <div className="table-cell">Mobile</div>
            <div className="table-cell">Email</div>
            <div className="table-cell">Published</div>
            <div className="table-cell">Created Date</div>
            <div className="table-cell">Actions</div>
          </div>
          <div className="table-body">
            {filteredAreas.map((area, index) => (
              <div className="table-body-item" key={area.id}>
                <div className="table-cell">{index + 1}</div>
                <div className="table-cell">{area.nigra}</div>
                <div className="table-cell">{area.area}</div>
                <div className="table-cell">{area.zone}</div>
                <div className="table-cell">{area.mobile}</div>
                <div className="table-cell">{area.email || '-'}</div>
                <div className="table-cell">
                  <Switch
                    checked={area.published}
                    onChange={() => togglePublishedStatus(area.id)}
                    className={`toggle-switch ${area.published ? 'on' : 'off'}`}
                  >
                    <span className="switch-thumb" />
                  </Switch>
                </div>
                <div className="table-cell">{area.createdDate}</div>
                <div className="table-cell actions-cell">
                  <button 
                    onClick={() => handleEdit(area)} 
                    className="edit-button" 
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => handleDelete(area.id)} 
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
              <h2>{currentEditId ? 'Edit Area' : 'Add New Area'}</h2>
              <button onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }} className="close-button">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                Area Name*
                <input name="area" required value={formData.area} onChange={handleInputChange} />
              </label>
              <label>
                Area Nigra Name*
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
              <label>
                Zone*
                <select 
                  name="zone" 
                  required 
                  value={formData.zone} 
                  onChange={handleInputChange}
                  className="zone-select"
                >
                  <option value="" disabled>Select Zone</option>
                  {zonesList.map((zone, index) => (
                    <option key={index} value={zone}>{zone}</option>
                  ))}
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit">
                  {currentEditId ? 'Update Area' : 'Add Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}