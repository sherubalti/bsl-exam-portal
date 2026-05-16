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
              <div className="icon-box-premium">📍</div>
              <div>
                <h4 className="font-bold text-primary mb-1">Headquarters</h4>
                <p className="text-muted">Ali Chowk, near Hawa Market, Skardu, Gilgit-Baltistan</p>
              </div>
            </div>
            
            <div className="contact-item-new flex items-start gap-5 mb-8">
              <div className="icon-box-premium">📧</div>
              <div>
                <h4 className="font-bold text-primary mb-1">Email Support</h4>
                <p className="text-muted">info@bsl-academy.com</p>
                <p className="text-muted">admissions@bsl-academy.com</p>
              </div>
            </div>
            
            <div className="contact-item-new flex items-start gap-5">
              <div className="icon-box-premium">📞</div>
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
