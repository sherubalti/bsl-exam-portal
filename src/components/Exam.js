import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import webMcqs from '../data/web_mcqs.json';
import oldMcqs from '../data/old_mcqs.json';
import pythonDsaMcqs from '../data/mcqs_python_dsa.json';
import bslClass1 from '../data/bsl_class1.json';
import bslClass2 from '../data/bsl_class2.json';
import bslClass3 from '../data/bsl_class3.json';
import examSchedule from '../data/examSchedule';
import { getCurrentPKTTime } from '../utils/timeUtility';
import { db } from '../firebase';
import { ref, get, child, set, update } from "firebase/database";
import '../Exam.css';

const Exam = ({ user }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); 
  const [examStarted, setExamStarted] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState('active'); 
  const [activeSlot, setActiveSlot] = useState(null);
  const [activeSlots, setActiveSlots] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(examSchedule);
  const [loadingTime, setLoadingTime] = useState(true);
  const [examSubmitted, setExamSubmitted] = useState(false);

  const mcqModules = {
    web: webMcqs,
    new_ai: pythonDsaMcqs,
    old_ai: oldMcqs,
    bsl_class1: bslClass1,
    bsl_class2: bslClass2,
    bsl_class3: bslClass3
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (examSubmitted) return;
    
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0 && !isAutoSubmit) {
      const confirmSubmit = window.confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`);
      if (!confirmSubmit) return;
    }

    setExamSubmitted(true);
    let score = 0;
    const results = [];

    questions.forEach((question, index) => {
      const isCorrect = answers[index] === question.answer;
      if (isCorrect) score++;
      results.push({
        question: question.question || 'N/A',
        options: question.options || [],
        userAnswer: answers[index] || '',
        correctAnswer: question.answer || '',
        isCorrect: isCorrect,
        explanation: question.explanation || 'No explanation available.'
      });
    });

    const nowPKT = await getCurrentPKTTime();
    const finalResult = {
      studentName: user.name,
      email: user.email,
      score: score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      date: nowPKT.toLocaleString('en-PK', { dateStyle: 'medium' }),
      course: activeSlot?.course || 'General',
      timeTaken: formatTime((activeSlot?.duration || 60) * 60 - timeLeft),
      details: results,
      violationCount: violationCount
    };

    const userKey = user.email.replace(/\./g, ',');
    await set(ref(db, `examResults/${userKey}`), finalResult);

    try {
      const studentSnapshot = await get(child(ref(db), `students/${userKey}`));
      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.val();
        await update(ref(db, `students/${userKey}`), {
          averageScore: Math.round((score / questions.length) * 100),
          attempts: (studentData.attempts || 0) + 1
        });
      }
    } catch (e) {
      console.error("Error updating student stats:", e);
    }

    navigate('/result');
  }, [questions, answers, user, timeLeft, violationCount, navigate, examSubmitted, activeSlot]);

  useEffect(() => {
    const checkSchedule = async () => {
      const dbRef = ref(db);
      const userKey = user.email.replace(/\./g, ',');
      
      const attemptSnapshot = await get(child(dbRef, `examResults/${userKey}`));
      if (attemptSnapshot.exists()) {
        navigate('/result');
        return;
      }

      let schedule = examSchedule;
      const scheduleSnapshot = await get(child(dbRef, 'examSchedule'));
      if (scheduleSnapshot.exists()) {
        schedule = scheduleSnapshot.val();
        setCurrentSchedule(schedule);
      }

      const now = await getCurrentPKTTime();
      setLoadingTime(false);

      const activeList = schedule.slots.filter(slot => {
        const start = new Date(slot.start);
        const end = new Date(slot.end);
        return now >= start && now <= end;
      });

      if (activeList.length > 0) {
        setScheduleStatus('active');
        setActiveSlots(activeList);
        if (activeList.length === 1) selectSlot(activeList[0]);
      } else {
        const latestEnd = new Date(Math.max(...schedule.slots.map(s => new Date(s.end))));
        setScheduleStatus(now > latestEnd ? 'ended' : 'upcoming');
      }
    };
    checkSchedule();
  }, [user.email, navigate]);

  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    const handleViolation = () => {
      setViolationCount(prev => {
        const next = prev + 1;
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        if (next >= 3) handleSubmit(true);
        return next;
      });
    };
    const handleVisibility = () => { if (document.hidden) handleViolation(); };
    const handleBlur = () => handleViolation();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examStarted, examSubmitted, handleSubmit]);

  useEffect(() => {
    if (!examStarted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, handleSubmit]);

  const selectSlot = (slot) => {
    setActiveSlot(slot);
    setTimeLeft((slot.duration || 60) * 60);
    const course = slot.course || 'web';
    setQuestions(shuffleArray(mcqModules[course]?.questions || webMcqs.questions));
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loadingTime) return (
    <div className="exam-container">
      <div className="card-premium" style={{ textAlign: 'center' }}>
        <div className="badge-premium mb-4">Security Protocol</div>
        <h3>Initializing Secure Environment...</h3>
        <p className="text-muted">Please wait while we verify your session and load the assessment.</p>
      </div>
    </div>
  );

  if (scheduleStatus !== 'active' || (scheduleStatus === 'active' && !activeSlot)) {
    return (
      <div className="exam-container">
        <div className="instruction-card">
          <div className="badge-premium mb-4">Exam Portal</div>
          <h2>{scheduleStatus === 'upcoming' ? 'Upcoming Assessments' : scheduleStatus === 'ended' ? 'Assessment Window Closed' : 'Select Specialized Track'}</h2>
          <div className="slots-list">
            {(scheduleStatus === 'active' ? activeSlots : currentSchedule.slots).map((slot, i) => (
              <div key={i} className="slot-item" onClick={() => scheduleStatus === 'active' && selectSlot(slot)}>
                <div className="slot-info">
                  <strong>{(slot.course || 'General').replace('_', ' ').toUpperCase()}</strong>
                  <span>{new Date(slot.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(slot.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                {scheduleStatus === 'active' && <button className="select-btn">Start →</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="exam-container">
        <div className="instruction-card">
          <div className="badge-premium mb-4">Ready for Assessment?</div>
          <h1>{activeSlot.course.replace('_', ' ').toUpperCase()}</h1>
          <div className="exam-meta-grid">
            <div className="meta-box"><span>Questions</span><strong>{questions.length}</strong></div>
            <div className="meta-box"><span>Duration</span><strong>{activeSlot.duration}m</strong></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setExamStarted(true)}>
            Begin Professional Assessment
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  return (
    <div className="exam-active-page">
      {showWarning && <div className="violation-alert">Violation {violationCount}/3: Browser Focus Lost!</div>}
      
      <div className="exam-header-bar">
        <div className="q-progress">
          <span className="badge-premium">Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        <div className={`exam-timer ${timeLeft < 300 ? 'timer-low' : ''}`}>
          <strong>⏱ {formatTime(timeLeft)}</strong>
        </div>
      </div>

      <div className="question-area">
        <div className="progress-bar-container" style={{ width: '100%', height: '4px', background: 'var(--border-light)', marginBottom: '40px', borderRadius: '2px', overflow: 'hidden' }}>
          <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
        </div>
        <div className="q-category">{q.category}</div>
        <h2 className="q-text">{q.question}</h2>
        
        <div className="options-grid">
          {q.options.map((opt, i) => {
            const letter = String.fromCharCode(97 + i);
            return (
              <label key={i} className={`option-card ${answers[currentQuestion] === letter ? 'selected' : ''}`}>
                <input type="radio" name="q" value={letter} checked={answers[currentQuestion] === letter} onChange={() => setAnswers({...answers, [currentQuestion]: letter})} />
                <span className="opt-letter">{letter.toUpperCase()}</span>
                <span className="opt-text">{opt}</span>
              </label>
            );
          })}
        </div>

        <div className="exam-nav-btns">
          <button className="btn btn-outline" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(prev => prev - 1)}>
            ← Previous
          </button>
          
          <div className="q-dots">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`dot ${currentQuestion === i ? 'active' : answers[i] ? 'answered' : ''}`} 
                onClick={() => setCurrentQuestion(i)}
                title={`Question ${i + 1}`}
              ></div>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? 
            <button className="btn btn-primary" onClick={() => handleSubmit()}>Submit Exam</button> :
            <button className="btn btn-primary" onClick={() => setCurrentQuestion(prev => prev + 1)}>Next Question →</button>
          }
        </div>
      </div>
    </div>
  );
};

export default Exam;
