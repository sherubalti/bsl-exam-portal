import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, get, child, update } from "firebase/database";
import '../StudentProfile.css';

const StudentProfile = ({ user }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    batch: '',
    cnic: '',
    techStack: 'Python, SQL, TensorFlow',
    kaggleProfile: '',
    analyticScore: '85',
    modelsDeployed: '2'
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const dbRef = ref(db);
      const userKey = user.email.replace(/\./g, ',');
      try {
        const snapshot = await get(child(dbRef, `students/${userKey}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProfileData({
            name: data.name || user.name || '',
            email: user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            batch: data.batch || '',
            cnic: data.cnic || '',
            techStack: data.techStack || 'Python, SQL, TensorFlow',
            kaggleProfile: data.kaggleProfile || '',
            analyticScore: data.analyticScore || Math.floor(Math.random() * (95 - 75) + 75).toString(),
            modelsDeployed: data.modelsDeployed || '0'
          });
        } else {
          setProfileData(prev => ({ ...prev, name: user.name, email: user.email }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.email, user.name]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userKey = user.email.replace(/\./g, ',');
    try {
      await update(ref(db, `students/${userKey}`), {
        phone: profileData.phone,
        address: profileData.address,
        batch: profileData.batch,
        cnic: profileData.cnic,
        techStack: profileData.techStack,
        kaggleProfile: profileData.kaggleProfile
      });
      setMessage('Profile metadata synchronized successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update metadata.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div className="ds-loader">Initializing Analytic Workspace...</div>
      </div>
    );
  }

  return (
    <div className="container profile-ds-container">
      <header className="profile-ds-header">
        <div className="header-badge">MY PRIVATE PORTFOLIO</div>
        <h1>My Student Profile</h1>
        <p>Your personal profile is private — only you and the BSL admin can view this information.</p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)',
          borderRadius: '6px', padding: '7px 14px', marginTop: '10px',
          fontSize: '0.8rem', color: '#10b981', fontWeight: 600
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Visible only to you and the administrator
        </div>
      </header>

      <div className="profile-ds-grid">
        <div className="profile-ds-sidebar">
          <div className="profile-avatar-ds">
            <div className="avatar-ring"></div>
            <div className="avatar-text">{profileData.name.charAt(0).toUpperCase()}</div>
          </div>
          <h2 className="ds-name">{profileData.name}</h2>
          <p className="ds-email">{profileData.email}</p>
          
          <div className="ds-metrics">
            <div className="metric-box">
              <span className="metric-val">{profileData.analyticScore}%</span>
              <span className="metric-lbl">Analytic Proficiency</span>
            </div>
            <div className="metric-box">
              <span className="metric-val">{profileData.modelsDeployed}</span>
              <span className="metric-lbl">Models Deployed</span>
            </div>
          </div>
        </div>

        <div className="profile-ds-main">
          {message && (
            <div className="ds-success-banner">
              <span className="icon">✓</span> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="ds-form">
            <h3 className="ds-section-title">Personal Information</h3>
            
            <div className="ds-form-grid">
              <div className="ds-input-group">
                <label>Full Name</label>
                <input type="text" className="ds-input" name="name" value={profileData.name} disabled />
              </div>
              <div className="ds-input-group">
                <label>Email Address</label>
                <input type="email" className="ds-input" name="email" value={profileData.email} disabled />
              </div>
            </div>

            <div className="ds-form-grid">
              <div className="ds-input-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  className={`ds-input ${isEditing ? 'editable' : ''}`} 
                  name="phone" 
                  value={profileData.phone} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                  placeholder="e.g. 0300-1234567"
                />
              </div>
              <div className="ds-input-group">
                <label>CNIC Number</label>
                <input 
                  type="text" 
                  className={`ds-input ${isEditing ? 'editable' : ''}`} 
                  name="cnic" 
                  value={profileData.cnic} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                  placeholder="e.g. 12345-1234567-1"
                />
              </div>
            </div>

            <div className="ds-input-group">
              <label>Batch / Academic Cohort</label>
              <input 
                type="text" 
                className={`ds-input ${isEditing ? 'editable' : ''}`} 
                name="batch" 
                value={profileData.batch} 
                onChange={handleChange} 
                disabled={!isEditing} 
                placeholder="e.g. Batch 5 - AI & Data Science"
              />
            </div>

            <h3 className="ds-section-title" style={{ marginTop: '30px' }}>My Technical Portfolio</h3>

            <div className="ds-form-grid">
              <div className="ds-input-group">
                <label>Core Tech Stack</label>
                <input 
                  type="text" 
                  className={`ds-input ${isEditing ? 'editable' : ''}`} 
                  name="techStack" 
                  value={profileData.techStack} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                  placeholder="e.g. Python, SQL, PowerBI"
                />
              </div>
              <div className="ds-input-group">
                <label>Kaggle / GitHub Profile URL</label>
                <input 
                  type="text" 
                  className={`ds-input ${isEditing ? 'editable' : ''}`} 
                  name="kaggleProfile" 
                  value={profileData.kaggleProfile} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="ds-input-group">
              <label>Home Address</label>
              <textarea 
                className={`ds-input ${isEditing ? 'editable' : ''}`} 
                name="address" 
                value={profileData.address} 
                onChange={handleChange} 
                disabled={!isEditing} 
                rows="2"
                placeholder="Enter your complete residential address"
              />
            </div>

            <div className="ds-actions">
              {!isEditing ? (
                <button type="button" className="ds-btn ds-btn-primary" onClick={() => setIsEditing(true)}>
                  Edit My Profile
                </button>
              ) : (
                <>
                  <button type="submit" className="ds-btn ds-btn-success">Save Changes</button>
                  <button type="button" className="ds-btn ds-btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
