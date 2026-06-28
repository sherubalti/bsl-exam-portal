import React, { useState } from 'react';
import { db } from '../firebase';
import { ref, set, get, child } from "firebase/database";
import { generateVerificationToken, sendVerificationEmail } from '../utils/emailService';

const StudentRegister = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    course: 'Advanced AI & Data Science',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState('form'); // 'form' | 'sent'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const phoneRegex = /^03\d{2}-?\d{7}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Please enter a valid Pakistani phone number (e.g. 0300-1234567 or 03001234567).');
      return;
    }

    setLoading(true);
    const emailKey = formData.email.replace(/\./g, ',');
    const dbRef = ref(db);

    try {
      // Check if email already exists in database
      const snapshot = await get(child(dbRef, `students/${emailKey}`));
      if (snapshot.exists()) {
        setError('An account with this email already exists. Please login instead.');
        setLoading(false);
        return;
      }

      // Check if phone number already exists
      if (formData.phone) {
        const allStudentsSnapshot = await get(child(dbRef, 'students'));
        if (allStudentsSnapshot.exists()) {
          const studentsData = allStudentsSnapshot.val();
          for (const key in studentsData) {
            if (studentsData[key].phone === formData.phone) {
              setError('An account with this phone number already exists.');
              setLoading(false);
              return;
            }
          }
        }
      }

      // Generate verification token
      const token = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      // Save student record as UNVERIFIED
      const userData = {
        name:              formData.name,
        email:             formData.email,
        phone:             formData.phone,
        password:          formData.password,
        course:            formData.course,
        progress:          0,
        attendance:        { present: 0, absent: 0, leave: 0 },
        assignments:       { submitted: 0, total: 3 },
        averageScore:      0,
        joinDate:          new Date().toISOString(),
        isVerified:        false,
        verificationToken: token,
        tokenExpiresAt:    expiresAt,
      };

      await set(ref(db, 'students/' + emailKey), userData);

      // Send verification email via EmailJS
      try {
        await sendVerificationEmail(formData.email, formData.name, token);
        setStep('sent');
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
        // We still go to 'sent' step but admin can verify
        setStep('sent');
      }

    } catch (err) {
      console.error(err);
      setError('Registration failed: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ─── Email Sent Confirmation Screen ─────────────────────────────
  if (step === 'sent') {
    return (
      <div className="login-page-wrapper">
        <div style={{
          maxWidth: '540px', margin: '0 auto', padding: '60px 40px',
          background: 'var(--card-bg)', borderRadius: '16px',
          border: '1px solid var(--border)', textAlign: 'center'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)', border: '2px solid #10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', marginBottom: '16px' }}>
            Check Your Gmail
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '12px' }}>
            A verification email has been sent to:
          </p>
          <div style={{
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '8px', padding: '12px 20px', marginBottom: '24px',
            color: '#3b82f6', fontWeight: 700, fontSize: '1rem'
          }}>
            {formData.email}
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '28px' }}>
            Open your Gmail inbox and click the verification link from <strong>baltistansiliconlab@gmail.com</strong>.
            After verifying, come back and login.
          </p>
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '8px', padding: '14px 18px', textAlign: 'left',
            fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '28px'
          }}>
            <strong style={{ color: '#f59e0b' }}>Not in inbox?</strong> Check your <strong>Spam</strong> or <strong>Junk</strong> folder.
            The email comes from Firebase (Google).
          </div>
          <a href="/student-login" className="btn btn-primary" style={{ display: 'inline-block', padding: '12px 32px' }}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // ─── Registration Form ───────────────────────────────────────────
  return (
    <div className="login-page-wrapper">
      <div className="login-card" style={{ maxWidth: '960px' }}>

        {/* Left: Info Panel */}
        <div className="login-info-section">
          <h1 className="main-title">Join BSL Academy</h1>
          <p className="subtitle">Baltistan Silicon Lab — Skardu</p>
          <p className="description">
            Create your student account. A <strong>verification email</strong> will be sent to your Gmail.
            Click the link to verify and activate your account.
          </p>

          <div className="features-grid">
            <div className="feature-card dark-feature">
              <div>
                <h4>Gmail Verification</h4>
                <p>A real email is sent to your Gmail. Click the link to verify your account.</p>
              </div>
            </div>
            <div className="feature-card dark-feature">
              <div>
                <h4>Private Dashboard</h4>
                <p>Your data is private. Only you and the admin can see your records.</p>
              </div>
            </div>
            <div className="feature-card dark-feature">
              <div>
                <h4>AI & Data Science</h4>
                <p>Access exams, projects, portfolio and fee management after verification.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="login-form-section">
          <div className="auth-container">
            <h2>Student Registration</h2>
            <p className="login-prompt">Create your BSL student account</p>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text" name="name" className="form-control"
                  value={formData.name} onChange={handleChange}
                  placeholder="e.g. Ali Hassan" required
                />
              </div>

              <div className="form-group">
                <label>Gmail Address</label>
                <input
                  type="email" name="email" className="form-control"
                  value={formData.email} onChange={handleChange}
                  placeholder="e.g. ali@gmail.com" required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel" name="phone" className="form-control"
                  value={formData.phone} onChange={handleChange}
                  placeholder="e.g. 0300-1234567"
                />
              </div>

              <div className="form-group">
                <label>Course</label>
                <select name="course" className="form-control" value={formData.course} onChange={handleChange}>
                  <option>Advanced AI &amp; Data Science</option>
                  <option>Python for Data Science</option>
                  <option>Professional Data Analytics</option>
                  <option>Machine Learning Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password" name="password" className="form-control"
                  value={formData.password} onChange={handleChange}
                  placeholder="Minimum 6 characters" required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password" name="confirmPassword" className="form-control"
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password" required
                />
              </div>

              <button
                type="submit" className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px', padding: '14px' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register & Send Verification Email'}
              </button>
            </form>

            <div className="notice-box" style={{ textAlign: 'center', marginTop: '20px' }}>
              Already registered?{' '}
              <a href="/student-login" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>Login here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
