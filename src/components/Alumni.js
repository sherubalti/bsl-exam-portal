import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, get, child, remove, update } from "firebase/database";
import '../Alumni.css';

/* ─── tiny style helper ───────────────────────────────────── */
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'var(--card-bg)',
  color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none',
  boxSizing: 'border-box'
};

const COURSES = [
  'Advanced AI & Data Science',
  'Python for Data Science',
  'Professional Data Analytics',
  'Machine Learning Engineering',
];

const EMPTY_FORM = {
  name: '', email: '', phone: '', cnic: '',
  address: '', course: COURSES[0], batch: '',
  profession: 'AI Engineer', techStack: 'Python, Machine Learning',
};

/* ─── colour helpers for avatar ─────────────────────────────── */
const AVATAR_COLORS = [
  ['#2563eb','#3b82f6'], ['#ec4899','#f43f5e'],
  ['#10b981','#059669'], ['#8b5cf6','#a78bfa'],
  ['#f59e0b','#d97706'], ['#06b6d4','#0891b2'],
];
function avatarGradient(name = '') {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const [c1, c2] = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}
function initials(name = '') {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';
}

/* ═══════════════════════════════════════════════════════════════
   ALUMNI COMPONENT
   Props:
     isAdmin  – boolean, passed from App.js
═══════════════════════════════════════════════════════════════ */
const Alumni = ({ isAdmin }) => {
  const [alumni,       setAlumni]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editKey,      setEditKey]      = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [verifyingId,  setVerifyingId]  = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState('');

  /* ── fetch alumni from Firebase students/ node ───────────── */
  const fetchAlumni = () => {
    setLoading(true);
    const dbRef = ref(db);
    Promise.all([
      get(child(dbRef, 'students')),
      get(child(dbRef, 'studentProjects')),
    ]).then(([studentSnap, projectSnap]) => {
      const projects = projectSnap.exists() ? Object.values(projectSnap.val()) : [];

      if (!studentSnap.exists()) { setAlumni([]); setLoading(false); return; }

      const data = studentSnap.val();
      const list = Object.keys(data)
        .map(key => {
          const s = data[key];
          const email = key.replace(/,/g, '.');
          const proj  = projects.find(p =>
            p.studentName?.toLowerCase() === s.name?.toLowerCase() ||
            p.email?.toLowerCase()       === email.toLowerCase()
          );
          const attendance   = s.attendance || {};
          const totalClasses = (attendance.present || 0) + (attendance.absent || 0) + (attendance.leave || 0);
          const attendanceRate = totalClasses > 0
            ? Math.round((attendance.present / totalClasses) * 100) : 0;

          return {
            key,
            email,
            name:         s.name         || '',
            phone:        s.phone        || 'N/A',
            cnic:         s.cnic         || 'N/A',
            address:      s.address      || 'N/A',
            course:       s.course       || 'Advanced AI & Data Science',
            batch:        s.batch        || (s.joinDate ? `Class of ${new Date(s.joinDate).getFullYear()}` : 'Class of 2026'),
            joinDate:     s.joinDate     ? new Date(s.joinDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
            isVerified:   s.isVerified   !== false,
            averageScore: s.averageScore || 0,
            attendanceRate,
            projectTitle: proj?.title   || null,
            profession:   s.profession  || 'AI Engineer',
            techStack:    s.techStack   || 'Python, Machine Learning',
            gradient:     avatarGradient(s.name || key),
            initials:     initials(s.name),
          };
        })
        .filter(s =>
          s.name &&
          !s.name.toLowerCase().includes('admin') &&
          !s.key.toLowerCase().includes('admin') &&
          !s.name.toLowerCase().includes('test')
        );

      setAlumni(list);
      setLoading(false);
    }).catch(err => {
      console.error('Alumni load error:', err);
      setAlumni([]);
      setLoading(false);
    });
  };

  useEffect(() => { fetchAlumni(); }, []);

  /* ── filtered list for display ───────────────────────────── */
  const filtered = search.trim()
    ? alumni.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.course.toLowerCase().includes(search.toLowerCase()) ||
        s.batch.toLowerCase().includes(search.toLowerCase())
      )
    : alumni;

  /* ── Admin: open add form ────────────────────────────────── */
  const openAdd = () => { setForm(EMPTY_FORM); setEditKey(null); setShowForm(true); };

  /* ── Admin: open edit form ───────────────────────────────── */
  const openEdit = (student) => {
    setForm({
      name:       student.name,
      email:      student.email,
      phone:      student.phone !== 'N/A' ? student.phone    : '',
      cnic:       student.cnic  !== 'N/A' ? student.cnic     : '',
      address:    student.address !== 'N/A' ? student.address : '',
      course:     student.course,
      batch:      student.batch,
      profession: student.profession,
      techStack:  student.techStack,
    });
    setEditKey(student.key);
    setShowForm(true);
  };

  /* ── Admin: save (add or update) ─────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      alert('Name and Email are required.'); return;
    }
    setSaving(true);
    const studentKey = editKey || form.email.trim().replace(/\./g, ',');
    const payload = {
      name:       form.name.trim(),
      email:      form.email.trim(),
      phone:      form.phone.trim()      || '',
      cnic:       form.cnic.trim()       || '',
      address:    form.address.trim()    || '',
      course:     form.course,
      batch:      form.batch.trim()      || 'Class of 2026',
      profession: form.profession.trim() || 'AI Engineer',
      techStack:  form.techStack.trim()  || 'Python, Machine Learning',
      isVerified: true,
      ...(!editKey && {
        joinDate:     new Date().toISOString(),
        averageScore: 0,
        progress:     0,
        attendance:   { present: 0, absent: 0, leave: 0 },
      }),
    };

    try {
      await update(ref(db, `students/${studentKey}`), payload);
      setShowForm(false);
      fetchAlumni();           // refresh list
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Admin: delete ───────────────────────────────────────── */
  const handleDelete = async (studentKey) => {
    setDeletingId(studentKey);
    try {
      await remove(ref(db, `students/${studentKey}`));
      await Promise.allSettled([
        remove(ref(db, `examResults/${studentKey}`)),
        remove(ref(db, `feePayments/${studentKey}`)),
      ]);
      setAlumni(prev => prev.filter(s => s.key !== studentKey));
    } catch (err) {
      alert('Delete failed. Please try again.');
    } finally {
      setDeletingId(null);
      setConfirmDel(null);
    }
  };

  /* ── Admin: manually verify ──────────────────────────────── */
  const handleVerify = async (studentKey) => {
    setVerifyingId(studentKey);
    try {
      await update(ref(db, `students/${studentKey}`), {
        isVerified: true, verificationToken: null, tokenExpiresAt: null,
        verifiedAt: new Date().toISOString(),
      });
      setAlumni(prev => prev.map(s => s.key === studentKey ? { ...s, isVerified: true } : s));
    } catch (err) {
      console.error('Verify failed:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  /* ═══════════════════ RENDER ════════════════════════════════ */
  return (
    <div className="alumni-page">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="alumni-hero">
        <div className="grid-overlay" />
        <div className="badge-premium">
          {isAdmin ? '🛡️ Admin View — Student Registry' : '🎓 Student Alumni Directory'}
        </div>
        <h1>Our <span className="gradient-text">Alumni</span></h1>
        <p className="alumni-hero-sub">
          {isAdmin
            ? 'Manage student records. Use the Add button to register new alumni.'
            : 'Meet the graduates of BSL Academy — the next generation of AI professionals.'}
        </p>
      </div>

      <div className="alumni-content">

        {/* ── Toolbar ───────────────────────────────────────────── */}
        <div className="alumni-toolbar">
          {/* search — visible to everyone */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, course or batch…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="alumni-search"
            />
          </div>

          <div className="toolbar-right">
            <span className="count-chip">{filtered.length} Alumni</span>

            {/* Add button — admin only */}
            {isAdmin && (
              <button className="add-btn" onClick={openAdd}>
                + Add Alumni
              </button>
            )}
          </div>
        </div>

        {/* ── Admin Add / Edit Form ─────────────────────────────── */}
        {isAdmin && showForm && (
          <div className="alumni-form-card">
            <div className="form-header">
              <h3>{editKey ? '✏️ Edit Alumni' : '➕ Add New Alumni'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕ Close</button>
            </div>

            <form onSubmit={handleSave} className="alumni-form-grid">
              <div className="form-field">
                <label>Full Name *</label>
                <input style={inputStyle} required placeholder="e.g. Ali Hassan"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Email *</label>
                <input style={inputStyle} required type="email" placeholder="student@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  disabled={!!editKey} />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input style={inputStyle} placeholder="03xx-xxxxxxx"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-field">
                <label>CNIC</label>
                <input style={inputStyle} placeholder="xxxxx-xxxxxxx-x"
                  value={form.cnic} onChange={e => setForm({ ...form, cnic: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Batch</label>
                <input style={inputStyle} placeholder="Class of 2026"
                  value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Course</label>
                <select style={inputStyle} value={form.course}
                  onChange={e => setForm({ ...form, course: e.target.value })}>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Profession</label>
                <input style={inputStyle} placeholder="AI Engineer"
                  value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Tech Stack</label>
                <input style={inputStyle} placeholder="Python, TensorFlow…"
                  value={form.techStack} onChange={e => setForm({ ...form, techStack: e.target.value })} />
              </div>
              <div className="form-field full-span">
                <label>Address</label>
                <input style={inputStyle} placeholder="City, Country"
                  value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-actions full-span">
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Saving…' : editKey ? 'Update Alumni' : 'Save Alumni'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Loading ───────────────────────────────────────────── */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading alumni directory…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h3>{isAdmin ? 'No alumni yet. Click + Add Alumni to get started.' : 'No alumni found.'}</h3>
          </div>
        ) : (
          /* ── Alumni Cards Grid ────────────────────────────────── */
          <div className="alumni-grid">
            {filtered.map(student => (
              <div key={student.key} className={`alumni-card ${!student.isVerified && isAdmin ? 'unverified' : ''}`}>

                {/* Unverified banner — admin only */}
                {!student.isVerified && isAdmin && (
                  <div className="unverified-banner">
                    <span>⚠️ Email not verified</span>
                    <button
                      className="verify-btn"
                      disabled={verifyingId === student.key}
                      onClick={() => handleVerify(student.key)}
                    >
                      {verifyingId === student.key ? 'Verifying…' : 'Manually Verify'}
                    </button>
                  </div>
                )}

                {/* Card body */}
                <div className="card-body">
                  {/* Avatar */}
                  <div className="avatar" style={{ background: student.gradient }}>
                    {student.initials}
                  </div>

                  {/* Main info */}
                  <div className="card-info">
                    <div className="student-name">
                      {student.name}
                      {student.isVerified && <span className="verified-dot" title="Verified">✓</span>}
                    </div>
                    <div className="student-role">{student.profession}</div>
                    <div className="batch-tag">{student.batch}</div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="card-details">
                  <div className="detail">
                    <span className="detail-label">Course</span>
                    <span className="detail-value">{student.course}</span>
                  </div>
                  <div className="detail">
                    <span className="detail-label">Tech Stack</span>
                    <span className="detail-value">{student.techStack}</span>
                  </div>
                  {student.projectTitle && (
                    <div className="detail full">
                      <span className="detail-label">Key Project</span>
                      <span className="detail-value">{student.projectTitle}</span>
                    </div>
                  )}

                  {/* Admin-only sensitive info */}
                  {isAdmin && (
                    <>
                      <div className="detail">
                        <span className="detail-label">Email</span>
                        <span className="detail-value email-val">{student.email}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{student.phone}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-label">CNIC</span>
                        <span className="detail-value">{student.cnic}</span>
                      </div>
                      <div className="detail full">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">{student.address}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Admin action buttons */}
                {isAdmin && (
                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => openEdit(student)}>
                      ✏️ Edit
                    </button>

                    {confirmDel === student.key ? (
                      <div className="confirm-delete">
                        <span>Delete {student.name}?</span>
                        <button
                          className="confirm-yes"
                          disabled={deletingId === student.key}
                          onClick={() => handleDelete(student.key)}
                        >
                          {deletingId === student.key ? '…' : 'Yes, Delete'}
                        </button>
                        <button className="confirm-no" onClick={() => setConfirmDel(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button className="delete-btn" onClick={() => setConfirmDel(student.key)}>
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumni;
