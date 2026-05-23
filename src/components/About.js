import React from 'react';
import '../About.css';
import sherAliImg from '../assets/sher ali shahid.jpg';
import sharafatImg from '../assets/sharafat.png';

const About = () => {
  const teamMembers = [
    {
      name: 'Sher Ali Shahid',
      role: 'AI & Data Science Specialist',
      image: sherAliImg,
      description: 'Expert in Artificial Intelligence, Machine Learning, and Data Science, driving the advanced analytical systems and curriculum at BSL.',
      linkedin: 'https://www.linkedin.com/in/sheralishahid/'
    },
    {
      name: 'Sharafat Saqib',
      role: 'MERN Stack Developer',
      image: sharafatImg,
      description: 'Specialist in full-stack web development using the MERN stack, leading the implementation of modern, high-performance web applications.',
      linkedin: 'https://www.linkedin.com/in/sharafatsaqib/'
    }
  ];

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

        <div className="team-section mt-16">
          <div className="text-center mb-12">
            <div className="badge-premium mb-4 inline-block">Our Experts</div>
            <h2 className="text-3xl font-bold mb-4">Meet the <span className="gradient-text">Team</span></h2>
            <p className="text-muted max-w-2xl mx-auto">The dedicated professionals driving innovation and excellence at BSL Academy.</p>
          </div>
          
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card card-premium">
                <div className="team-image-container">
                  <img src={member.image} alt={member.name} className="team-image" />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p className="team-description text-muted">{member.description}</p>
                  {member.linkedin !== '#' && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-social-link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      Connect on LinkedIn
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
