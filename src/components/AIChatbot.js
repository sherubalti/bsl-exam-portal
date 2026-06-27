import React, { useState, useEffect, useRef } from 'react';
import '../AIChatbot.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hello! I am your BSL AI Guider. How can I assist you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const messagesEndRef = useRef(null);

  // Web Speech API for TTS
  const speakText = (text) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang === 'ur-PK' ? 'ur-PK' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Voice Input (Speech-to-Text)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Input. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      window.speechSynthesis?.cancel(); // stop AI speaking when user talks
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInputValue(speechToText);
      handleSendMessage(speechToText); // Auto-send to AI model
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const knowledgeBase = {
    location: "Baltistan Silicon Lab (BSL Academy) is located at Ali Chowk, near Hawa Market, Skardu. We are easily accessible and centrally located for all students.",
    courses: "Our curriculum includes specialized tracks in Artificial Intelligence, Data Science, Machine Learning (ML), Computer Vision (CV), and Natural Language Processing (NLP).",
    timing: "We offer flexible professional schedules: Morning Track (09:00 - 12:00) and Evening Track (17:00 - 20:00). Special weekend workshops are also conducted regularly.",
    contact: "For direct inquiries, please contact our administrative office via WhatsApp at +92 342 6930403 or email us at info@bsl.edu.pk.",
    fee: "Course fees vary by specialization. We provide scholarships for meritorious students. Please reach out to our admissions office for the latest fee structure.",
    admission: "Admissions are currently open. You can apply via the registration portal on our homepage. Shortlisted candidates will be called for a technical assessment.",
    instructor: "Our faculty consists of PhD researchers and industry leads from top global technology firms, ensuring world-class mentorship."
  };

  const getGroqResponse = async (userText) => {
    try {
      const systemPrompt = `You are an interactive AI Video Tutor for BSL Academy. 
      YOUR CORE RULES:
      1. ONLY answer questions related to TECHNOLOGY and BSL ACADEMY (courses, location, timings).
      2. If asked about ANYTHING ELSE, politely say: "I'm your BSL AI tutor, so I can only discuss our tech courses and academy details!"
      3. CRITICAL: Respond in the EXACT same language the user uses (English, Roman Urdu, or Urdu script).
      
      BSL DETAILS:
      - Location: Ali Chowk, near Hawa Market, Skardu.
      - Contact: WhatsApp 0342-6930403
      - Courses: AI, Data Science, MERN Stack.
      - Keep responses conversational, friendly, short (like you are speaking to them on a video call), and unformatted (no markdown or bullet points).`;


      const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
          ],
          temperature: 0.5,
          max_tokens: 300,
        })
      });

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error("Groq Error:", error);
      return getLocalFallbackResponse(userText);
    }
  };

  const getLocalFallbackResponse = (input) => {
    const text = input.toLowerCase().trim();
    if (text.includes('location') || text.includes('where') || text.includes('skardu')) return knowledgeBase.location;
    if (text.includes('course') || text.includes('study')) return knowledgeBase.courses;
    if (text.includes('time') || text.includes('schedule')) return knowledgeBase.timing;
    if (text.includes('contact') || text.includes('whatsapp')) return knowledgeBase.contact;
    if (text.includes('fee') || text.includes('price')) return knowledgeBase.fee;
    if (text.includes('join') || text.includes('register')) return knowledgeBase.admission;

    return "I'm your BSL AI Tutor! Ask me about our courses, timings, location, or how to join us in Skardu.";
  };

  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    // Stop speaking if user interrupts
    window.speechSynthesis?.cancel();

    const userMessage = { id: Date.now(), type: 'user', text: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const aiText = await getGroqResponse(text);
    const aiResponse = { id: Date.now() + 1, type: 'ai', text: aiText };

    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);
    speakText(aiText);
  };

  const suggestions = [
    "What courses do you offer?",
    "Where is BSL located?",
    "Training timings?",
    "How to register?"
  ];

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) window.speechSynthesis?.cancel(); // Muting immediately stops speech
  };

  const closeCall = () => {
    window.speechSynthesis?.cancel();
    setIsOpen(false);
  };

  const handleInitialOpen = () => {
    setIsOpen(true);
    // Greet if it's the first time
    if (messages.length === 1) {
      speakText(messages[0].text);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chat-window">
          {/* Top Header */}
          <div className="call-header">
            <div className="call-header-info">
              <h4>BSL AI Guider</h4>
              <span><div className="status-dot-mini"></div> Connected</span>
            </div>
          </div>

          {/* Central Animated Avatar */}
          <div className="avatar-container">
            <div className={`ai-avatar-core ${isTyping || ('speechSynthesis' in window && window.speechSynthesis.speaking) ? 'speaking' : ''}`}>
              <div className="ai-avatar-rings"></div>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M12 12 2.1 16.9"></path>
                <path d="M12 12 21.9 16.9"></path>
              </svg>
            </div>
          </div>

          {/* Floating Chat/Subtitles */}
          <div className="chat-subtitles">
            {messages.slice(-5).map(msg => (
              <div key={msg.id} className={`message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="typing-indicator">AI is listening...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Keyboard & Suggestions */}
          {showKeyboard && (
            <div className="keyboard-area">
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
                  placeholder="Ask me anything about BSL..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="send-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* Call Controls Bar */}
          <div className="call-controls">
            <button className="control-btn lang-toggle" onClick={() => setVoiceLang(voiceLang === 'en-US' ? 'ur-PK' : 'en-US')} aria-label="Toggle Language" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
              {voiceLang === 'en-US' ? 'EN' : 'UR'}
            </button>
            <button className={`control-btn mute ${isMuted ? 'active' : ''}`} onClick={toggleMute} aria-label="Mute Audio">
              {isMuted ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
              )}
            </button>
            <button className={`control-btn keyboard ${isListening ? 'active' : ''}`} onClick={startListening} aria-label="Start Voice Input">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isListening ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
            <button className={`control-btn keyboard ${showKeyboard ? 'active' : ''}`} onClick={() => setShowKeyboard(!showKeyboard)} aria-label="Toggle Keyboard">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                <line x1="6" y1="8" x2="6.01" y2="8"></line><line x1="10" y1="8" x2="10.01" y2="8"></line><line x1="14" y1="8" x2="14.01" y2="8"></line><line x1="18" y1="8" x2="18.01" y2="8"></line><line x1="6" y1="12" x2="6.01" y2="12"></line><line x1="10" y1="12" x2="10.01" y2="12"></line><line x1="14" y1="12" x2="14.01" y2="12"></line><line x1="18" y1="12" x2="18.01" y2="12"></line><line x1="8" y1="16" x2="16" y2="16"></line>
              </svg>
            </button>
            <button className="control-btn end-call" onClick={closeCall} aria-label="End Call">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                <line x1="23" y1="1" x2="1" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button (visible when closed) */}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={handleInitialOpen}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            <circle cx="11" cy="12" r="3"></circle>
          </svg>
        </button>
      )}
    </div>
  );
};

export default AIChatbot;
