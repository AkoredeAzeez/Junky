import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AuthPage.scss';
import { loginUser } from '../../services/auth';

const PatientLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginUser(formData.email, formData.password, 'patient');
      // Store token if needed: localStorage.setItem('token', data.data.token);
      navigate('/dashboard');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error-message">{error}</div>}
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
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" className="submit-button">
        Sign In
      </button>
    </form>
  );
};

export default PatientLogin; 