import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { db } from '../firebase';
import { ref, get, child } from "firebase/database";

const Result = ({ user }) => {
  const [result, setResult] = useState(null);
  const hasSentRef = useRef(false);



  // Function to send email via EmailJS
  const sendEmail = (examResult) => {
    if (!examResult) return;

    // Read EmailJS config from env with fallbacks to existing values
    const SERVICE_ID = "service_5tzm50o";
    const TEMPLATE_ID = "template_wznd4o3";
    const PUBLIC_KEY ="rdrLtx3ektaxB41qt";
    const ADMIN_EMAIL = 'sheralishahid1010@gmail.com';

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.warn('EmailJS not configured (SERVICE/TEMPLATE/PUBLIC missing). Skipping email send.');
      return;
    }

    // Prevent duplicate sends: check localStorage flag per user+result
    const resultId = examResult.date || `${examResult.score}-${examResult.totalQuestions}-${examResult.timeTaken}`;
    try {
      const sentMap = JSON.parse(localStorage.getItem('sentExamEmails') || '{}');
      const userSent = sentMap[user?.email] || [];
      if (userSent.includes(resultId)) {
        console.log('Result email already sent for', user?.email, resultId);
        return;
      }
      // Mark as sent before sending to prevent duplicates
      userSent.push(resultId);
      sentMap[user?.email] = userSent;
      localStorage.setItem('sentExamEmails', JSON.stringify(sentMap));
    } catch (e) {
      // ignore parse errors and continue
    }

    // Convert detailed results into a readable string (shortened to avoid EmailJS 50kb limit)
    const detailsString = examResult.details?.map((d, i) => 
      `Q${i + 1}: ${d.isCorrect ? 'Correct' : 'Incorrect'}`
    ).join('\n') || 'No details';

    const templateParams = {
      user_name: user?.name || user?.email || 'Student',
      user_email: user?.email || '',
      score: examResult.score || 0,
      totalQuestions: examResult.totalQuestions || 0,
      percentage: examResult.percentage || 0,
      timeTaken: examResult.timeTaken || 'N/A',
      date: examResult.date || 'N/A',
      details: detailsString,
    };

    // Send to user
    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
    .then(() => {
      console.log('Email sent successfully to user');
      if (ADMIN_EMAIL && ADMIN_EMAIL !== (user?.email || '')) {
        const adminParams = { ...templateParams, user_email: ADMIN_EMAIL };
        emailjs.send(SERVICE_ID, TEMPLATE_ID, adminParams, PUBLIC_KEY);
      }
    })
    .catch(err => console.error('Failed to send email:', err));
  };

  // Load result from Firebase and handle EmailJS
  useEffect(() => {
    const fetchAndHandleResult = async () => {
      const resultKey = user.email.replace(/\./g, ',');
      const dbRef = ref(db);
      
      try {
        const snapshot = await get(child(dbRef, `examResults/${resultKey}`));
        if (snapshot.exists()) {
          const userResult = snapshot.val();
          setResult(userResult);
          
          if (userResult && !hasSentRef.current) {
            sendEmail(userResult);
            hasSentRef.current = true;
          }
        }
      } catch (err) {
        console.error("Error fetching result:", err);
      }
    };
    fetchAndHandleResult();
  }, [user.email]);

  if (!result) {
    return (
      <div className="container">
        <div className="card">
          <h2>No Exam Results Found</h2>
          <p>You haven't attempted any exam yet.</p>
          <a href="/exam" className="btn btn-primary">Take Exam</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container result-page">
      <div className="card" id="result-card">
        <div className="result-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#1976d2', margin: '0' }}>BALTISTAN SILICON LAB</h1>
          <p style={{ margin: '5px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#666' }}>Official Exam Result</p>
          <hr style={{ border: '0', borderTop: '2px solid #1976d2', margin: '20px 0' }} />
        </div>

        <div className="student-info" style={{ marginBottom: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Student Information</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Course:</strong> {result.course ? result.course.replace('_', ' ').toUpperCase() : 'N/A'}</p>
        </div>

        <h2>Performance Summary</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>{result.score}/{result.totalQuestions}</h3>
            <p>Score</p>
          </div>
          <div className="dashboard-card">
            <h3>{result.percentage}%</h3>
            <p>Percentage</p>
          </div>
          <div className="dashboard-card">
            <h3>{result.timeTaken}</h3>
            <p>Time Taken</p>
          </div>
          <div className="dashboard-card">
            <h3>{result.date}</h3>
            <p>Date</p>
          </div>
        </div>

        {result.details?.map((detail, index) => (
          <div key={index} className="question-card" style={{ textAlign: 'left' }}>
            <h4 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              Question {index + 1}: {detail.question}
            </h4>
            
            <div className="options-review" style={{ margin: '15px 0' }}>
              {detail.options?.map((option, optIndex) => {
                const letter = String.fromCharCode(97 + optIndex);
                const isSelected = detail.userAnswer === letter;
                const isCorrect = detail.correctAnswer === letter;
                
                let backgroundColor = 'transparent';
                let border = '1px solid #ddd';
                let icon = '';

                if (isSelected && isCorrect) {
                  backgroundColor = '#e8f5e9';
                  border = '2px solid #4CAF50';
                  icon = '✅';
                } else if (isSelected && !isCorrect) {
                  backgroundColor = '#ffebee';
                  border = '2px solid #f44336';
                  icon = '❌';
                } else if (isCorrect) {
                  backgroundColor = '#fff9c4'; // Highlight correct answer if user missed it
                  border = '2px dashed #fbc02d';
                }

                return (
                  <div key={optIndex} style={{
                    padding: '10px 15px',
                    margin: '5px 0',
                    borderRadius: '5px',
                    backgroundColor,
                    border,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span><strong>{letter.toUpperCase()}.</strong> {option}</span>
                    <span style={{ fontWeight: 'bold' }}>
                      {isSelected && (detail.isCorrect ? ' (YOUR CORRECT ANSWER)' : ' (YOUR WRONG ANSWER)')}
                      {isCorrect && !isSelected && ' (CORRECT ANSWER)'}
                      {icon}
                    </span>
                  </div>
                );
              })}
            </div>

            {!detail.isCorrect && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderLeft: '4px solid #f44336' }}>
                <strong>Explanation:</strong> {detail.explanation}
              </div>
            )}
          </div>
        ))}
        <div className="no-print" style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
          <button className="btn btn-primary" onClick={() => window.print()}>
            Download PDF / Print
          </button>
          <a href="/student-dashboard" className="btn btn-success">
            Back to Dashboard
          </a>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .result-page, .result-page * {
            visibility: visible;
          }
          .result-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .card {
            box-shadow: none !important;
            border: none !important;
          }
          .question-card {
            break-inside: avoid;
            border: 1px solid #eee !important;
            margin-bottom: 10px !important;
          }
          .timer, .sidebar, .btn, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Result;
