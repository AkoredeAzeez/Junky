import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupPatient, signupDonor, signupHospital } from '../../services/auth';

const roles = [
  { id: 'patient', label: 'Patient', icon: '👤' },
  { id: 'donor', label: 'Donor', icon: '💝' },
  { id: 'hospital', label: 'Hospital', icon: '🏥' }
];

const SignupForm = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const handleRoleSelect = (roleId) => {
    setRole(roleId);
    setFormData({});
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (role === 'patient') {
        await signupPatient({ ...formData });
      } else if (role === 'donor') {
        await signupDonor({ ...formData });
      } else if (role === 'hospital') {
        await signupHospital({ ...formData });
      }
      navigate(`/dashboard/${role}`);
    } catch (err) {
      setError('Registration failed. Please check your details.');
    }
  };

  // Dynamic fields for each role
  const renderFields = () => {
    switch (role) {
      case 'patient':
        return (
          <>
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={formData.firstName || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={formData.lastName || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={formData.phone || ''} onChange={handleChange} required />
            </div>
          </>
        );
      case 'donor':
        return (
          <>
            <div className="form-group">
              <label>Full Name</label>
              <input name="fullName" value={formData.fullName || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={formData.address || ''} onChange={handleChange} required />
            </div>
          </>
        );
      case 'hospital':
        return (
          <>
            <div className="form-group">
              <label>Hospital Name</label>
              <input name="hospitalName" value={formData.hospitalName || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={formData.address || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input name="licenseNumber" value={formData.licenseNumber || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input name="specialization" value={formData.specialization || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Upload Documents</label>
              <input type="file" name="documents" multiple onChange={handleChange} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="role-selection">
        <h3>Select Your Role</h3>
        <div className="roles-grid">
          {roles.map((r) => (
            <button
              type="button"
              key={r.id}
              className={`role-btn${role === r.id ? ' selected' : ''}`}
              onClick={() => handleRoleSelect(r.id)}
            >
              <span className="role-icon">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {renderFields()}
      {error && <div className="error-message">{error}</div>}
      <button type="submit" className="submit-button">Sign Up</button>
    </form>
  );
};

export default SignupForm; 