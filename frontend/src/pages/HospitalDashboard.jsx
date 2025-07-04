import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PatientDashboard.scss';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [hospitalData, setHospitalData] = useState({
    name: 'City General Hospital',
    email: 'admin@cityhospital.com',
    totalPatients: 45,
    pendingApplications: 12
  });
  const [applications, setApplications] = useState([
    {
      id: 1,
      patientName: 'Sarah Johnson',
      condition: 'Heart Surgery',
      amountRequested: 15000,
      status: 'Pending Review',
      submittedDate: '2024-01-15',
      documents: ['medical_report.pdf', 'doctor_letter.pdf']
    },
    {
      id: 2,
      patientName: 'Mike Chen',
      condition: 'Cancer Treatment',
      amountRequested: 25000,
      status: 'Under Review',
      submittedDate: '2024-01-12',
      documents: ['diagnosis.pdf', 'treatment_plan.pdf']
    }
  ]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleStatusUpdate = (applicationId, newStatus) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus }
          : app
      )
    );
  };

  const handleViewDocuments = (documents) => {
    // TODO: Implement document viewer
    console.log('View documents:', documents);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Hospital Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {hospitalData.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>{hospitalData.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
          <div className="stat-card">
            <h3>{hospitalData.pendingApplications}</h3>
            <p>Pending Applications</p>
          </div>
          <div className="stat-card">
            <h3>{applications.filter(app => app.status === 'Approved').length}</h3>
            <p>Approved Cases</p>
          </div>
        </div>

        {/* Applications Section */}
        <div className="section">
          <h2>Patient Applications</h2>
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="application-header">
                  <div className="patient-info">
                    <h3>{application.patientName}</h3>
                    <p className="condition">{application.condition}</p>
                    <p className="date">Submitted: {application.submittedDate}</p>
                  </div>
                  <div className="status-badge">
                    {application.status}
                  </div>
                </div>
                
                <div className="application-details">
                  <div className="funding-info">
                    <span className="amount">${application.amountRequested.toLocaleString()}</span>
                    <span className="label">Requested</span>
                  </div>
                  
                  <div className="documents">
                    <h4>Documents:</h4>
                    <div className="document-list">
                      {application.documents.map((doc, index) => (
                        <span key={index} className="document-item">{doc}</span>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleViewDocuments(application.documents)}
                      className="view-docs-btn"
                    >
                      View Documents
                    </button>
                  </div>
                </div>

                <div className="application-actions">
                  {application.status === 'Pending Review' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(application.id, 'Under Review')}
                        className="action-btn primary"
                      >
                        Start Review
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(application.id, 'Rejected')}
                        className="action-btn danger"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {application.status === 'Under Review' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(application.id, 'Approved')}
                        className="action-btn success"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(application.id, 'Rejected')}
                        className="action-btn danger"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard; 