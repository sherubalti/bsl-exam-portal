import React, { useState, useEffect } from 'react';
import { exportResultsToExcel, exportProjectsToExcel } from '../utils/exportToExcel';
import { getCurrentPKTTime, formatForDateTimeInput } from '../utils/timeUtility';
import examScheduleConfig from '../data/examSchedule';
import { db } from '../firebase';
import { ref, set, get, child, update, remove } from "firebase/database";

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
        // Include the key (userKey) for deletion purposes
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
        alert('Student account created in Cloud!');
        setNewStudent({ userId: '', name: '', password: '' });
        // Refresh local state
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
      alert('Settings saved to Cloud successfully!');
    });
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <button className={activeTab === 'students' ? 'btn btn-primary' : 'btn'} onClick={() => { setActiveTab('students'); setSelectedResult(null); }}>Manage Students</button>
        <button className={activeTab === 'results' ? 'btn btn-primary' : 'btn'} onClick={() => { setActiveTab('results'); setSelectedResult(null); }}>Exam Results</button>
        <button className={activeTab === 'schedule' ? 'btn btn-primary' : 'btn'} onClick={() => { setActiveTab('schedule'); setSelectedResult(null); }}>Exam Settings</button>
      </div>

      {activeTab === 'students' && (
        <div className="card">
          <h2>Assign Student Login IDs</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Create new student accounts for login access.</p>
          
          <form onSubmit={handleAddStudent} style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', marginBottom: '30px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Login User ID:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. bsl-2024-001"
                  value={newStudent.userId} 
                  onChange={e => setNewStudent({...newStudent, userId: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Full Name:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Student Full Name"
                  value={newStudent.name} 
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Login Password:</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Assign Password"
                  value={newStudent.password} 
                  onChange={e => setNewStudent({...newStudent, password: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: '20px', width: '100%', maxWidth: '250px' }}>Create Student Account</button>
          </form>

          <h3>Registered Student Accounts</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.userId}>
                    <td style={{ fontWeight: '600' }}>{s.userId}</td>
                    <td>{s.name}</td>
                    <td><code>{s.password}</code></td>
                    <td>
                      <button className="btn btn-small btn-danger" onClick={() => deleteStudent(s.userId)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#999', padding: '30px' }}>No student accounts created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'results' && !selectedResult && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>Exam Results & Projects</h2>
            <button className="btn btn-success" onClick={() => exportResultsToExcel(results)}>Export to Excel</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>User ID</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>%</th>
                  <th>Project File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const project = projects.find(p => p.email === r.email);
                  return (
                    <tr key={i}>
                      <td>{r.studentName}</td>
                      <td>{r.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{r.course?.replace('_', ' ') || 'General'}</td>
                      <td>{r.score}/{r.totalQuestions}</td>
                      <td style={{ fontWeight: 'bold', color: r.percentage >= 50 ? '#4CAF50' : '#f44336' }}>
                        {r.percentage}%
                      </td>
                      <td>
                        {project ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 'bold' }}>{project.title}</div>
                            <div style={{ color: '#666' }}>{project.fileName} ({project.fileSize})</div>
                          </div>
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>No Project</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="btn btn-small btn-primary" 
                            onClick={() => setSelectedResult(r)}
                          >
                            Details
                          </button>
                          <button 
                            className="btn btn-small btn-danger" 
                            onClick={() => deleteResult(r.userKey)}
                          >
                            Delete
                          </button>
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
        <div className="card" style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            <h2>Exam Details: {selectedResult.studentName}</h2>
            <button className="btn btn-small" onClick={() => setSelectedResult(null)}>Back to List</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
              <h4>Student Information</h4>
              <p><strong>Full Name:</strong> {selectedResult.studentName}</p>
              <p><strong>User ID:</strong> {selectedResult.email}</p>
              <p><strong>Topic:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedResult.course?.replace('_', ' ') || 'General'}</span></p>
              <p><strong>Date:</strong> {selectedResult.date}</p>
            </div>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
              <h4>Performance Summary</h4>
              <p><strong>Score:</strong> {selectedResult.score} / {selectedResult.totalQuestions}</p>
              <p><strong>Percentage:</strong> {selectedResult.percentage}%</p>
              <p><strong>Time Taken:</strong> {selectedResult.timeTaken}</p>
              <p><strong>Violations:</strong> {selectedResult.violationCount || 0}</p>
            </div>
          </div>

          <h3>Question Breakdown</h3>
          {selectedResult.details ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {selectedResult.details.map((q, idx) => (
                <div key={idx} style={{ 
                  padding: '15px', 
                  borderRadius: '8px', 
                  border: `1px solid ${q.isCorrect ? '#c8e6c9' : '#ffcdd2'}`,
                  background: q.isCorrect ? '#f1f8e9' : '#fff9f9'
                }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>Q{idx + 1}: {q.question}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: '#666' }}>Student Answer:</span> 
                      <span style={{ 
                        marginLeft: '5px', 
                        fontWeight: 'bold', 
                        color: q.isCorrect ? '#2e7d32' : '#c62828' 
                      }}>
                        {q.userAnswer ? q.userAnswer.toUpperCase() : 'None'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Correct Answer:</span> 
                      <span style={{ marginLeft: '5px', fontWeight: 'bold', color: '#2e7d32' }}>
                        {q.correctAnswer.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No question details available for this result.</p>
          )}
        </div>
      )}

      {/* Projects Tab Removed as it is now integrated into Results */}

      {activeTab === 'schedule' && (
        <div className="card">
          <h2>Exam Scheduling</h2>
          <div style={{ textAlign: 'left' }}>
            {examSchedule.slots.map((slot, index) => (
              <div key={index} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>Slot #{index + 1}</strong>
                  <button className="btn btn-small btn-danger" onClick={() => removeSlot(index)}>Remove</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Class:</label>
                    <select className="form-control" value={slot.course} onChange={e => handleSlotChange(index, 'course', e.target.value)}>
                      <option value="bsl_class1">BSL Class 1 (Python Var-Func)</option>
                      <option value="bsl_class2">BSL Class 2 (NumPy/Pandas)</option>
                      <option value="bsl_class3">BSL Class 3 (ML/Viz)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration (Min):</label>
                    <input type="number" className="form-control" value={slot.duration || ''} onChange={e => handleSlotChange(index, 'duration', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Start (PKT):</label>
                    <input type="datetime-local" className="form-control" value={slot.start} onChange={e => handleSlotChange(index, 'start', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>End (PKT):</label>
                    <input type="datetime-local" className="form-control" value={slot.end} onChange={e => handleSlotChange(index, 'end', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-primary" onClick={addSlot} style={{ marginRight: '10px' }}>Add Slot</button>
            <button className="btn btn-success" onClick={handleSaveSchedule}>Save Settings</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
