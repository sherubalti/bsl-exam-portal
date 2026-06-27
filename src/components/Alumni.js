import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, get, child, remove, update } from "firebase/database";
import '../Alumni.css';

const Alumni = ({ isAdmin }) => {
  const [students, setStudents]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deletingId, setDeletingId]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // studentKey to confirm
  const [searchQuery, setSearchQuery]     = useState('');
  const [verifyingId, setVerifyingId]     = useState(null);
  const [showAddForm, setShowAddForm]     = useState(false);
  const [editingStudentKey, setEditingStudentKey] = useState(null);
  const [studentForm, setStudentForm]     = useState({
    name: '',
    email: '',
    phone: '',
    cnic: '',
    address: '',
    course: 'Advanced AI & Data Science',
    batch: ''
  });
  const canManage = Boolean(isAdmin);

  const fetchStudents = () => {
    setLoading(true);
    const dbRef = ref(db);
    Promise.all([
      get(child(dbRef, 'students')),
      get(child(dbRef, 'studentProjects'))
    ]).then(([studentSnap, projectSnap]) => {
      let fetchedProjects = [];
      if (projectSnap.exists()) {
        fetchedProjects = Object.values(projectSnap.val());
      }

      let fetchedStudents = [];
      if (studentSnap.exists()) {
        const data = studentSnap.val();
        fetchedStudents = Object.keys(data)
          .map(key => {
            const student = data[key];
            const email = key.replace(/,/g, '.');
            const initials = student.name
              ? student.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : 'ST';
            const colors = [
              ['#2563eb', '#3b82f6'], ['#ec4899', '#f43f5e'],
              ['#10b981', '#059669'], ['#8b5cf6', '#a78bfa'],
              ['#f59e0b', '#d97706'], ['#06b6d4', '#0891b2'],
            ];
            const hash = (student.name || key).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
            const [c1, c2] = colors[hash % colors.length];

            const project = fetchedProjects.find(p =>
              p.studentName?.toLowerCase() === student.name?.toLowerCase() ||
              p.email?.toLowerCase() === email.toLowerCase()
            );

            let batchYear = 'Class of 2026';
            if (student.joinDate) {
              batchYear = `Class of ${new Date(student.joinDate).getFullYear()}`;
            }

            const attendance = student.attendance || {};
            const totalClasses = (attendance.present || 0) + (attendance.absent || 0) + (attendance.leave || 0);
            const attendanceRate = totalClasses > 0
              ? Math.round((attendance.present / totalClasses) * 100) : 0;

            return {
              key,
              email,
              name:             student.name,
              phone:            student.phone || 'N/A',
              cnic:             student.cnic  || 'N/A',
              address:          student.address || 'N/A',
              course:           student.course || 'Advanced AI & Data Science',
              batch:            student.batch || batchYear,
              joinDate:         student.joinDate ? new Date(student.joinDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
              isVerified:       student.isVerified !== false, // treat undefined (old accounts) as verified
              averageScore:     student.averageScore || 0,
              progress:         student.progress || 0,
              attendanceRate,
              projectTitle:     project?.title || null,
              gradient:         `linear-gradient(135deg, ${c1}, ${c2})`,
              initials,
              techStack:        student.techStack || 'Python, SQL',
              kaggleProfile:    student.kaggleProfile || '',
            };
          })
          .filter(s => {
            const nameLower = (s.name || '').toLowerCase();
            const idLower   = (s.key  || '').toLowerCase();
            return (
              !nameLower.includes('admin') &&
              !idLower.includes('admin') &&
              !nameLower.includes('test') &&
              !idLower.includes('test') &&
              s.name
            );
          });
      }
      setStudents(fetchedStudents);
      setLoading(false);
    }).catch(err => {
      console.error('Alumni load error:', err);
      setStudents([]);
      setLoading(false);
    });
  };

  useEffect(() => { fetchStudents(); }, []);

  // ─── Admin: Delete student ────────────────────────────────────────
  const handleDelete = async (studentKey) => {
    setDeletingId(studentKey);
    try {
      await remove(ref(db, `students/${studentKey}`));
      // Also remove their exam results, projects, fee records
      await Promise.allSettled([
        remove(ref(db, `examResults/${studentKey}`)),
        remove(ref(db, `feePayments/${studentKey}`)),
      ]);
      setStudents(prev => prev.filter(s => s.key !== studentKey));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete student. Please try again.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  // ─── Admin: Manually verify student ─────────────────────────────
  const handleManualVerify = async (studentKey) => {
    setVerifyingId(studentKey);
    try {
      await update(ref(db, `students/${studentKey}`), {
        isVerified:        true,
        verificationToken: null,
        tokenExpiresAt:    null,
        verifiedAt:        new Date().toISOString(),
      });
      setStudents(prev => prev.map(s => s.key === studentKey ? { ...s, isVerified: true } : s));
    } catch (err) {
      console.error('Manual verify failed:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const categories = ['All', 'Advanced AI & Data Science', 'Python for Data Science', 'Professional Data Analytics', 'Machine Learning Engineering'];

  const resetStudentForm = () => {
    setStudentForm({
      name: '',
      email: '',
      phone: '',
      cnic: '',
      address: '',
      course: 'Advanced AI & Data Science',
      batch: ''
    });
    setEditingStudentKey(null);
    setShowAddForm(false);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const trimmedName = studentForm.name.trim();
    const trimmedEmail = studentForm.email.trim();
    if (!trimmedName || !trimmedEmail) {
      alert('Please enter student name and email.');
      return;
    }

    const studentKey = trimmedEmail.replace(/\./g, ',');
    const studentData = {
      name: trimmedName,
      email: trimmedEmail,
      phone: studentForm.phone.trim(),
      cnic: studentForm.cnic.trim(),
      address: studentForm.address.trim(),
      course: studentForm.course,
      batch: studentForm.batch.trim() || 'Class of 2026',
      joinDate: new Date().toISOString(),
      isVerified: true,
      averageScore: 0,
      progress: 0,
      attendance: { present: 0, absent: 0, leave: 0 }
    };

    try {
      await update(ref(db, `students/${studentKey}`), studentData);
      const initials = trimmedName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const newStudent = {
        key: studentKey,
        email: trimmedEmail,
        name: trimmedName,
        phone: studentData.phone || 'N/A',
        cnic: studentData.cnic || 'N/A',
        address: studentData.address || 'N/A',
        course: studentData.course,
        batch: studentData.batch,
        joinDate: new Date(studentData.joinDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }),
        isVerified: true,
        averageScore: 0,
        progress: 0,
        attendanceRate: 0,
        projectTitle: null,
        gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
        initials,
        techStack: 'Python, SQL',
        kaggleProfile: ''
      };
      setStudents(prev => [newStudent, ...prev]);
      resetStudentForm();
      alert('Student added successfully.');
    } catch (err) {
      console.error('Add student failed:', err);
      alert('Failed to add student.');
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudentKey(student.key);
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      cnic: student.cnic || '',
      address: student.address || '',
      course: student.course || 'Advanced AI & Data Science',
      batch: student.batch || ''
    });
    setShowAddForm(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudentKey) return;
    const trimmedName = studentForm.name.trim();
    const trimmedEmail = studentForm.email.trim();
    if (!trimmedName || !trimmedEmail) {
      alert('Please enter student name and email.');
      return;
    }

    const studentKey = editingStudentKey;
    const studentData = {
      name: trimmedName,
      email: trimmedEmail,
      phone: studentForm.phone.trim(),
      cnic: studentForm.cnic.trim(),
      address: studentForm.address.trim(),
      course: studentForm.course,
      batch: studentForm.batch.trim() || 'Class of 2026'
    };

    try {
      await update(ref(db, `students/${studentKey}`), studentData);
      setStudents(prev => prev.map(s => s.key === studentKey ? {
        ...s,
        name: trimmedName,
        email: trimmedEmail,
        phone: studentData.phone || 'N/A',
        cnic: studentData.cnic || 'N/A',
        address: studentData.address || 'N/A',
        course: studentData.course,
        batch: studentData.batch
      } : s));
      resetStudentForm();
      alert('Student updated successfully.');
    } catch (err) {
      console.error('Update student failed:', err);
      alert('Failed to update student.');
    }
  };

  const filtered = students.filter(s => {
    const matchCat = selectedCategory === 'All' || s.course === selectedCategory;
    const matchSearch = !searchQuery ||
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.batch || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="alumni-page" style={{ paddingBottom: '60px' }}>
      <div className="alumni-hero">
        <div className="grid-overlay"></div>
        <div className="badge-premium mb-4">{canManage ? 'ADMIN — STUDENT REGISTRY' : 'STUDENT REGISTRY'}</div>
        <h1>Student <span className="gradient-text">Management</span></h1>
        <p className="text-muted max-w-2xl mx-auto">
          {canManage
            ? 'View student records, manage accounts, and update student information.'
            : 'Browse student records and details shared for learning and administration.'}
        </p>
      </div>

      <div className="alumni-content container mx-auto">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name, email or batch..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, minWidth: '220px', padding: '10px 16px', borderRadius: '8px',
              background: 'var(--card-bg)', border: '1px solid var(--border)',
              color: 'var(--text-main)', fontSize: '0.9rem'
            }}
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 16px', borderRadius: '8px',
              background: 'var(--card-bg)', border: '1px solid var(--border)',
              color: 'var(--text-main)', fontSize: '0.9rem'
            }}
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{
            padding: '10px 18px', borderRadius: '8px',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
            color: '#3b82f6', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap'
          }}>
            {filtered.length} Students
          </div>
          {canManage && (
            <button
              onClick={() => {
                resetStudentForm();
                setShowAddForm(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff',
                border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Add Student
            </button>
          )}
        </div>

        {canManage && showAddForm && (
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{editingStudentKey ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={resetStudentForm} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
            </div>
            <form onSubmit={editingStudentKey ? handleUpdateStudent : handleAddStudent} style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <input required placeholder="Full Name" value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} style={inputStyle} />
              <input required type="email" placeholder="Email" value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} style={inputStyle} />
              <input placeholder="Phone" value={studentForm.phone} onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} style={inputStyle} />
              <input placeholder="CNIC" value={studentForm.cnic} onChange={e => setStudentForm({ ...studentForm, cnic: e.target.value })} style={inputStyle} />
              <input placeholder="Batch" value={studentForm.batch} onChange={e => setStudentForm({ ...studentForm, batch: e.target.value })} style={inputStyle} />
              <select value={studentForm.course} onChange={e => setStudentForm({ ...studentForm, course: e.target.value })} style={inputStyle}>
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Address" value={studentForm.address} onChange={e => setStudentForm({ ...studentForm, address: e.target.value })} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  {editingStudentKey ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="spinner mb-4"></div>
            <p className="text-muted">Loading student registry...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(student => (
              <div key={student.key} style={{
                background: 'var(--card-bg)', borderRadius: '12px',
                border: `1px solid ${student.isVerified ? 'var(--border)' : 'rgba(245,158,11,0.4)'}`,
                overflow: 'hidden', position: 'relative'
              }}>
                {!student.isVerified && canManage && (
                  <div style={{
                    background: 'rgba(245,158,11,0.12)', padding: '8px 20px',
                    borderBottom: '1px solid rgba(245,158,11,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '8px'
                  }}>
                    <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
                      Email not verified — student cannot login yet
                    </span>
                    <button
                      onClick={() => handleManualVerify(student.key)}
                      disabled={verifyingId === student.key}
                      style={{
                        background: '#f59e0b', color: '#000', border: 'none',
                        padding: '5px 14px', borderRadius: '6px', fontWeight: 700,
                        fontSize: '0.78rem', cursor: 'pointer'
                      }}
                    >
                      {verifyingId === student.key ? 'Verifying...' : 'Manually Verify'}
                    </button>
                  </div>
                )}

                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                    background: student.gradient, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '1.1rem'
                  }}>
                    {student.initials}
                  </div>

                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px 24px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{student.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                      <div style={{ color: '#3b82f6', fontSize: '0.85rem', wordBreak: 'break-all' }}>{student.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{student.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CNIC</div>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{student.cnic}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course</div>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{student.course}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch</div>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{student.batch}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</div>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{student.joinDate}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Score</div>
                      <div style={{ fontWeight: 700, color: student.averageScore >= 50 ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>
                        {student.averageScore}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance</div>
                      <div style={{ fontWeight: 700, color: student.attendanceRate >= 75 ? '#10b981' : '#f59e0b', fontSize: '0.9rem' }}>
                        {student.attendanceRate}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                      <div style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                        background: student.isVerified ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: student.isVerified ? '#10b981' : '#f59e0b'
                      }}>
                        {student.isVerified ? 'Verified' : 'Unverified'}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleEditStudent(student)}
                        style={{
                          background: 'rgba(59,130,246,0.12)', color: '#3b82f6',
                          border: '1px solid rgba(59,130,246,0.3)', padding: '8px 18px',
                          borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                        }}
                      >
                        Edit Student
                      </button>
                      {confirmDelete === student.key ? (
                        <div style={{
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
                          borderRadius: '8px', padding: '12px 16px', textAlign: 'center', minWidth: '160px'
                        }}>
                          <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.82rem', marginBottom: '10px' }}>
                            Delete {student.name}?
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleDelete(student.key)}
                              disabled={deletingId === student.key}
                              style={{
                                flex: 1, background: '#ef4444', color: '#fff',
                                border: 'none', padding: '7px', borderRadius: '6px',
                                fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer'
                              }}
                            >
                              {deletingId === student.key ? '...' : 'Yes, Delete'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              style={{
                                flex: 1, background: 'var(--card-bg)', color: 'var(--text-muted)',
                                border: '1px solid var(--border)', padding: '7px', borderRadius: '6px',
                                fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(student.key)}
                          style={{
                            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.3)', padding: '8px 18px',
                            borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                          Delete Student
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                No students found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumni;
