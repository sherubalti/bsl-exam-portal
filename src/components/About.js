import React from 'react';
import '../About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="badge-premium mb-4">Innovation Excellence</div>
        <h1>About <span className="gradient-text">BSL Academy</span></h1>
        <p className="text-muted">Leading the way in Artificial Intelligence and Data Science education in the region.</p>
      </div>

      <div className="about-content container mx-auto">
        <div className="about-text card-premium">
          <div className="badge-premium mb-4">Our Mission</div>
          <h2>Empowering the <span className="gradient-text">Future</span></h2>
          <p className="text-muted mb-12">Our mission is to empower the next generation of technologists with the skills needed to excel in the global AI economy. We bridge the gap between theoretical knowledge and industry application through rigorous training and hands-on projects.</p>
          
          <div className="values-grid">
            <div className="value-item card-premium">
              <div className="value-icon">⭐</div>
              <h4>Excellence</h4>
              <p className="text-muted">We maintain the highest standards in our curriculum and instruction, ensuring our students are industry-ready.</p>
            </div>
            <div className="value-item card-premium">
              <div className="value-icon">💡</div>
              <h4>Innovation</h4>
              <p className="text-muted">We stay at the forefront of AI and Data Science research, integrating the latest technologies into our programs.</p>
            </div>
            <div className="value-item card-premium">
              <div className="value-icon">🌍</div>
              <h4>Impact</h4>
              <p className="text-muted">We focus on building solutions that solve real-world problems and contribute to the growth of the region.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
