import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, get, child, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'expired'
  const [message, setMessage] = useState('');
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      // Parse URL query params
      const params = new URLSearchParams(window.location.search);
      const email = params.get('email');
      const token = params.get('token');

      if (!email || !token) {
        setStatus('error');
        setMessage('Invalid verification link. Please register again.');
        return;
      }

      const emailKey = email.replace(/\./g, ',');
      const dbRef = ref(db);

      try {
        const snapshot = await get(child(dbRef, `students/${emailKey}`));

        if (!snapshot.exists()) {
          setStatus('error');
          setMessage('No account found for this email. Please register again.');
          return;
        }

        const data = snapshot.val();

        // Already verified
        if (data.isVerified) {
          setStatus('success');
          setStudentName(data.name || 'Student');
          setMessage('Your account is already verified. You can login.');
          return;
        }

        // Check token match
        if (data.verificationToken !== token) {
          setStatus('error');
          setMessage('Invalid verification token. Please request a new link.');
          return;
        }

        // Check expiry
        if (data.tokenExpiresAt && new Date() > new Date(data.tokenExpiresAt)) {
          setStatus('expired');
          setMessage('This verification link has expired. Please contact BSL administration.');
          return;
        }

        // All good — mark as verified
        await update(ref(db, `students/${emailKey}`), {
          isVerified:        true,
          verificationToken: null,
          tokenExpiresAt:    null,
          verifiedAt:        new Date().toISOString(),
        });

        setStudentName(data.name || 'Student');
        setStatus('success');
        setMessage('Your account has been verified successfully! You can now login.');

      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage('Connection error. Please try again or contact administration.');
      }
    };

    verifyToken();
  }, []);

  const getIcon = () => {
    if (status === 'verifying') {
      return (
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          border: '3px solid #3b82f6', borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite', margin: '0 auto 28px'
        }} />
      );
    }
    if (status === 'success') {
      return (
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(16,185,129,0.12)', border: '2px solid #10b981',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px'
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      );
    }
    return (
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 28px'
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
    );
  };

  const getTitle = () => {
    if (status === 'verifying') return 'Verifying Your Account...';
    if (status === 'success')   return `Welcome to BSL, ${studentName}!`;
    if (status === 'expired')   return 'Link Expired';
    return 'Verification Failed';
  };

  const getColor = () => {
    if (status === 'success') return '#10b981';
    if (status === 'error' || status === 'expired') return '#ef4444';
    return 'var(--text-main)';
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary)', padding: '40px 20px'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{
        maxWidth: '520px', width: '100%',
        background: 'var(--card-bg)', borderRadius: '16px',
        border: '1px solid var(--border)', padding: '60px 40px',
        textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* BSL Logo area */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em',
            color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px'
          }}>
            Baltistan Silicon Lab
          </div>
          <div style={{
            fontSize: '1rem', fontWeight: 600, color: 'var(--primary)',
            letterSpacing: '0.05em'
          }}>
            BSL Academy — Skardu
          </div>
        </div>

        {getIcon()}

        <h2 style={{ color: getColor(), fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>
          {getTitle()}
        </h2>

        {message && (
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '32px' }}>
            {message}
          </p>
        )}

        {status === 'success' && (
          <button
            className="btn btn-primary"
            style={{ padding: '12px 36px', fontSize: '1rem' }}
            onClick={() => navigate('/student-login')}
          >
            Login to Your Dashboard
          </button>
        )}

        {(status === 'error' || status === 'expired') && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              style={{ padding: '12px 28px' }}
              onClick={() => navigate('/student-register')}
            >
              Register Again
            </button>
            <a
              href="https://wa.me/923426930403"
              className="btn btn-primary"
              style={{ padding: '12px 28px' }}
              target="_blank"
              rel="noreferrer"
            >
              Contact Admin
            </a>
          </div>
        )}

        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
            Return to BSL Portal Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
