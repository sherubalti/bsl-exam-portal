import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../HeroSlider.css';

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const slides = [
    {
      title: "Empowering the Next Generation of AI Leaders",
      subtitle: "Baltistan Silicon Lab",
      description: "Master Artificial Intelligence and Data Science with our industry-leading training programs and professional certification.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=2000",
      primaryBtn: "Get Started",
      secondaryBtn: "View Courses"
    },
    {
      title: "Advanced Data Science & Machine Learning",
      subtitle: "Specialized Training",
      description: "Dive deep into neural networks, big data analytics, and predictive modeling with our expert-led hands-on curriculum.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000",
      primaryBtn: "Explore Programs",
      secondaryBtn: "About BSL"
    },
    {
      title: "Global Certification for Tech Professionals",
      subtitle: "Career Growth",
      description: "Get recognized globally with our industry-standard certifications and join a community of top-tier AI professionals.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000",
      primaryBtn: "Apply Now",
      secondaryBtn: "Contact Us"
    }
  ];

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="hero-slider">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`slide ${index === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay"></div>
            <div className="slide-content">
              <div className="badge-premium mb-4">{slide.subtitle}</div>
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
              <div className="hero-btns">
                <Link to="/student-login" className="btn btn-primary">{slide.primaryBtn}</Link>
                <Link to="/courses" className="btn btn-outline">{slide.secondaryBtn}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="slider-nav">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`nav-dot ${index === current ? 'active' : ''}`}
            onClick={() => setCurrent(index)}
          ></div>
        ))}
      </div>

      <div className="slider-controls">
        <button className="control-btn" onClick={prevSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button className="control-btn" onClick={nextSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HeroSlider;
