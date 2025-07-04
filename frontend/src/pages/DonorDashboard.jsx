import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PatientDashboard.scss';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [donorData, setDonorData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    totalDonated: 2500,
    patientsHelped: 8
  });
  const [patientCases, setPatientCases] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      condition: 'Heart Surgery',
      amountNeeded: 15000,
      amountRaised: 8500,
      progress: 57,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 2,
      name: 'Mike Chen',
      condition: 'Cancer Treatment',
      amountNeeded: 25000,
      amountRaised: 12000,
      progress: 48,
      image: 'https://via.placeholder.com/100'
    }
  ]);
  const [donationHistory, setDonationHistory] = useState([
    {
      id: 1,
      patientName: 'Sarah Johnson',
      amount: 500,
      date: '2024-01-15',
      status: 'Completed'
    },
    {
      id: 2,
      patientName: 'Mike Chen',
      amount: 300,
      date: '2024-01-10',
      status: 'Completed'
    }
  ]);

  const handleLogout = () => {
    // Clear auth data and redirect to landing
    navigate('/');
  };

  const handleDonate = (patientId) => {
    // TODO: Implement donation modal/form
    console.log('Donate to patient:', patientId);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Donor Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {donorData.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>${donorData.totalDonated.toLocaleString()}</h3>
            <p>Total Donated</p>
          </div>
          <div className="stat-card">
            <h3>{donorData.patientsHelped}</h3>
            <p>Patients Helped</p>
          </div>
          <div className="stat-card">
            <h3>{donationHistory.length}</h3>
            <p>Total Donations</p>
          </div>
        </div>

        {/* Patient Cases Section */}
        <div className="section">
          <h2>Patient Cases</h2>
          <div className="cases-grid">
            {patientCases.map((patient) => (
              <div key={patient.id} className="case-card">
                <div className="case-header">
                  <img src={patient.image} alt={patient.name} className="patient-image" />
                  <div className="case-info">
                    <h3>{patient.name}</h3>
                    <p className="condition">{patient.condition}</p>
                  </div>
                </div>
                <div className="funding-info">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${patient.progress}%` }}
                    ></div>
                  </div>
                  <div className="amounts">
                    <span>${patient.amountRaised.toLocaleString()} raised</span>
                    <span>${patient.amountNeeded.toLocaleString()} needed</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDonate(patient.id)}
                  className="donate-btn"
                >
                  Donate Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Donation History Section */}
        <div className="section">
          <h2>Recent Donations</h2>
          <div className="donation-history">
            {donationHistory.map((donation) => (
              <div key={donation.id} className="donation-item">
                <div className="donation-info">
                  <h4>{donation.patientName}</h4>
                  <p className="date">{donation.date}</p>
                </div>
                <div className="donation-amount">
                  <span className="amount">${donation.amount}</span>
                  <span className="status">{donation.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard; 