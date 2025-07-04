import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupHospital } from '../../services/auth';

const HospitalSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    licenseNumber: '',
    specialization: '',
    documents: []
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signupHospital(formData);
      navigate('/dashboard');
    } catch (error) {
      setError('Registration failed. Please check your details.');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Hospital Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Hospital Name</label>
          <input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleInputChange}
            placeholder="Enter hospital name"
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter hospital email"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a password"
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter hospital phone number"
            required
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter hospital address"
            required
          />
        </div>
        <div className="form-group">
          <label>License Number</label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            placeholder="Enter hospital license number"
            required
          />
        </div>
        <div className="form-group">
          <label>Specialization</label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            placeholder="Enter hospital specialization"
            required
          />
        </div>
        <div className="form-group">
          <label>Upload Documents</label>
          <div className="file-upload">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="file-hint">Upload hospital license, certifications, and other relevant documents (PDF, JPG, PNG)</p>
          </div>
          {formData.documents.length > 0 && (
            <div className="uploaded-files">
              <h4>Uploaded Files:</h4>
              <ul>
                {formData.documents.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button type="submit" className="submit-button">
          Create Account
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default HospitalSignup; 