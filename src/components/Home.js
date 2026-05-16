import React from 'react';
import { Link } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import HeroSlider from './HeroSlider';
import logo from '../assets/logo.png';
import '../Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header text-center mb-16">
          <div className="badge-premium mb-4">BSL Academy Skardu</div>
          <h2>Master <span className="gradient-text">Advanced AI</span></h2>
          <p className="max-w-2xl mx-auto text-muted">Specialized technical training at Ali Chowk, Skardu. We focus on hands-on Python development and industrial AI implementation.</p>
        </div>
        <div className="features-grid-home">
          <div className="feature-item card-premium">
            <div className="icon-wrapper">🚀</div>
            <h3>Expert Instructors</h3>
            <p className="text-muted">Our trainer has extensive industry experience and is an expert in the field, ensuring high-quality, project-based learning.</p>
          </div>
          <div className="feature-item card-premium">
            <div className="icon-wrapper">📊</div>
            <h3>Industry Projects</h3>
            <p className="text-muted">Build a professional portfolio with projects that solve actual industry problems using real data.</p>
          </div>
          <div className="feature-item card-premium">
            <div className="icon-wrapper">🎓</div>
            <h3>Global Certification</h3>
            <p className="text-muted">Get recognized by top tech companies with our industry-standard, globally accepted certification.</p>
          </div>
          <div className="feature-item card-premium">
            <div className="icon-wrapper">🧠</div>
            <h3>Advanced Lab</h3>
            <p className="text-muted">Access our state-of-the-art computational resources and dedicated AI research laboratory.</p>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="training-section">
        <div className="training-card-premium card-premium">
          <div className="training-info">
            <div className="badge-premium mb-4">New Batch Enrollment</div>
            <h2>BSL <span className="gradient-text">Technical Admission</span></h2>
            <p className="text-muted mb-8">Secure your seat in our upcoming professional session at Ali Chowk. Our curriculum is tailored for high-performance engineering in Gilgit-Baltistan.</p>
            <div className="perks-list">
              <div className="perk"><span>✓</span> Advanced Python Ecosystem</div>
              <div className="perk"><span>✓</span> Generative AI & LLMs</div>
              <div className="perk"><span>✓</span> Computer Vision Mastery</div>
              <div className="perk"><span>✓</span> Cloud Data Engineering</div>
            </div>
          </div>
          <div className="training-form-area">
            <RegistrationForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-premium">
        <div className="footer-content container mx-auto">
          <div className="footer-brand">
            <div className="brand-wrap mb-6">
              <img src={logo} alt="BSL Academy" className="footer-logo" />
              <div className="brand-name-footer">BSL Academy</div>
            </div>
            <p className="text-muted footer-desc">
              The premier destination for AI and Data Science excellence in Gilgit-Baltistan. 
              We empower professionals with the tools of tomorrow.
            </p>
            <div className="social-links-footer">
              <a href="https://www.linkedin.com/in/sheralishahid/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>
              <a href="https://www.tiktok.com/@baltistansiliconlabs?_r=1&_t=ZS-96PXSa7qGfN" target="_blank" rel="noopener noreferrer" aria-label="TikTok">tt</a>
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">ig</a>
            </div>
          </div>

          <div className="footer-nav-grid">
            <div className="nav-col">
              <h4>Programs</h4>
              <Link to="/courses">Python for AI</Link>
              <Link to="/courses">Data Science</Link>
              <Link to="/courses">Generative AI</Link>
              <Link to="/courses">Web Advanced</Link>
            </div>
            <div className="nav-col">
              <h4>Resources</h4>
              <Link to="/student-login">Student Portal</Link>
              <Link to="/admin-login">Admin Access</Link>
              <Link to="/courses">Curriculum</Link>
              <Link to="/about">Success Stories</Link>
            </div>
            <div className="nav-col">
              <h4>Academy</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/contact">Location</Link>
              <Link to="/about">Our Faculty</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container mx-auto">
            <div className="location-info-footer mb-4">
              <span>📍 Ali Chowk, near Hawa Market, Skardu, Gilgit-Baltistan</span>
              <span>📞 +92 342 6930403</span>
            </div>
            <p className="copyright-text">
              &copy; 2026 Baltistan Silicon Lab (BSL Academy). All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
