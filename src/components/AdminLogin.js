import React, { useState } from 'react';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Fixed admin credentials
    if (username === 'admin' && password === 'admin123') {
      onLogin({
        name: 'Portal Administrator'
      }, true);
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        {/* Left Side: Description */}
        <div className="login-info-section">
          <h1 className="main-title">Admin Console</h1>
          <p className="subtitle">Baltistan Silicon Lab</p>
          <p className="description">
            Secure administrative access for managing students, exam schedules, and performance analytics.
          </p>
          
          <div className="features-grid">
            <div className="feature-card dark-feature">
              <span className="feature-icon">🛡️</span>
              <div>
                <h4>Secure Management</h4>
                <p>Advanced security protocols to protect student data and exam integrity.</p>
              </div>
            </div>
            <div className="feature-card dark-feature">
              <span className="feature-icon">📈</span>
              <div>
                <h4>Live Analytics</h4>
                <p>Monitor student progress and exam results in real-time with automated grading.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-section">
          <div className="auth-container">
            <h2>Admin Login</h2>
            <p className="login-prompt">Access administrative controls</p>
            
            {error && <div className="error-msg">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Admin Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '14px' }}>
                Secure Login
              </button>
            </form>
            
            <div className="notice-box">
              <strong>Security Notice:</strong> Unauthorized access attempts are logged. Please ensure you are authorized to access this section.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

