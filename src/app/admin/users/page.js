'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiUser } from 'react-icons/fi';
import { Switch } from '@headlessui/react';
import axios from 'axios';
import './usersStyle.css';
import { useRouter } from 'next/navigation';
import Shimmer from '@/app/Shimmer';


export default function UserManagementPage() {
  const [areasList, setAreasList] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    area: '',
    approved: 1,
    pfp: null
  });
  const [currentEditId, setCurrentEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAreasLoading, setIsAreasLoading] = useState(true);

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

  // Fetch areas from API
  const fetchAreas = async () => {
    try {
      setIsAreasLoading(true);
      const response = await axios.get('/api/areas');
      const publishedAreas = response.data
        .filter(area => area.status === 1)
        .map(area => area.area_name);
      setAreasList(publishedAreas);
    } catch (error) {
      console.error('Error fetching areas:', error);
      alert('Failed to fetch areas');
    } finally {
      setIsAreasLoading(false);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/users');
      const mappedUsers = response.data.map(user => ({
        id: user.user_id,
        name: user.username,
        phone: user.phone,
        email: user.email,
        password: user.password,
        area: user.area_name,
        approved: user.status === 1,
        createdDate: formatDate(user.created_date),
        pfp: user.img_url
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchUsers();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, pfp: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const router = useRouter();
  

  useEffect(() => {
    // Check if user is already logged in
    const isLogged = localStorage.getItem('adminLoggedIn') === 'false';
    if (isLogged) {
      // Redirect to admin dashboard if already logged in
      router.replace('/auth/admin');
    }
  }, [router]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleApproved = () => {
    setFormData(prev => ({ ...prev, approved: prev.approved === 1 ? 0 : 1 }));
  };

  // Upload image to ImgBB
  const uploadImageToImgBB = async (imageFile) => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await axios.post('https://api.imgbb.com/1/upload?key=5d7b25beb20889d2109afe5aa0e19b31', formData);
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Upload image if provided
      let imageUrl = previewImage;
      if (formData.pfp) {
        imageUrl = await uploadImageToImgBB(formData.pfp);
      }

      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

      

      if (currentEditId) {
        console.log('Updating user with ID:', currentEditId);
        
        // For update operation (PUT)
        const updateData = {
          user_id: currentEditId,
          username: formData.name,
          phone: formData.phone,
          email: formData.email,
          area_name: formData.area,
          status: formData.approved
        };

        if (formData.password) {
          updateData.password = formData.password;
        }
        
        // Only include image URL if there's a change
        if (imageUrl) {
          updateData.img_url = imageUrl;
        }
        
        const response = await axios.put('/api/users', updateData);
        console.log('Update response:', response.data);
      } else {
        console.log('Creating new user');
        
        // For create operation (POST)
        const createData = {
          username: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          area_name: formData.area,
          created_date: currentDate,
          status: formData.approved,
          img_url: imageUrl
        };
        
        const response = await axios.post('/api/users', createData);
        console.log('Create response:', response.data);
      }
      
      await fetchUsers();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Failed to save user: ${error.message}`);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: user.password || '',
      area: user.area,
      approved: user.approved ? 1 : 0,
      pfp: null
    });
    setPreviewImage(user.pfp);
    setCurrentEditId(user.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete('/api/users', { data: { user_id: id } });
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const toggleApprovedStatus = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      const newStatus = user.approved ? 0 : 1;
      
      await axios.patch('/api/users', {
        user_id: id,
        status: newStatus
      });
      
      setUsers(users.map(user =>
        user.id === id ? { ...user, approved: newStatus === 1 } : user
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', password: '', area: '', approved: 1, pfp: null });
    setPreviewImage(null);
    setCurrentEditId(null);
  };

  if (isLoading || isAreasLoading) {
    return <Shimmer />;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Manage Users</h1>
        <button onClick={() => setIsModalOpen(true)} className="add-button">
          <FiPlus /> Add User
        </button>
      </div>

      <div className="search-box">
        <div className="search-input">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="search-count">{filteredUsers.length} record(s) found</div>
      </div>

      <div className="table-container">
        <div className="table-scroll-wrapper">
          <div className="table-heads">
            <div className="table-cell">Sr No</div>
            <div className="table-cell">Profile</div>
            <div className="table-cell">Name</div>
            <div className="table-cell">Area</div>
            <div className="table-cell">Phone</div>
            <div className="table-cell">Email</div>
            <div className="table-cell">Password</div>
            <div className="table-cell">Approved</div>
            <div className="table-cell">Created Date</div>
            <div className="table-cell">Actions</div>
          </div>
          <div className="table-body">
            {filteredUsers.map((user, index) => (
              <div className="table-body-item" key={user.id}>
                <div className="table-cell">{index + 1}</div>
                <div className="table-cell">
                  <div className="user-with-avatar">
                    {user.pfp ? (
                      <img src={user.pfp} alt={user.name} className="user-avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="table-cell">{user.name}</div>
                <div className="table-cell">{user.area}</div>
                <div className="table-cell">{user.phone}</div>
                <div className="table-cell">{user.email}</div>
                <div className="table-cell">{user.password}</div>
                <div className="table-cell">
                  <Switch
                    checked={user.approved}
                    onChange={() => toggleApprovedStatus(user.id)}
                    className={`toggle-switch ${user.approved ? 'on' : 'off'}`}
                  >
                    <span className="switch-thumb" />
                  </Switch>
                </div>
                <div className="table-cell">{user.createdDate}</div>
                <div className="table-cell actions-cell">
                  <button 
                    onClick={() => handleEdit(user)} 
                    className="edit-button" 
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)} 
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
              <h2>{currentEditId ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }} className="close-button">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label className="pfp-upload-horizontal">
                Profile Picture
                <div className="pfp-container-horizontal">
                  <div className="pfp-preview-horizontal">
                    {previewImage ? (
                      <img src={previewImage} alt="Profile preview" />
                    ) : (
                      <div className="pfp-placeholder-horizontal">
                        <FiUser size={20} />
                      </div>
                    )}
                  </div>
                  <div className="pfp-controls-horizontal">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="pfp-input-horizontal"
                      id="pfp-upload-horizontal"
                    />
                    <label htmlFor="pfp-upload-horizontal" className="pfp-upload-button-horizontal">
                      {previewImage ? 'Change' : 'Upload'}
                    </label>
                    {previewImage && (
                      <button 
                        type="button" 
                        className="pfp-remove-button-horizontal"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData(prev => ({ ...prev, pfp: null }));
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </label>
              <label>
                Full Name*
                <input name="name" required value={formData.name} onChange={handleInputChange} />
              </label>
              <label>
                Phone Number*
                <input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} />
              </label>
              <label>
                Email*
                <input name="email" type="email" required value={formData.email} onChange={handleInputChange} />
              </label>
              {currentEditId && (
                <label className="password-field">
                  Update Password
                  <div className="password-input-container">
                    <input 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      placeholder="Enter new password"
                    />
                    <button 
                      type="button" 
                      className="toggle-password" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              )}
              <label>
                Area*
                <select 
                  name="area" 
                  required 
                  value={formData.area} 
                  onChange={handleInputChange}
                  className="area-select custom-dropdown"
                >
                  <option value="" disabled>Select Area</option>
                  {areasList.map((area, index) => (
                    <option key={index} value={area}>{area}</option>
                  ))}
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}>Cancel</button>
                <button type="submit">{currentEditId ? 'Update User' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}