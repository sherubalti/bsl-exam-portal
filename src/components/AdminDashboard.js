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
  const [activeTab, setActiveTab] = useState('students');
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
        const list = Object.values(data);
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
        <button className={activeTab === 'students' ? 'btn btn-primary' : 'btn'} onClick={() => setActiveTab('students')}>Manage Students</button>
        <button className={activeTab === 'results' ? 'btn btn-primary' : 'btn'} onClick={() => setActiveTab('results')}>Exam Results</button>
        <button className={activeTab === 'projects' ? 'btn btn-primary' : 'btn'} onClick={() => setActiveTab('projects')}>Projects</button>
        <button className={activeTab === 'schedule' ? 'btn btn-primary' : 'btn'} onClick={() => setActiveTab('schedule')}>Exam Settings</button>
      </div>

      {activeTab === 'students' && (
        <div className="card">
          <h2>Student Management</h2>
          <form onSubmit={handleAddStudent} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div>
                <label>User ID:</label>
                <input type="text" className="form-control" value={newStudent.userId} onChange={e => setNewStudent({...newStudent, userId: e.target.value})} required />
              </div>
              <div>
                <label>Full Name:</label>
                <input type="text" className="form-control" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
              </div>
              <div>
                <label>Password:</label>
                <input type="password" className="form-control" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} required />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: '15px' }}>Add Student Account</button>
          </form>

          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Password</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.userId}>
                  <td>{s.userId}</td>
                  <td>{s.name}</td>
                  <td><code>{s.password}</code></td>
                  <td><button className="btn btn-small btn-danger" onClick={() => deleteStudent(s.userId)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>Exam Results</h2>
            <button className="btn btn-success" onClick={() => exportResultsToExcel(results)}>Export</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Score</th>
                <th>%</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.studentName}</td>
                  <td>{r.email}</td>
                  <td>{r.score}/{r.totalQuestions}</td>
                  <td>{r.percentage}%</td>
                  <td>{r.timeTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>Projects</h2>
            <button className="btn btn-success" onClick={() => exportProjectsToExcel(projects)}>Export</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Title</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={i}>
                  <td>{p.studentName}</td>
                  <td>{p.title}</td>
                  <td>{p.submissionDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
