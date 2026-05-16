import React, { useState } from 'react';
import { getCurrentPKTTime } from '../utils/timeUtility';
import { db } from '../firebase';
import { ref, push } from "firebase/database";
import '../ProjectUpload.css';

const ProjectUpload = ({ user }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    const nowPKT = await getCurrentPKTTime();

    const newProject = {
      studentName: user.name,
      email: user.email,
      title: title,
      description: description,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      submissionDate: nowPKT.toLocaleString('en-PK', { dateStyle: 'medium' }),
      status: 'Submitted'
    };

    push(ref(db, 'studentProjects'), newProject)
      .then(() => {
        setSuccess('Project documentation synchronized successfully!');
        setTitle('');
        setDescription('');
        setFile(null);
      })
      .catch(err => console.error(err));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container project-upload-container">
      <header className="upload-header">
        <h1>Project Submission</h1>
        <p>Document your technical implementations and submit for evaluation.</p>
      </header>

      <div className="upload-form-card">
        {success && (
          <div className="success-banner">
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Nomenclature</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Neural Network Optimization Project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Abstract / Executive Summary</label>
            <textarea
              className="form-control"
              placeholder="Briefly describe the technical scope and methodology..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Technical Documentation (PDF/DOCX/PPTX)</label>
            <div className="file-input-wrapper">
              <span className="upload-icon">📁</span>
              <strong>{file ? 'Replace Document' : 'Click or Drag File to Upload'}</strong>
              <p className="text-muted">Maximum file size: 10MB</p>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                required
              />
            </div>
            {file && (
              <div className="file-name-display">
                📎 {file.name} ({formatFileSize(file.size)})
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
            Commit Submission
          </button>
        </form>

        <div className="guidelines-box">
          <h4>Submission Protocol:</h4>
          <ul>
            <li>Ensure all source code is properly referenced in the documentation.</li>
            <li>Supported formats: Adobe PDF, Microsoft Word, or PowerPoint.</li>
            <li>Documentation must include architecture diagrams and result analysis.</li>
            <li>Integrity check: Submissions must be original work.</li>
            <li>Deadline adherence is mandatory for final certification.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectUpload;

