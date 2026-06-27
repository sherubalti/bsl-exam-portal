import React from 'react';
import RegistrationForm from './RegistrationForm';
import '../Training.css';

const Training = () => {
  const courses = [
    {
      id: 1,
      title: "Python for AI & Data Science",
      level: "Professional",
      duration: "4 Months",
      description: "Master the essential programming language for the modern tech landscape, focusing on AI-ready implementations.",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
      skills: ["Python Core", "NumPy", "Pandas", "Automation"]
    },
    {
      id: 2,
      title: "Advanced Artificial Intelligence",
      level: "Expert",
      duration: "6 Months",
      description: "Harness the power of Neural Networks, Deep Learning, and Generative AI for industry-scale solutions.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
      skills: ["TensorFlow", "PyTorch", "LLMs", "RAG Systems"]
    },
    {
      id: 3,
      title: "Professional Data Science",
      level: "Expert",
      duration: "5 Months",
      description: "Transform complex data into strategic insights using advanced statistical modeling and big data tools.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
      skills: ["MLOps", "Big Data", "Stats", "Visualization"]
    },
    {
      id: 4,
      title: "Advanced Web Development",
      level: "Professional",
      duration: "4 Months",
      description: "Build scalable, high-performance web architectures using modern full-stack engineering practices.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000",
      skills: ["React", "Node.js", "MongoDB", "Cloud Arch"]
    },
    {
      id: 5,
      title: "Data Structures & Algorithms",
      level: "Advanced",
      duration: "3 Months",
      description: "Master the fundamental logic and structures required for elite software engineering and problem-solving.",
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=1000",
      skills: ["Logic", "Complexity", "Optimization", "Patterns"]
    }
  ];
  return (
    <div className="training-page">
      <section className="training-hero">
        <div className="badge-premium mb-4">BSL Specialized Curriculum</div>
        <h1>Master the <span className="gradient-text">Tech Stack</span></h1>
        <p className="text-muted">Direct industry training at Ali Chowk, Skardu. Focused on Python, AI, and Data Science excellence.</p>
      </section>

      <section className="courses-grid container mx-auto">
        {courses.map(course => (
          <div key={course.id} className="course-card card-premium">
            <div className="course-image-wrapper">
              <img src={course.image} alt={course.title} className="course-card-img" />
              <div className="badge-premium course-badge-overlay">{course.level}</div>
            </div>
            <div className="card-content-wrap">
              <h3>{course.title}</h3>
              <p className="text-muted concise-desc mb-6">{course.description}</p>
              
              <div className="skills-tags mb-6">
                {course.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
              </div>
              <div className="course-meta">
                <div className="meta-item text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {course.duration}
                </div>
                <a href="#register" className="btn btn-primary">Enroll Now</a>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section id="register" className="training-registration-section">
        <div className="container mx-auto">
          <div className="registration-wrapper card-premium">
            <div className="reg-content-split">
              <div className="reg-info-panel">
                <div className="badge-premium mb-4">Admissions Open</div>
                <h2>Start Your <span className="gradient-text">Transformation</span></h2>
                <p className="text-muted mb-8">Join BSL Academy and gain access to world-class curriculum, industry mentors, and a community of innovators.</p>
                
                <div className="perks-grid-mini">
                  <div className="perk-mini">
                    <span className="perk-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                    </span>
                    <div>
                      <strong>Industry Certification</strong>
                      <p>Recognized by top tech firms</p>
                    </div>
                  </div>
                  <div className="perk-mini">
                    <span className="perk-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    </span>
                    <div>
                      <strong>Career Support</strong>
                      <p>Resume building & interviews</p>
                    </div>
                  </div>
                  <div className="perk-mini">
                    <span className="perk-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    </span>
                    <div>
                      <strong>Hands-on Labs</strong>
                      <p>Real-world project experience</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reg-form-panel">
                <RegistrationForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Training;

