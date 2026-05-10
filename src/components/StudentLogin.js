import React, { useState } from 'react';
import { db } from '../firebase';
import { ref, get, child } from "firebase/database";

const StudentLogin = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (userId === 'admin' && password === 'admin123') {
      onLogin({ email: 'admin', name: 'Student Admin' }, false);
      return;
    }

    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `students/${userId}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.password === password) {
          onLogin({
            email: userId,
            name: userData.name || userId
          }, false);
        } else {
          setError('Invalid password');
        }
      } else {
        setError('Invalid User ID');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        {/* Left Side: Description */}
        <div className="login-info-section">
          <h1 className="main-title">Welcome to BSL</h1>
          <p className="subtitle">Baltistan Silicon Lab</p>
          <p className="description">
            Empowering the next generation with industry-level training in <strong>Artificial Intelligence</strong> and <strong>Data Science</strong>.
          </p>
          
          <div className="features-grid">
            <div className="feature-card dark-feature">
              <span className="feature-icon">🚀</span>
              <div>
                <h4>Industry-Ready Skills</h4>
                <p>Master cutting-edge technologies like Machine Learning and AI through hands-on projects.</p>
              </div>
            </div>
            <div className="feature-card dark-feature">
              <span className="feature-icon">💡</span>
              <div>
                <h4>Expert Mentorship</h4>
                <p>Learn directly from seasoned professionals and receive guidance to excel globally.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-section">
          <div className="auth-container">
            <h2>Student Portal</h2>
            <p className="login-prompt">Please login to access your dashboard</p>
            
            {error && <div className="error-msg">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>User ID / Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your assigned ID"
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
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '14px' }}>
                Login to Dashboard
              </button>
            </form>
            
            <div className="notice-box">
              <strong>Notice:</strong> Accounts are assigned by the BSL administration. If you do not have your credentials, please contact your instructor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
