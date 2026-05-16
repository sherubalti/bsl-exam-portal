import React, { useState, useEffect } from 'react';
import { exportResultsToExcel, exportProjectsToExcel } from '../utils/exportToExcel';
import { getCurrentPKTTime, formatForDateTimeInput } from '../utils/timeUtility';
import examScheduleConfig from '../data/examSchedule';
import { db } from '../firebase';
import { ref, set, get, child, update, remove } from "firebase/database";
import '../AdminDashboard.css';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('results');
  const [selectedResult, setSelectedResult] = useState(null);
  const [examSchedule, setExamSchedule] = useState({
    duration: 75,
    slots: []
  });
  const [newStudent, setNewStudent] = useState({
    userId: '',
    name: '',
    password: ''
  });

  useEffect(() => {
    const dbRef = ref(db);

    // Load students from Firebase
    get(child(dbRef, 'students')).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(id => ({ userId: id, ...data[id] }));
        setStudents(list);
      }
    });

    // Load results from Firebase
    get(child(dbRef, 'examResults')).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ ...data[key], userKey: key }));
        setResults(list);
      }
    });

    // Load projects from Firebase
    get(child(dbRef, 'studentProjects')).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setProjects(Object.values(data));
      }
    });

    // Load schedule from Firebase
    get(child(dbRef, 'examSchedule')).then((snapshot) => {
      if (snapshot.exists()) {
        setExamSchedule(snapshot.val());
      } else {
        setExamSchedule(examScheduleConfig);
      }
    });
  }, []);

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.userId || !newStudent.password) {
      alert('User ID and Password are required');
      return;
    }

    const studentData = {
      name: newStudent.name || newStudent.userId,
      password: newStudent.password,
      joinDate: new Date().toISOString(),
      averageScore: 0,
      attempts: 0
    };

    set(ref(db, 'students/' + newStudent.userId), studentData)
      .then(() => {
        alert('Student account created successfully!');
        setNewStudent({ userId: '', name: '', password: '' });
        setStudents(prev => [...prev, { userId: newStudent.userId, ...studentData }]);
      });
  };

  const deleteStudent = (userId) => {
    if (window.confirm(`Delete student account ${userId}?`)) {
      remove(ref(db, 'students/' + userId)).then(() => {
        setStudents(prev => prev.filter(s => s.userId !== userId));
      });
    }
  };

  const deleteResult = (userKey) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY remove this exam result?`)) {
      remove(ref(db, 'examResults/' + userKey)).then(() => {
        setResults(prev => prev.filter(r => r.userKey !== userKey));
        alert('Result deleted successfully');
      }).catch(err => alert('Error deleting result: ' + err.message));
    }
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...examSchedule.slots];
    let processedValue = value;
    
    if (field === 'duration') {
      processedValue = parseInt(value) || 0;
    }
    
    newSlots[index] = { ...newSlots[index], [field]: processedValue };
    setExamSchedule(prev => ({ ...prev, slots: newSlots }));
  };

  const addSlot = async () => {
    const now = await getCurrentPKTTime();
    const end = new Date(now.getTime() + 75 * 60 * 1000);
    
    setExamSchedule(prev => ({
      ...prev,
      slots: [...prev.slots, {
        start: formatForDateTimeInput(now),
        end: formatForDateTimeInput(end),
        course: 'bsl_class1',
        duration: 75
      }]
    }));
  };

  const removeSlot = (index) => {
    const newSlots = examSchedule.slots.filter((_, i) => i !== index);
    setExamSchedule(prev => ({ ...prev, slots: newSlots }));
  };

  const handleSaveSchedule = () => {
    set(ref(db, 'examSchedule'), examSchedule).then(() => {
      alert('Settings saved successfully!');
    });
  };

  return (
    <div className="container admin-dashboard-container">
      <header className="admin-header">
        <h1>Admin Control Panel</h1>
        <div className="header-actions">
          <span className="ai-gradient-text" style={{ fontWeight: 700 }}>BSL Systems</span>
        </div>
      </header>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('results'); setSelectedResult(null); }}
        >
          Exam Results
        </button>
        <button 
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('students'); setSelectedResult(null); }}
        >
          Student Registry
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('schedule'); setSelectedResult(null); }}
        >
          Global Settings
        </button>
      </div>

      {activeTab === 'students' && (
        <div className="card-premium">
          <div className="admin-card-header">
            <div>
              <h2>User Management</h2>
              <p className="text-muted">Create and manage student access credentials.</p>
            </div>
          </div>
          
          <form onSubmit={handleAddStudent} className="detail-section" style={{ marginBottom: '40px' }}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Access ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. bsl-2024-001"
                  value={newStudent.userId} 
                  onChange={e => setNewStudent({...newStudent, userId: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Full legal name"
                  value={newStudent.name} 
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Security Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Assign secure password"
                  value={newStudent.password} 
                  onChange={e => setNewStudent({...newStudent, password: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Initialize Account</button>
          </form>

          <h3>Active Students</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student Profile</th>
                  <th>Security Key</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.userId}>
                    <td>
                      <div className="user-info-block">
                        <span className="user-info-name">{s.name}</span>
                        <span className="user-info-id">{s.userId}</span>
                      </div>
                    </td>
                    <td><code style={{ background: 'var(--bg-subtle)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 600 }}>{s.password}</code></td>
                    <td><span className="status-badge pass">Active</span></td>
                    <td>
                      <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#fee2e2' }} onClick={() => deleteStudent(s.userId)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'results' && !selectedResult && (
        <div className="card-premium">
          <div className="admin-card-header">
            <div>
              <h2>Examination Analytics</h2>
              <p className="text-muted">Review student performance across all test modules.</p>
            </div>
            <button className="btn btn-primary" onClick={() => exportResultsToExcel(results)}>Export Data (.xlsx)</button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Module</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Project Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const project = projects.find(p => p.email === r.email);
                  return (
                    <tr key={i}>
                      <td>
                        <div className="user-info-block">
                          <span className="user-info-name">{r.studentName}</span>
                          <span className="user-info-id">{r.email}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {r.course?.replace('_', ' ').toUpperCase() || 'CORE'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{r.score} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>/ {r.totalQuestions}</span></td>
                      <td>
                        <span className={`status-badge ${r.percentage >= 50 ? 'pass' : 'fail'}`}>
                          {r.percentage >= 50 ? 'PASS' : 'FAIL'} • {r.percentage}%
                        </span>
                      </td>
                      <td>
                        {project ? (
                          <div style={{ fontSize: '0.8rem' }}>
                            <div style={{ fontWeight: 600, color: '#2563eb' }}>{project.title}</div>
                            <div className="text-muted">{project.fileName}</div>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontStyle: 'italic' }}>Pending</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-outline" onClick={() => setSelectedResult(r)}>Report</button>
                          <button className="btn btn-outline" style={{ color: '#ef4444' }} onClick={() => deleteResult(r.userKey)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'results' && selectedResult && (
        <div className="card-premium">
          <div className="admin-card-header">
            <div>
              <h2>Performance Insight</h2>
              <p className="text-muted">Detailed breakdown for {selectedResult.studentName}.</p>
            </div>
            <button className="btn btn-outline" onClick={() => setSelectedResult(null)}>Return to List</button>
          </div>
          
          <div className="metrics-dashboard mb-10">
            <div className="metric-card">
              <span className="metric-label">Candidate Name</span>
              <span className="metric-value">{selectedResult.studentName}</span>
              <span className="metric-subtext">{selectedResult.email}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Final Score</span>
              <span className="metric-value highlight">{selectedResult.score} / {selectedResult.totalQuestions}</span>
              <span className="metric-subtext">Completion: {selectedResult.percentage}%</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Time Utilization</span>
              <span className="metric-value">{selectedResult.timeTaken}</span>
              <span className="metric-subtext">Session Date: {selectedResult.date}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Integrity Status</span>
              <span className={`metric-value ${selectedResult.violationCount > 0 ? 'warning' : 'secure'}`}>
                {selectedResult.violationCount || 0} Alerts
              </span>
              <span className="metric-subtext">Proctoring System</span>
            </div>
          </div>

          <h3 className="mb-6">Question Audit Log</h3>
          {selectedResult.details ? (
            <div className="question-audit-list">
              {selectedResult.details.map((q, idx) => (
                <div key={idx} className={`audit-item ${q.isCorrect ? 'audit-pass' : 'audit-fail'}`}>
                  <div className="audit-header">
                    <span className="q-number">Q{idx + 1}</span>
                    <p className="q-text">{q.question}</p>
                  </div>
                  <div className="audit-details">
                    <div className="audit-row">
                      <span className="audit-label">Candidate Response:</span> 
                      <span className={`audit-response ${q.isCorrect ? 'text-success' : 'text-danger'}`}>
                        {q.userAnswer ? q.userAnswer.toUpperCase() : 'NO RESPONSE'}
                      </span>
                    </div>
                    {!q.isCorrect && (
                      <div className="audit-row">
                        <span className="audit-label">System Validation:</span> 
                        <span className="audit-response text-success">
                          {q.correctAnswer.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="text-muted">No granular metrics available for this session archive.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="card-premium">
          <div className="admin-card-header">
            <div>
              <h2>BSL Exam Schedule</h2>
              <p className="text-muted">Configure active slots and session durations for Skardu center.</p>
            </div>
          </div>
          
          <div className="slots-container">
            {examSchedule.slots.map((slot, index) => (
              <div key={index} className="slot-card">
                <div className="slot-card-header">
                  <strong>Slot Config #{index + 1}</strong>
                  <button className="btn btn-outline" style={{ color: '#ef4444' }} onClick={() => removeSlot(index)}>Remove Slot</button>
                </div>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Assigned Module</label>
                    <select className="form-control" value={slot.course} onChange={e => handleSlotChange(index, 'course', e.target.value)}>
                      <option value="python_ai">Python for AI & Data Science</option>
                      <option value="advanced_ai">Advanced Artificial Intelligence</option>
                      <option value="data_science">Professional Data Science</option>
                      <option value="web_adv">Advanced Web Development</option>
                      <option value="dsa">Data Structures & Algorithms</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration (Minutes)</label>
                    <input type="number" className="form-control" value={slot.duration || ''} onChange={e => handleSlotChange(index, 'duration', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Activation Time (PKT)</label>
                    <input type="datetime-local" className="form-control" value={slot.start} onChange={e => handleSlotChange(index, 'start', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Termination Time (PKT)</label>
                    <input type="datetime-local" className="form-control" value={slot.end} onChange={e => handleSlotChange(index, 'end', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={addSlot}>Append New Slot</button>
              <button className="btn btn-primary" onClick={handleSaveSchedule}>Commit Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

