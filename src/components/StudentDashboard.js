import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, get, child } from "firebase/database";
import { getCurrentPKTTime } from '../utils/timeUtility';

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

        // Load exam history from Firebase
        const historySnapshot = await get(child(dbRef, `examResults/${userKey}`));
        if (historySnapshot.exists()) {
          const historyData = historySnapshot.val();
          // If old format (single object), wrap in array
          if (historyData.score !== undefined) {
            setExamHistory([historyData]);
          } else {
            // New format (object of attempts), convert to sorted array
            const list = Object.values(historyData).sort((a, b) => 
              new Date(b.date) - new Date(a.date)
            );
            setExamHistory(list);
          }
        }

        // Load schedule from Firebase
        const scheduleSnapshot = await get(child(dbRef, 'examSchedule'));
        let currentSchedule = { slots: [] };
        if (scheduleSnapshot.exists()) {
          currentSchedule = scheduleSnapshot.val();
          setSchedule(currentSchedule);
        }

        // Check if any exam is active right now in PKT
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
    return <div>Loading your dashboard...</div>;
  }

  // Ensure nested objects exist to prevent crashes
  const attendance = userData?.attendance || { present: 0, absent: 0, leave: 0 };
  const assignments = userData?.assignments || { submitted: 0, total: 0 };
  
  const totalClasses = (attendance.present || 0) + (attendance.absent || 0) + (attendance.leave || 0);
  const attendanceRate = totalClasses > 0 ? Math.round((attendance.present / totalClasses) * 100) : 0;

  return (
    <div className="container">
      <h1>Student Dashboard</h1>
      <p>Welcome back, {user.name}!</p>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>{userData?.progress || 0}%</h3>
          <p>Overall Progress</p>
        </div>
        
        <div className="dashboard-card">
          <h3>{attendance.present}/30</h3>
          <p>Classes Attended</p>
        </div>
        
        <div className="dashboard-card">
          <h3>{assignments.submitted}/{assignments.total}</h3>
          <p>Assignments Submitted</p>
        </div>
        
        <div className="dashboard-card">
          <h3>{userData?.averageScore || 0}%</h3>
          <p>Average Score</p>
        </div>
      </div>

      <div className="card">
        <h3>Attendance Summary</h3>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>{attendance.present}</h3>
            <p>Present</p>
          </div>
          <div className="dashboard-card">
            <h3>{attendance.absent}</h3>
            <p>Absent</p>
          </div>
          <div className="dashboard-card">
            <h3>{attendance.leave}</h3>
            <p>Leave</p>
          </div>
          <div className="dashboard-card">
            <h3>{attendanceRate}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Exam Schedule</h3>
        <div style={{ textAlign: 'left' }}>
          {(() => {
            const slots = schedule.slots || [];
            
            if (slots.length === 0) {
              return <p>No exams currently scheduled.</p>;
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {slots.map((slot, index) => {
                  const start = new Date(slot.start);
                  const end = new Date(slot.end);
                  const isActive = pktTime >= start && pktTime <= end;
                  const isUpcoming = pktTime < start;

                  return (
                    <div key={index} style={{ 
                      padding: '15px', 
                      borderRadius: '8px', 
                      borderLeft: `5px solid ${isActive ? '#4CAF50' : isUpcoming ? '#2196F3' : '#9e9e9e'}`,
                      background: '#f9f9f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem' }}>{(slot.course || 'General').replace('_', ' ').toUpperCase()}</strong>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          Start: {start.toLocaleString()} | End: {end.toLocaleString()}
                        </div>
                        {isActive && <span style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '0.8rem' }}>● ACTIVE NOW</span>}
                        {isUpcoming && <span style={{ color: '#2196F3', fontWeight: 'bold', fontSize: '0.8rem' }}>UPCOMING</span>}
                      </div>
                      {isActive ? (
                        <a href="/exam" className="btn btn-small btn-success">Join Exam</a>
                      ) : (
                        <button className="btn btn-small" disabled style={{ opacity: 0.5 }}>Unavailable</button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="card">
        <h3>My Last Exam Result</h3>
        {!examHistory[0] ? (
          <p>No past exams found.</p>
        ) : (
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #4CAF50' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0' }}>{examHistory[0].course?.replace('_', ' ').toUpperCase() || 'GENERAL'}</h4>
                <p style={{ margin: '5px 0', color: '#666' }}>Date: {examHistory[0].date}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>{examHistory[0].percentage}%</div>
                <div style={{ 
                  color: examHistory[0].percentage >= 50 ? '#4CAF50' : '#f44336',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>
                  {examHistory[0].percentage >= 50 ? 'PASSED' : 'FAILED'}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <a href="/result" className="btn btn-small btn-primary">View Full Report & Download PDF</a>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {isExamActive ? (
            <a href="/exam" className="btn btn-primary">Take Exam</a>
          ) : (
            <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Take Exam (Disabled)</button>
          )}
          <a href="/result" className="btn btn-success">Download Last Result</a>
          <a href="/project-upload" className="btn">Upload Project</a>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
