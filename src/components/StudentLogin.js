import React, { useState, useEffect } from 'react';
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
    <div className="auth-container">
      <h2>BSL Student Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User ID / Username:</label>
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
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
          Login to Portal
        </button>
      </form>
      
      <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.9rem' }}>
        <strong>Notice:</strong> Accounts are assigned by Baltistan Silicon Lab administration. If you do not have your credentials, please contact your instructor.
      </div>
    </div>
  );
};

export default StudentLogin;
