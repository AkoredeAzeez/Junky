import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PatientDashboard.scss';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({
    name: 'Admin User',
    email: 'admin@junky.com'
  });
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 1250,
    totalPatients: 450,
    totalDonors: 600,
    totalHospitals: 200,
    totalDonations: 2500000,
    pendingApplications: 85
  });
  const [recentUsers, setRecentUsers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'Patient',
      status: 'Active',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Donor',
      status: 'Active',
      joinDate: '2024-01-14'
    },
    {
      id: 3,
      name: 'City General Hospital',
      email: 'admin@cityhospital.com',
      role: 'Hospital',
      status: 'Pending',
      joinDate: '2024-01-13'
    }
  ]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleUserAction = (userId, action) => {
    // TODO: Implement user management actions
    console.log(`${action} user:`, userId);
  };

  const handleViewDetails = (userId) => {
    // TODO: Navigate to user details page
    console.log('View user details:', userId);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {adminData.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Platform Stats */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>{platformStats.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card">
            <h3>{platformStats.totalPatients.toLocaleString()}</h3>
            <p>Patients</p>
          </div>
          <div className="stat-card">
            <h3>{platformStats.totalDonors.toLocaleString()}</h3>
            <p>Donors</p>
          </div>
          <div className="stat-card">
            <h3>{platformStats.totalHospitals.toLocaleString()}</h3>
            <p>Hospitals</p>
          </div>
          <div className="stat-card">
            <h3>${platformStats.totalDonations.toLocaleString()}</h3>
            <p>Total Donations</p>
          </div>
          <div className="stat-card">
            <h3>{platformStats.pendingApplications}</h3>
            <p>Pending Applications</p>
          </div>
        </div>

        {/* Recent Users Section */}
        <div className="section">
          <h2>Recent Users</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.joinDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleViewDetails(user.id)}
                          className="action-btn small"
                        >
                          View
                        </button>
                        {user.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleUserAction(user.id, 'approve')}
                              className="action-btn small success"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUserAction(user.id, 'reject')}
                              className="action-btn small danger"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="action-btn small warning"
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn large">
              Review Pending Applications
            </button>
            <button className="action-btn large">
              Manage Users
            </button>
            <button className="action-btn large">
              View Platform Reports
            </button>
            <button className="action-btn large">
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 