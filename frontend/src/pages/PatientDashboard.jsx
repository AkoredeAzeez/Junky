import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PatientDashboard.scss';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual data from your backend
  const patientData = {
    name: 'John Doe',
    email: 'john@example.com',
    currentApplication: {
      id: 'APP123',
      status: 'pending',
      requestedAmount: 5000,
      receivedAmount: 0,
      submissionDate: '2024-03-15',
      documents: [
        { name: 'Doctor\'s Note.pdf', type: 'medical' },
        { name: 'Prescription.pdf', type: 'medical' },
        { name: 'Medical Bills.pdf', type: 'bills' }
      ]
    },
    previousApplications: [
      {
        id: 'APP122',
        status: 'approved',
        requestedAmount: 3000,
        receivedAmount: 3000,
        submissionDate: '2024-02-01',
        approvalDate: '2024-02-15'
      }
    ]
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/get-started');
  };

  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h4>Current Application</h4>
            <p className={`status ${patientData.currentApplication.status}`}>
              {patientData.currentApplication.status.charAt(0).toUpperCase() + 
               patientData.currentApplication.status.slice(1)}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h4>Requested Amount</h4>
            <p>${patientData.currentApplication.requestedAmount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h4>Received Amount</h4>
            <p>${patientData.currentApplication.receivedAmount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h4>Submission Date</h4>
            <p>{new Date(patientData.currentApplication.submissionDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card current-application">
          <h3>Current Application Details</h3>
          <div className="application-details">
            <div className="detail-item">
              <span className="label">Application ID:</span>
              <span className="value">{patientData.currentApplication.id}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`value status ${patientData.currentApplication.status}`}>
                {patientData.currentApplication.status.charAt(0).toUpperCase() + 
                 patientData.currentApplication.status.slice(1)}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Requested Amount:</span>
              <span className="value">${patientData.currentApplication.requestedAmount}</span>
            </div>
            <div className="detail-item">
              <span className="label">Received Amount:</span>
              <span className="value">${patientData.currentApplication.receivedAmount}</span>
            </div>
            <div className="detail-item">
              <span className="label">Submission Date:</span>
              <span className="value">
                {new Date(patientData.currentApplication.submissionDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-card uploaded-documents">
          <h3>Uploaded Documents</h3>
          <div className="documents-list">
            {patientData.currentApplication.documents.map((doc, index) => (
              <div key={index} className="document-item">
                <div className="document-icon">
                  {doc.type === 'medical' ? '📋' : '💰'}
                </div>
                <div className="document-info">
                  <span className="document-name">{doc.name}</span>
                  <span className="document-type">{doc.type}</span>
                </div>
                <button className="view-button">View</button>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card previous-applications">
          <h3>Previous Applications</h3>
          <div className="applications-list">
            {patientData.previousApplications.map(app => (
              <div key={app.id} className="application-item">
                <div className="application-header">
                  <span className="application-id">#{app.id}</span>
                  <span className={`status ${app.status}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                <div className="application-details">
                  <div className="detail-row">
                    <span>Requested: ${app.requestedAmount}</span>
                    <span>Received: ${app.receivedAmount}</span>
                  </div>
                  <div className="detail-row">
                    <span>Submitted: {new Date(app.submissionDate).toLocaleDateString()}</span>
                    {app.approvalDate && (
                      <span>Approved: {new Date(app.approvalDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-button">
              <span className="action-icon">📝</span>
              New Application
            </button>
            <button className="action-button">
              <span className="action-icon">📄</span>
              Upload Documents
            </button>
            <button className="action-button">
              <span className="action-icon">📞</span>
              Contact Support
            </button>
            <button className="action-button">
              <span className="action-icon">❓</span>
              Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="patient-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="profile-section">
            <img src="https://via.placeholder.com/40" alt="Profile" className="profile-image" />
            <div className="profile-info">
              <h3>{patientData.name}</h3>
              <p>{patientData.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <span className="nav-icon">📝</span>
            Applications
          </button>
          <button 
            className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <span className="nav-icon">📄</span>
            Documents
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {patientData.name}</h1>
            <p>Track your healthcare funding applications</p>
          </div>
          <div className="header-actions">
            <button className="notification-button">
              🔔
              <span className="notification-badge">2</span>
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && renderOverview()}
          {/* Add other tab content here */}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 