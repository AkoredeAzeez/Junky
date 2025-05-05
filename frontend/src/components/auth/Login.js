// frontend/src/components/auth/Login.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/auth.scss';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on user role
      const { role } = response.data.user;
      
      switch (role) {
        case 'patient':
          history.push('/patient/dashboard');
          break;
        case 'hospital':
          history.push('/hospital/dashboard');
          break;
        case 'donor':
          history.push('/donor/dashboard');
          break;
        case 'admin':
          history.push('/admin/dashboard');
          break;
        default:
          history.push('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Login failed. Please check your credentials and try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In to Healthcare Donation System</h2>
        <p>Access your account to manage donations or applications</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
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
              required
              placeholder="Enter your password"
              minLength="8"
            />
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="/forgot-password" className="forgot-password">
              Forgot password?
            </a>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <a href="/register">Register</a></p>
        </div>
      </div>
      
      <div className="auth-info">
        <h3>User Types</h3>
        <div className="user-types">
          <div className="user-type">
            <h4>Patient</h4>
            <p>Apply for healthcare funding and track your application</p>
          </div>
          <div className="user-type">
            <h4>Hospital</h4>
            <p>Verify patient needs and receive funds for treatment</p>
          </div>
          <div className="user-type">
            <h4>Donor</h4>
            <p>Contribute funds and track your donations' impact</p>
          </div>
          <div className="user-type">
            <h4>DAO Member</h4>
            <p>Vote on fund allocations and system governance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;