import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, get, child, push } from "firebase/database";
import { getCurrentPKTTime } from '../utils/timeUtility';
import '../FeePayment.css';

const FeePayment = ({ user }) => {
  const [paymentMode, setPaymentMode] = useState(''); // 'easypaisa' or 'offline'
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [feeHistory, setFeeHistory] = useState([]);
  const [globalSettings, setGlobalSettings] = useState(null);

  useEffect(() => {
    const fetchFeeHistory = async () => {
      const dbRef = ref(db);
      const userKey = user.email.replace(/\./g, ',');
      try {
        const snapshot = await get(child(dbRef, `feePayments/${userKey}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          list.sort((a, b) => new Date(b.date) - new Date(a.date));
          setFeeHistory(list);
        }

        const settingsSnapshot = await get(child(dbRef, 'globalSettings'));
        if (settingsSnapshot.exists()) {
          setGlobalSettings(settingsSnapshot.val());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeeHistory();
  }, [user.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMode === 'easypaisa' && !trxId.trim()) {
      alert('Please enter EasyPaisa Transaction ID');
      return;
    }

    setLoading(true);
    try {
      const nowPKT = await getCurrentPKTTime();
      const userKey = user.email.replace(/\./g, ',');
      const newPayment = {
        mode: paymentMode,
        studentName: user.name,
        email: user.email,
        date: nowPKT.toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Pending Verification',
        trxId: paymentMode === 'easypaisa' ? trxId : null
      };

      await push(ref(db, `feePayments/${userKey}`), newPayment);
      
      setFeeHistory(prev => [newPayment, ...prev]);
      setMessage('Fee payment submitted successfully! Awaiting admin verification.');
      setPaymentMode('');
      setTrxId('');
      
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to submit fee payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fee-container">
      <header className="fee-header">
        <h1>My Fee Payments</h1>
        <p>Submit and track your personal fee payments. Records are private and visible only to you and the BSL administrator.</p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)',
          borderRadius: '6px', padding: '7px 14px', marginTop: '10px',
          fontSize: '0.8rem', color: '#10b981', fontWeight: 600
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your payment history is private and secure
        </div>
      </header>

      {globalSettings && globalSettings.feeLastDate && (
        <div style={{ background: 'var(--warning-bg)', borderLeft: '4px solid #d97706', padding: '14px 20px', borderRadius: '8px', marginBottom: '28px' }}>
          <h4 style={{ color: 'var(--warning)', margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee Deadline Notice</h4>
          <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.875rem' }}>The final submission date is: <strong>{new Date(globalSettings.feeLastDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>
        </div>
      )}

      <div className="fee-content-grid">
        <div className="fee-submission-card card-premium">
          <h2>Submit New Payment</h2>
          {message && (
            <div className={`success-banner ${message.includes('Failed') ? 'error-banner' : ''}`}>
              {message}
            </div>
          )}

          <div className="payment-mode-selector">
            <button 
              className={`mode-btn ${paymentMode === 'easypaisa' ? 'active' : ''}`}
              onClick={() => { setPaymentMode('easypaisa'); }}
            >
              <div className="mode-text">EasyPaisa</div>
            </button>
            <button 
              className={`mode-btn ${paymentMode === 'offline' ? 'active' : ''}`}
              onClick={() => { setPaymentMode('offline'); setTrxId(''); }}
            >
              <div className="mode-text">Offline / Bank</div>
            </button>
          </div>

          {paymentMode && (
            <form onSubmit={handleSubmit} className="fee-form">
              {paymentMode === 'easypaisa' && (
                <div className="easypaisa-instructions">
                  <div className="ep-account-info">
                    <p className="text-muted">Send payment to the following EasyPaisa account:</p>
                    <h3 style={{ color: '#10b981', margin: '10px 0', fontSize: '1.4rem' }}>0342 6930403</h3>
                    <p>Account Title: <strong>BSL Academy</strong></p>
                  </div>
                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label>Transaction ID (Trx ID)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={trxId} 
                      onChange={(e) => setTrxId(e.target.value)} 
                      placeholder="e.g. 12345678901"
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMode === 'offline' && (
                <div className="offline-instructions">
                  <div className="ep-account-info" style={{ background: 'rgba(255, 165, 0, 0.05)', borderColor: '#fbbf24' }}>
                    <h3 style={{ color: '#fbbf24', margin: '10px 0', fontSize: '1.2rem' }}>Manual Cash / Bank Deposit</h3>
                    <p>Please pay your fees directly at the BSL Academy campus or designated bank branch.</p>
                    {globalSettings && globalSettings.offlineAnnouncement && (
                      <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: '4px', textAlign: 'left' }}>
                        <strong style={{ color: '#ef4444', display: 'block', marginBottom: '5px' }}>Important Announcement:</strong>
                        <span style={{ color: 'var(--text-main)' }}>{globalSettings.offlineAnnouncement}</span>
                      </div>
                    )}
                    <p className="text-muted" style={{ marginTop: '15px' }}>By submitting this form, you are notifying the administration to expect and verify your manual payment.</p>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                {loading ? 'Processing...' : 'Submit Payment Info'}
              </button>
            </form>
          )}
        </div>

        <div className="fee-history-card card-premium">
          <h2>Payment History</h2>
          <div className="history-list">
            {feeHistory.length === 0 ? (
              <div className="empty-state">
                <p className="text-muted">No payment records found.</p>
              </div>
            ) : (
              feeHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-info">
                    <span className="history-mode">{item.mode === 'easypaisa' ? 'EasyPaisa' : 'Offline'}</span>
                    <span className="history-date">{item.date}</span>
                    {item.trxId && <span className="history-trx">Trx ID: {item.trxId}</span>}
                  </div>
                  <div className="history-status">
                    <span className={`status-badge ${item.status === 'Verified' ? 'pass' : (item.status === 'Rejected' ? 'fail' : 'warning')}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeePayment;
