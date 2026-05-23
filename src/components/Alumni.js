import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, get, child } from "firebase/database";
import '../Alumni.css';

const Alumni = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Static high-end featured alumni profiles (the outstanding student leaders)
  const featuredAlumni = [
    {
      name: 'Sherub Balti',
      course: 'Advanced AI & Data Science',
      role: 'Lead MERN Stack Developer & Software Engineer',
      achievement: 'Developed BSL\'s Exam Portal & Project Hub',
      description: 'Sherub mastered advanced full-stack web engineering and machine learning integrations at BSL. He designed and engineered BSL\'s portal architecture, and currently leads enterprise software initiatives in Gilgit-Baltistan.',
      gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      initials: 'SB',
      linkedin: 'https://linkedin.com/in/sherubalti',
      github: 'https://github.com/sherubalti',
      isFeatured: true,
      batch: 'Class of 2025',
      status: 'Honor Graduate'
    },
    {
      name: 'Fatima Zahra',
      course: 'Python & Machine Learning',
      role: 'Data Scientist & ML Engineer',
      achievement: 'Developed Urdu NLP Sentiment Analysis Models',
      description: 'Fatima graduated with top honors in AI and Data Science. She specializes in training deep learning models, sentiment analysis, and advanced statistical modeling for local-language computational projects.',
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      initials: 'FZ',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      isFeatured: true,
      batch: 'Class of 2025',
      status: 'Research Fellow'
    },
    {
      name: 'Muhammad Ali',
      course: 'Full-Stack MERN Development',
      role: 'Backend Engineer & Solutions Architect',
      achievement: 'Built Scalable e-Commerce APIs & DevOps Pipelines',
      description: 'Ali gained extensive hands-on experience in backend systems and cloud architectures during his training at BSL. He currently designs robust system integrations and secure database services.',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      initials: 'MA',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      isFeatured: true,
      batch: 'Class of 2024',
      status: 'Senior Scholar'
    },
    {
      name: 'Sajida Batool',
      course: 'UI/UX Design & Frontend Development',
      role: 'Lead UX/UI Designer & React Engineer',
      achievement: 'Optimized User Flow and Design Systems for BSL Apps',
      description: 'Sajida combined creative visuals with technical React engineering. She designs highly intuitive, premium user interfaces and drives the interactive web frontends for multiple successful applications.',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      initials: 'SB',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      isFeatured: true,
      batch: 'Class of 2025',
      status: 'Design Lead'
    }
  ];

  useEffect(() => {
    const dbRef = ref(db);

    Promise.all([
      get(child(dbRef, 'students')),
      get(child(dbRef, 'studentProjects'))
    ]).then(([studentSnap, projectSnap]) => {
      let fetchedStudents = [];
      let fetchedProjects = [];

      if (projectSnap.exists()) {
        fetchedProjects = Object.values(projectSnap.val());
      }

      if (studentSnap.exists()) {
        const data = studentSnap.val();
        fetchedStudents = Object.keys(data)
          .map(key => {
            const student = data[key];
            const email = key.replace(/,/g, '.');
            return {
              userId: key,
              ...student,
              email: email
            };
          })
          // Filter out administrative and testing accounts for professional presentation
          .filter(student => {
            const nameLower = (student.name || '').toLowerCase();
            const idLower = (student.userId || '').toLowerCase();
            return (
              !nameLower.includes('admin') && 
              !idLower.includes('admin') && 
              !nameLower.includes('test') &&
              !idLower.includes('test') &&
              student.name // must have a name
            );
          })
          .map(student => {
            // Generate initials
            const initials = student.name
              ? student.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : 'ST';
            
            // Premium background gradient hashing
            const colors = [
              ['#2563eb', '#3b82f6'],
              ['#ec4899', '#f43f5e'],
              ['#10b981', '#059669'],
              ['#8b5cf6', '#a78bfa'],
              ['#f59e0b', '#d97706'],
              ['#06b6d4', '#0891b2'],
            ];
            const hash = student.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const colorPair = colors[hash % colors.length];
            const gradient = `linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})`;

            const courses = [
              'Advanced AI & Data Science',
              'Python & Machine Learning',
              'Full-Stack MERN Development',
              'UI/UX Design & Frontend Development',
              'Web Development & Digital Marketing'
            ];
            const course = courses[hash % courses.length];

            // Cross-reference with project uploads
            const project = fetchedProjects.find(p => 
              p.studentName?.toLowerCase() === student.name?.toLowerCase() || 
              p.email?.toLowerCase() === student.email.toLowerCase()
            );

            // Dynamically build Batch based on join date
            let batchYear = 'Class of 2026';
            if (student.joinDate) {
              const year = new Date(student.joinDate).getFullYear();
              batchYear = `Class of ${year}`;
            }

            let achievement = `BSL Portal Member (Joined: ${student.joinDate ? new Date(student.joinDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'}) : 'N/A'})`;
            let description = `Technical scholar studying at BSL Academy Skardu. Demonstrating dedicated analytical work, solving programmatic challenges, and contributing to development tracks.`;
            let status = 'Verified Scholar';

            if (project) {
              achievement = `Successfully delivered capstone project: "${project.title}"`;
              description = `Engineered and uploaded a professional project bundle ("${project.fileName}") to the BSL portal repository, implementing technical solutions and advanced coding.`;
              status = 'Project Specialist';
            } else if (student.averageScore > 0) {
              achievement = `Completed modular exams with an average of ${student.averageScore}%`;
              if (student.averageScore > 80) {
                status = 'Distinguished Scholar';
              }
            }

            return {
              name: student.name,
              course: course,
              role: 'BSL Scholar & Technical Professional',
              achievement: achievement,
              description: description,
              gradient: gradient,
              initials: initials,
              linkedin: 'https://linkedin.com',
              github: 'https://github.com',
              isFeatured: false,
              batch: batchYear,
              status: status
            };
          });
      }

      // Filter out duplicate names
      const filteredFeatured = featuredAlumni.filter(feat => 
        !fetchedStudents.some(dbStu => dbStu.name.toLowerCase() === feat.name.toLowerCase())
      );

      setStudents([...filteredFeatured, ...fetchedStudents]);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading BSL student database registry:", err);
      setStudents(featuredAlumni);
      setLoading(false);
    });
  }, []);

  const categories = [
    'All', 
    'Advanced AI & Data Science', 
    'Python & Machine Learning', 
    'Full-Stack MERN Development', 
    'UI/UX Design & Frontend Development', 
    'Web Development & Digital Marketing'
  ];

  const filteredStudents = selectedCategory === 'All' 
    ? students 
    : students.filter(s => s.course === selectedCategory);

  return (
    <div className="alumni-page">
      <div className="alumni-hero">
        <div className="grid-overlay"></div>
        <div className="badge-premium mb-4">BSL Student Registry & Alumni</div>
        <h1>BSL Student <span className="gradient-text">Showcase</span></h1>
        <p className="text-muted max-w-2xl mx-auto">
          Meet the exceptional students and alumni of Baltistan Silicon Lab Skardu who have mastered state-of-the-art technologies and built real-world enterprise applications.
        </p>
      </div>

      <div className="alumni-content container mx-auto">
        {/* Category Filters */}
        <div className="filter-container mb-16">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'All' ? 'All Students' : category.split(' & ')[0]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="spinner mb-4"></div>
            <p className="text-muted" style={{ fontWeight: 600 }}>Syncing with Firebase Realtime Database...</p>
          </div>
        ) : (
          /* Students Cards Grid */
          <div className="alumni-grid">
            {filteredStudents.map((student, index) => (
              <div key={index} className={`alumni-card card-premium ${student.isFeatured ? 'featured-highlight' : ''}`}>
                
                {/* Batch and status headers */}
                <div className="card-top-header">
                  <span className="student-batch">{student.batch}</span>
                  <div className="status-indicator-wrapper">
                    <span className="pulse-dot"></span>
                    <span className="student-status">{student.status}</span>
                  </div>
                </div>

                {student.isFeatured && (
                  <div className="featured-badge">Featured Alumnus</div>
                )}

                <div className="alumni-header-wrapper mt-4">
                  <div className="alumni-avatar" style={{ background: student.gradient }}>
                    <span>{student.initials}</span>
                    <div className="avatar-glow"></div>
                  </div>
                  <div className="alumni-title-info">
                    <h3>{student.name}</h3>
                    <span className="alumni-course-badge">{student.course}</span>
                  </div>
                </div>

                <div className="alumni-body mt-6">
                  <h4 className="alumni-role">{student.role}</h4>
                  
                  <div className="achievement-box mb-6">
                    <span className="achievement-label">🏆 Technical Milestone:</span>
                    <p className="achievement-text">{student.achievement}</p>
                  </div>

                  <p className="alumni-desc text-muted">{student.description}</p>
                </div>

                <div className="alumni-footer mt-6">
                  <div className="alumni-social-links">
                    <a href={student.linkedin} target="_blank" rel="noopener noreferrer" className="alumni-social-btn linkedin-btn" aria-label="LinkedIn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <span>Connect</span>
                    </a>
                    <a href={student.github} target="_blank" rel="noopener noreferrer" className="alumni-social-btn github-btn" aria-label="GitHub">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span>Portfolio</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumni;
