import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, get, child } from "firebase/database";
import { getCurrentPKTTime } from '../utils/timeUtility';
import examSchedule from '../data/examSchedule';
import '../StudentDashboard.css';

const StudentDashboard = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState({ slots: [] });
  const [pktTime, setPktTime] = useState(new Date());
  const [isExamActive, setIsExamActive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const dbRef = ref(db);
      const userKey = user.email.replace(/\./g, ',');
      try {
        const snapshot = await get(child(dbRef, `students/${userKey}`));
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }

        const historySnapshot = await get(child(dbRef, `examResults/${userKey}`));
        if (historySnapshot.exists()) {
          const historyData = historySnapshot.val();
          if (historyData.score !== undefined) {
            setExamHistory([historyData]);
          } else {
            const list = Object.values(historyData).sort((a, b) => 
              new Date(b.date) - new Date(a.date)
            );
            setExamHistory(list);
          }
        }

        const scheduleSnapshot = await get(child(dbRef, 'examSchedule'));
        let currentSchedule = { slots: [] };
        if (scheduleSnapshot.exists()) {
          const remoteSchedule = scheduleSnapshot.val();
          const mergedSlots = [...(remoteSchedule.slots || [])];
          (examSchedule.slots || []).forEach(localSlot => {
            const exists = mergedSlots.some(remoteSlot => remoteSlot.course === localSlot.course && remoteSlot.start === localSlot.start && remoteSlot.end === localSlot.end);
            if (!exists) mergedSlots.push(localSlot);
          });
          currentSchedule = { ...remoteSchedule, slots: mergedSlots };
          setSchedule(currentSchedule);
        } else {
          currentSchedule = examSchedule;
          setSchedule(currentSchedule);
        }

        const nowPKT = await getCurrentPKTTime();
        setPktTime(nowPKT);
        
        if (currentSchedule && currentSchedule.slots) {
          const hasActiveSlot = currentSchedule.slots.some(slot => {
            const start = new Date(slot.start);
            const end = new Date(slot.end);
            return nowPKT >= start && nowPKT <= end;
          });
          setIsExamActive(hasActiveSlot);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.email, user.name]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div className="ai-gradient-text" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Synchronizing Dashboard...</div>
      </div>
    );
  }

  const attendance = userData?.attendance || { present: 0, absent: 0, leave: 0 };
  const assignments = userData?.assignments || { submitted: 0, total: 0 };
  const totalClasses = (attendance.present || 0) + (attendance.absent || 0) + (attendance.leave || 0);
  const attendanceRate = totalClasses > 0 ? Math.round((attendance.present / totalClasses) * 100) : 0;

  return (
    <div className="container student-dashboard-container">
      <header className="student-header">
        <h1>Welcome, {user.name.split(' ')[0]}</h1>
        <p>Monitor your academic progress and upcoming assessments.</p>
      </header>
      
      <div className="stat-grid">
        <div className="stat-card">
          <h3>{userData?.progress || 0}%</h3>
          <p>Course Progress</p>
        </div>
        <div className="stat-card">
          <h3>{attendanceRate}%</h3>
          <p>Attendance</p>
        </div>
        <div className="stat-card">
          <h3>{assignments.submitted}/{assignments.total}</h3>
          <p>Assignments</p>
        </div>
        <div className="stat-card">
          <h3>{userData?.averageScore || 0}%</h3>
          <p>Academic Rating</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3><span>📅</span> Examination Schedule</h3>
        <div className="schedule-list">
          {(() => {
            const slots = schedule.slots || [];
            if (slots.length === 0) return <div className="card text-muted">No exams are currently scheduled for your batch.</div>;

            return slots.map((slot, index) => {
              const start = new Date(slot.start);
              const end = new Date(slot.end);
              const isActive = pktTime >= start && pktTime <= end;
              const isUpcoming = pktTime < start;
              const isClassAssignment = slot.course === 'class_assignments';

              if (isClassAssignment) {
                return (
                  <div key={index} className={`schedule-item class-assignment ${isActive ? 'active' : ''}`}>
                    <div className="schedule-info" style={{ color: 'white', flex: 1 }}>
                      <div className="assignment-badge">📚 CLASS ASSIGNMENT</div>
                      <div className="assignment-title">Coding Assignments</div>
                      <div className="assignment-count">Complete practical programming tasks and submit your solutions</div>
                      <div className="module-time" style={{ marginTop: '12px', opacity: 0.95 }}>
                        Available: {start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} — {end.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      {isActive && <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.75rem', marginTop: '8px', display: 'block' }}>● ASSIGNMENTS AVAILABLE</span>}
                    </div>
                    <div className="assignment-icon">📝</div>
                    <div style={{ marginLeft: '16px' }}>
                      {isActive ? (
                        <a href="/exam" className="btn btn-primary" style={{ background: 'white', color: '#667eea' }}>Start Assignment</a>
                      ) : (
                        <button className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }} disabled>{isUpcoming ? 'Coming Soon' : 'Closed'}</button>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={index} className={`schedule-item ${isActive ? 'active' : isUpcoming ? 'upcoming' : ''}`}>
                  <div className="schedule-info">
                    <span className="module-name">{(slot.course || 'General').replace('_', ' ').toUpperCase()}</span>
                    <div className="module-time">
                      Window: {start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} — {end.toLocaleString([], { timeStyle: 'short' })}
                    </div>
                    {isActive && <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.75rem' }}>● SESSION LIVE</span>}
                  </div>
                  {isActive ? (
                    <a href="/exam" className="btn btn-primary">Join Session</a>
                  ) : (
                    <button className="btn btn-outline" disabled>{isUpcoming ? 'Scheduled' : 'Closed'}</button>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>

      <div className="dashboard-section">
        <h3><span>🏆</span> Latest Performance</h3>
        {!examHistory[0] ? (
          <div className="card text-muted">Assessment records will appear here after your first exam.</div>
        ) : (
          <div className="result-preview-card">
            <div className="result-info">
              <h4>{examHistory[0].course?.replace('_', ' ').toUpperCase() || 'GENERAL ASSESSMENT'}</h4>
              <p>Session Date: {examHistory[0].date}</p>
              <div style={{ marginTop: '16px' }}>
                <a href="/result" className="btn btn-primary" style={{ background: '#3b82f6', color: 'white', border: 'none' }}>View Detailed Report</a>
              </div>
            </div>
            <div className="result-score-badge">
              <div className="score-percent">{examHistory[0].percentage}%</div>
              <div className="score-status" style={{ color: examHistory[0].percentage >= 50 ? '#10b981' : '#ef4444' }}>
                {examHistory[0].percentage >= 50 ? 'PASSED' : 'UNSUCCESSFUL'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h3><span>⚡</span> Quick Actions</h3>
        <div className="action-grid">
          <a href="/project-upload" className="btn btn-outline">Submit Project</a>
          <a href="/result" className="btn btn-outline">Academic Transcript</a>
          <a href="https://wa.me/923426930403" target="_blank" rel="noreferrer" className="btn btn-outline">Support Desk</a>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

