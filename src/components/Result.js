import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { db } from '../firebase';
import { ref, get, child } from "firebase/database";
import '../Result.css';

const Result = ({ user }) => {
  const [result, setResult] = useState(null);
  const hasSentRef = useRef(false);

  const sendEmail = (examResult) => {
    if (!examResult) return;
    const SERVICE_ID = "service_5tzm50o";
    const TEMPLATE_ID = "template_wznd4o3";
    const PUBLIC_KEY ="rdrLtx3ektaxB41qt";
    const ADMIN_EMAIL = 'sheralishahid1010@gmail.com';

    const resultId = examResult.date || `${examResult.score}-${examResult.totalQuestions}`;
    try {
      const sentMap = JSON.parse(localStorage.getItem('sentExamEmails') || '{}');
      const userSent = sentMap[user?.email] || [];
      if (userSent.includes(resultId)) return;
      userSent.push(resultId);
      sentMap[user?.email] = userSent;
      localStorage.setItem('sentExamEmails', JSON.stringify(sentMap));
    } catch (e) {}

    const templateParams = {
      user_name: user?.name || user?.email || 'Student',
      user_email: user?.email || '',
      score: examResult.score,
      totalQuestions: examResult.totalQuestions,
      percentage: examResult.percentage,
      timeTaken: examResult.timeTaken,
      date: examResult.date,
      details: examResult.details?.map((d, i) => `Q${i + 1}: ${d.isCorrect ? '✓' : '✗'}`).join('\n')
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => {
        if (ADMIN_EMAIL && ADMIN_EMAIL !== user?.email) {
          emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...templateParams, user_email: ADMIN_EMAIL }, PUBLIC_KEY);
        }
      });
  };

  useEffect(() => {
    const fetchResult = async () => {
      const resultKey = user.email.replace(/\./g, ',');
      const snapshot = await get(child(ref(db), `examResults/${resultKey}`));
      if (snapshot.exists()) {
        const userResult = snapshot.val();
        setResult(userResult);
        if (!hasSentRef.current) { sendEmail(userResult); hasSentRef.current = true; }
      }
    };
    fetchResult();
  }, [user.email]);

  if (!result) return (
    <div className="result-container ai-bg-dark">
      <div className="no-result-card glass-premium">
        <h2>No Results Found</h2>
        <p>You haven't completed any assessments yet.</p>
        <a href="/exam" className="btn-primary-glow">Take Exam Now</a>
      </div>
    </div>
  );

  return (
    <div className="result-page ai-bg-dark">
      <div className="result-header-section">
        <div className="badge-expert">Official Certificate</div>
        <h1>Performance <span>Analytics</span></h1>
      </div>

      <div className="result-summary-grid">
        <div className="summary-card glass-premium">
          <div className="score-ring">
            <span className="score-val">{result.percentage}%</span>
            <span className="score-label">Accuracy</span>
          </div>
        </div>
        <div className="summary-details glass-premium">
          <div className="detail-row"><span>Student</span><strong>{user.name}</strong></div>
          <div className="detail-row"><span>Course</span><strong>{result.course.replace('_', ' ').toUpperCase()}</strong></div>
          <div className="detail-row"><span>Score</span><strong>{result.score} / {result.totalQuestions}</strong></div>
          <div className="detail-row"><span>Status</span><strong className={result.percentage >= 50 ? 'pass' : 'fail'}>{result.percentage >= 50 ? 'PASSED' : 'FAILED'}</strong></div>
        </div>
      </div>

      <div className="result-actions no-print">
        <button className="btn-print" onClick={() => window.print()}>Download Transcript (PDF)</button>
        <a href="/student-dashboard" className="btn-back">Return to Dashboard</a>
      </div>

      <div className="review-section">
        <h2>Question <span>Review</span></h2>
        <div className="review-list">
          {result.details?.map((d, i) => (
            <div key={i} className={`review-card glass-premium ${d.isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
              <div className="review-top">
                <span className="q-num">Question {i + 1}</span>
                <span className={`status-icon ${d.isCorrect ? 'icon-correct' : 'icon-wrong'}`}>
                  {d.isCorrect ? '✓' : '✗'}
                </span>
              </div>
              <h3>{d.question}</h3>
              <div className="answer-compare">
                <div className="ans-box"><span>Your Answer:</span><strong>{d.userAnswer || 'None'}</strong></div>
                <div className="ans-box"><span>Correct Answer:</span><strong>{d.correctAnswer}</strong></div>
              </div>
              {!d.isCorrect && <div className="explanation-box"><strong>Insight:</strong> {d.explanation}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Result;
