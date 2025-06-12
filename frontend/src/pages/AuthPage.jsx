import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AuthPage.scss';

// Import role-specific components
import PatientLogin from '../components/auth/PatientLogin';
import PatientSignup from '../components/auth/PatientSignup';
import DonorLogin from '../components/auth/DonorLogin';
import DonorSignup from '../components/auth/DonorSignup';
import HospitalLogin from '../components/auth/HospitalLogin';
import HospitalSignup from '../components/auth/HospitalSignup';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'patient',
      title: 'Patient',
      description: 'Access healthcare funding and support',
      icon: '👤'
    },
    {
      id: 'donor',
      title: 'Donor',
      description: 'Contribute to healthcare initiatives',
      icon: '💝'
    },
    {
      id: 'hospital',
      title: 'Hospital',
      description: 'Manage healthcare resources and requests',
      icon: '🏥'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  const renderRoleSelection = () => (
    <div className="role-selection">
      <h2>Select Your Role</h2>
      <div className="roles-grid">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
            onClick={() => handleRoleSelect(role.id)}
          >
            <div className="role-icon">{role.icon}</div>
            <h3>{role.title}</h3>
            <p>{role.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuthForm = () => {
    if (!selectedRole) return null;

    const components = {
      patient: isLogin ? PatientLogin : PatientSignup,
      donor: isLogin ? DonorLogin : DonorSignup,
      hospital: isLogin ? HospitalLogin : HospitalSignup
    };

    const Component = components[selectedRole];
    return (
      <div className="auth-form">
        <button className="back-button" onClick={handleBack}>
          ← Back to Role Selection
        </button>
        <Component />
      </div>
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to continue' : 'Join our healthcare platform'}
          </p>
        </div>

        <div className="auth-content">
          {!selectedRole ? renderRoleSelection() : renderAuthForm()}

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                className="toggle-auth"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 