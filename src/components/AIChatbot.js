import React, { useState, useEffect, useRef } from 'react';
import '../AIChatbot.css';

const GEMINI_API_KEY = "AIzaSyC5NYLlXBPAlX2NdwG43fI2sgrvHu3ZWPs";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hello! I am your BSL support assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const knowledgeBase = {
    location: "Baltistan Silicon Lab (BSL Academy) is located at Ali Chowk, near Hawa Market, Skardu. We are easily accessible and centrally located for all students.",
    courses: "Our curriculum includes specialized tracks in Artificial Intelligence, Data Science, Machine Learning (ML), Computer Vision (CV), and Natural Language Processing (NLP).",
    timing: "We offer flexible professional schedules: Morning Track (09:00 - 12:00) and Evening Track (17:00 - 20:00). Special weekend workshops are also conducted regularly.",
    contact: "For direct inquiries, please contact our administrative office via WhatsApp at +92 342 6930403 or email us at info@bsl.edu.pk.",
    fee: "Course fees vary by specialization. We provide scholarships for meritorious students. Please reach out to our admissions office for the latest fee structure.",
    admission: "Admissions are currently open. You can apply via the registration portal on our homepage. Shortlisted candidates will be called for a technical assessment.",
    instructor: "Our faculty consists of PhD researchers and industry leads from top global technology firms, ensuring world-class mentorship.",
    default: "I am trained to assist with queries regarding BSL courses, locations, schedules, and admissions. How may I help you specifically in these areas?"
  };
  const getGeminiResponse = async (userText) => {
    try {
      const systemPrompt = `You are the formal and highly detailed BSL Admissions & Support Assistant for Baltistan Silicon Lab (BSL Academy).
      Context:
      - Location: Ali Chowk, near Hawa Market, Skardu.
      - Courses: Python for AI, Data Science, Advanced AI & Deep Learning, Web Advanced, Data Structures & Algorithms.
      - Timings: Morning Track (9 AM - 12 PM), Evening Track (5 PM - 8 PM).
      - Contact: WhatsApp +92 342 6930403.
      - Mission: Empowering the next generation of tech professionals in Gilgit-Baltistan.
      
      Instructions:
      1. Be extremely professional, polite, and detailed in your responses.
      2. Actively engage and communicate with the student to understand their educational background and career goals.
      3. Proactively suggest specific courses or fields of study (e.g., Data Science, Web Development, AI) based on their queries, explaining why that path fits them.
      4. Always guide students seamlessly toward BSL's registration process and provide comprehensive information about our location and offerings.
      5. CRITICAL: NEVER use markdown formatting like asterisks (*) for bold text or bullet points. Format everything as plain text. Use standard numbers (1., 2.) for lists and standard dashes (-) instead of asterisks.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{ 
            parts: [{ text: userText }] 
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Response Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error("Invalid response format from Gemini");
    } catch (error) {
      console.error("Gemini Error:", error);
      // Fallback to professional keyword matching if API fails
      return getLocalFallbackResponse(userText);
    }
  };

  const getLocalFallbackResponse = (input) => {
    const text = input.toLowerCase();
    if (text.includes('location') || text.includes('where')) return knowledgeBase.location;
    if (text.includes('course') || text.includes('study')) return knowledgeBase.courses;
    if (text.includes('time') || text.includes('schedule')) return knowledgeBase.timing;
    if (text.includes('contact') || text.includes('whatsapp')) return knowledgeBase.contact;
    if (text.includes('fee') || text.includes('price')) return knowledgeBase.fee;
    if (text.includes('join') || text.includes('register')) return knowledgeBase.admission;
    
    return "I am currently assisting other students. BSL is located at Ali Chowk, near Hawa Market, Skardu. How else can I help you today?";
  };

  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const aiText = await getGeminiResponse(text);
    const aiResponse = { id: Date.now() + 1, type: 'ai', text: aiText };
    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);
  };

  const suggestions = [
    "What courses do you offer?",
    "Where is BSL located?",
    "Training timings?",
    "How to register?"
  ];

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="ai-avatar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
            </div>
            <div className="chat-header-info">
              <h4>BSL Support</h4>
              <span><div className="status-dot-mini"></div> Online Assistant</span>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="typing-indicator">Support is typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="suggested-questions">
            {suggestions.map((q, i) => (
              <div key={i} className="suggestion-chip" onClick={() => handleSendMessage(q)}>
                {q}
              </div>
            ))}
          </div>

          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Ask anything..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="send-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      <button className={`chatbot-toggle ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
};

export default AIChatbot;
