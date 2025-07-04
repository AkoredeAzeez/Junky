import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AuthPage.scss';
import { signupPatient } from '../../services/auth';

const PatientSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    
    // Medical Information
    medicalCondition: '',
    requiredFunding: '',
    fundingPurpose: '',
    hospitalName: '',
    doctorName: '',
    treatmentStartDate: '',
    treatmentDuration: '',
    
    // Documents
    documents: []
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        // Validate basic information
        if (!formData.firstName || !formData.lastName || !formData.email || 
            !formData.password || !formData.confirmPassword || !formData.phone) {
          alert('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return false;
        }
        return true;
      
      case 2:
        // Validate medical information
        if (!formData.medicalCondition || !formData.requiredFunding || 
            !formData.fundingPurpose || !formData.hospitalName || 
            !formData.doctorName || !formData.treatmentStartDate) {
          alert('Please fill in all required fields');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleCompleteRegistration = async () => {
    setError('');
    try {
      await signupPatient({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        // Add other required fields as needed
      });
      navigate('/dashboard');
    } catch (error) {
      setError('Registration failed. Please check your details.');
    }
  };

  const renderBasicInfo = () => (
    <div className="form-section">
      <h3>Basic Information</h3>
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter your first name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter your last name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your address"
          required
        />
      </div>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="form-section">
      <h3>Medical Information</h3>
      <div className="form-group">
        <label htmlFor="medicalCondition">Medical Condition</label>
        <input
          type="text"
          id="medicalCondition"
          name="medicalCondition"
          value={formData.medicalCondition}
          onChange={handleChange}
          placeholder="Describe your medical condition"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="requiredFunding">Required Funding Amount</label>
        <input
          type="number"
          id="requiredFunding"
          name="requiredFunding"
          value={formData.requiredFunding}
          onChange={handleChange}
          placeholder="Enter the amount needed"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="fundingPurpose">Purpose of Funding</label>
        <textarea
          id="fundingPurpose"
          name="fundingPurpose"
          value={formData.fundingPurpose}
          onChange={handleChange}
          placeholder="Explain why you need funding"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="hospitalName">Hospital Name</label>
        <input
          type="text"
          id="hospitalName"
          name="hospitalName"
          value={formData.hospitalName}
          onChange={handleChange}
          placeholder="Enter hospital name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="doctorName">Doctor's Name</label>
        <input
          type="text"
          id="doctorName"
          name="doctorName"
          value={formData.doctorName}
          onChange={handleChange}
          placeholder="Enter doctor's name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="treatmentStartDate">Treatment Start Date</label>
        <input
          type="date"
          id="treatmentStartDate"
          name="treatmentStartDate"
          value={formData.treatmentStartDate}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="treatmentDuration">Estimated Treatment Duration (months)</label>
        <input
          type="number"
          id="treatmentDuration"
          name="treatmentDuration"
          value={formData.treatmentDuration}
          onChange={handleChange}
          placeholder="Enter duration in months"
          required
        />
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="form-section">
      <h3>Upload Documents</h3>
      <div className="form-group">
        <label htmlFor="documents">Medical Documents</label>
        <input
          type="file"
          id="documents"
          name="documents"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <p className="file-hint">Upload medical reports, prescriptions, and other relevant documents</p>
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
  );

  return (
    <div className="auth-form">
      <div className="progress-bar">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>Basic Info</div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>Medical Info</div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>Documents</div>
      </div>

      {currentStep === 1 && renderBasicInfo()}
      {currentStep === 2 && renderMedicalInfo()}
      {currentStep === 3 && renderDocuments()}

      <div className="form-navigation">
        {currentStep > 1 && (
          <button type="button" className="back-button" onClick={handleBack}>
            Back
          </button>
        )}
        {currentStep < 3 ? (
          <button type="button" className="submit-button" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button type="button" className="submit-button" onClick={handleCompleteRegistration}>
            Complete Registration
          </button>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PatientSignup; 