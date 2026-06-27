import React, { useState } from 'react';
import { db } from '../firebase';
import { ref, get, child } from "firebase/database";

const StudentLogin = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Admin hardcoded login
    if (email === 'admin' && password === 'admin123') {
      onLogin({ email: 'admin', name: 'Student Admin' }, false);
      setLoading(false);
      return;
    }

    try {
      const emailKey = email.replace(/\./g, ',');
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `students/${emailKey}`));

      if (!snapshot.exists()) {
        setError('No account found with this email. Please register first.');
        setLoading(false);
        return;
      }

      const userData = snapshot.val();

      if (userData.password === password) {
        if (userData.isVerified === false) {
          setError('Your account is not verified yet. Please check your email and click the verification link.');
          setLoading(false);
          return;
        }

        onLogin({
          email: email,
          name: userData.name || email
        }, false);
      } else {
        setError('Invalid password.');
      }

    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
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
              <div>
                <h4>Industry-Ready Skills</h4>
                <p>Master cutting-edge technologies like Machine Learning and AI through hands-on projects.</p>
              </div>
            </div>
            <div className="feature-card dark-feature">
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
            <p className="login-prompt">Login with your verified email</p>
            
            {error && <div className="error-msg">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
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
              
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px', padding: '14px' }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Login to Dashboard'}
              </button>
            </form>
            
            <div className="notice-box" style={{ textAlign: 'center', marginTop: '20px' }}>
              <strong>New Student?</strong>{' '}
              <a href="/student-register" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>Register here</a> to create your account.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
