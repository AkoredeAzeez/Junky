import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginUser(formData.email, formData.password, formData.role);
      navigate(`/dashboard/${formData.role}`);
    } catch (err) {
      setError('Invalid email, password, or role.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />
      </div>
      <div className="form-group">
        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="patient">Patient</option>
          <option value="donor">Donor</option>
          <option value="hospital">Hospital</option>
        </select>
      </div>
      {error && <div className="error-message">{error}</div>}
      <button type="submit" className="submit-button">Sign In</button>
    </form>
  );
};

export default LoginForm; 