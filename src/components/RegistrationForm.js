import React, { useState } from 'react';
import { db } from '../firebase';
import { ref, push, set } from "firebase/database";
import '../RegistrationForm.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'Python for AI & Data Science',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Processing...');

    try {
      // 1. Save to Firebase
      const registrationsRef = ref(db, 'interested_registrations');
      const newRegRef = push(registrationsRef);
      await set(newRegRef, {
        ...formData,
        timestamp: new Date().toISOString()
      });

      // 2. Prepare WhatsApp Message
      const whatsappNumber = "923426930403"; // Pakistani format
      const text = `Hello BSL Academy! I am interested in your ${formData.course} course.
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Message: ${formData.message}`;
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

      setStatus('Success! Redirecting to WhatsApp...');
      
      // 3. Redirect to WhatsApp
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        setFormData({ name: '', email: '', phone: '', course: 'Python for AI & Data Science', message: '' });
        setStatus('');
      }, 1500);

    } catch (error) {
      console.error("Error saving to Firebase:", error);
      setStatus('Error. Please try again.');
    }
  };

  return (
    <div className="registration-form-container glass">
      <h3>BSL Academy Admission</h3>
      <p className="form-intro">Register your interest and our team will contact you via WhatsApp.</p>
      
      {status && <div className={`status-msg ${status.includes('Error') ? 'error' : 'success'}`}>{status}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" placeholder="Your Name" />
        </div>
        
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" placeholder="Your Email" />
        </div>
        
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-control" placeholder="03xx-xxxxxxx" />
        </div>
        
        <div className="form-group">
          <label>Interested Course</label>
          <select name="course" value={formData.course} onChange={handleChange} className="form-control">
            <option>Python for AI & Data Science</option>
            <option>Advanced Artificial Intelligence</option>
            <option>Professional Data Science</option>
            <option>Advanced Web Development</option>
            <option>Data Structures & Algorithms</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Additional Message</label>
          <textarea name="message" value={formData.message} onChange={handleChange} className="form-control" rows="3" placeholder="Tell us more..."></textarea>
        </div>
        
        <button type="submit" className="btn btn-primary btn-full whatsapp-btn">
          <span>Submit & Chat on WhatsApp</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
