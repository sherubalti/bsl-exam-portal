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
                <div className="meta-item text-muted">
                  <span role="img" aria-label="duration">⏱️</span> {course.duration}
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
                    <span className="perk-icon">🎓</span>
                    <div>
                      <strong>Industry Certification</strong>
                      <p>Recognized by top tech firms</p>
                    </div>
                  </div>
                  <div className="perk-mini">
                    <span className="perk-icon">💼</span>
                    <div>
                      <strong>Career Support</strong>
                      <p>Resume building & interviews</p>
                    </div>
                  </div>
                  <div className="perk-mini">
                    <span className="perk-icon">🛠️</span>
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

