import React from 'react';
import RegistrationForm from './RegistrationForm';
import '../Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="badge-premium mb-4">Get In Touch</div>
        <h1>Contact <span className="gradient-text">Our Team</span></h1>
        <p className="text-muted">Have questions about our programs or admissions? Reach out to our team of experts.</p>
      </div>

      <div className="contact-container container mx-auto">
        <div className="contact-details card-premium">
          <div className="badge-premium mb-4">Contact Information</div>
          <h2>We're Here to <span className="gradient-text">Help</span></h2>
          <p className="text-muted mb-12">Our team is available to assist you with any inquiries regarding our courses, certifications, and career support services.</p>
          
          <div className="contact-items-list">
            <div className="contact-item-new flex items-start gap-5 mb-8">
              <div className="icon-box-premium">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-1">Headquarters</h4>
                <p className="text-muted">Ali Chowk, near Hawa Market, Skardu, Gilgit-Baltistan</p>
              </div>
            </div>
            
            <div className="contact-item-new flex items-start gap-5 mb-8">
              <div className="icon-box-premium">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-1">Email Support</h4>
                <p className="text-muted">info@bsl-academy.com</p>
                <p className="text-muted">admissions@bsl-academy.com</p>
              </div>
            </div>
            
            <div className="contact-item-new flex items-start gap-5">
              <div className="icon-box-premium">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-1">Direct Line</h4>
                <p className="text-muted">+92 342 6930403</p>
                <p className="text-muted">Available Mon-Sat, 9AM - 6PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper card-premium">
          <div className="badge-premium mb-4">Inquiry Form</div>
          <h3 className="mb-6">Send us a <span className="gradient-text">Message</span></h3>
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default Contact;
