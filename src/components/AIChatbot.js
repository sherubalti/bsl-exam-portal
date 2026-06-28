import React, { useState, useEffect, useRef } from 'react';
import '../AIChatbot.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hello! I am your BSL AI Tutor. How can I assist you today?\n\nآداب! میں آپ کا BSL AI ٹیوٹر ہوں۔ آج میں آپ کی کس طرح مدد کر سکتا ہوں؟' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US'); // 'en-US' or 'ur-PK'
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const isCancelledRef = useRef(false); // tracks if user closed chat during a pending response

  // Load voices properly (browsers load them async)
  const getVoicesLoaded = () => new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
  });

  // Web Speech API for TTS
  const speakText = async (text, lang) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const activeLang = lang || voiceLang;

    // Wait for voices to be available
    const voices = await getVoicesLoaded();

    // Log available voices to console for debugging
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

    const isUrdu = activeLang === 'ur-PK';
    const femaleOrChildNames = ['female', 'zira', 'susan', 'hazel', 'fiona', 'samantha', 'karen', 'moira', 'tessa', 'veena', 'child'];
    const maleNames = ['david', 'mark', 'guy', 'james', 'richard', 'george', 'daniel', 'male', 'reed', 'rishi'];

    let selectedVoice = null;

    if (isUrdu) {
      utterance.lang = 'ur-PK';
      selectedVoice = voices.find(v =>
        v.lang.toLowerCase().includes('ur') &&
        !femaleOrChildNames.some(n => v.name.toLowerCase().includes(n))
      ) || voices.find(v => v.lang.toLowerCase().includes('ur'));

      // If no Urdu voice, use English male voice with low pitch for Urdu text
      if (!selectedVoice) {
        selectedVoice = voices.find(v =>
          v.lang.toLowerCase().includes('en') &&
          maleNames.some(n => v.name.toLowerCase().includes(n))
        );
        utterance.lang = 'en-US';
      }
    } else {
      utterance.lang = 'en-US';
      // Prefer known deep male voices
      selectedVoice = voices.find(v =>
        v.lang.toLowerCase().startsWith('en') &&
        maleNames.some(n => v.name.toLowerCase().includes(n))
      );
      // Fallback: any en voice not female/child
      if (!selectedVoice) {
        selectedVoice = voices.find(v =>
          v.lang.toLowerCase().startsWith('en') &&
          !femaleOrChildNames.some(n => v.name.toLowerCase().includes(n))
        );
      }
    }

    if (selectedVoice) {
      console.log('Selected voice:', selectedVoice.name);
      utterance.voice = selectedVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 0.55; // Very low pitch — deep adult male
    window.speechSynthesis.speak(utterance);
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Trigger voice load
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    scrollToBottom();
  }, [messages, isTyping]);

  // Voice Input (Speech-to-Text)
  const startListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Stop any ongoing AI speech BEFORE starting recognition to prevent 'aborted' conflicts
    window.speechSynthesis?.cancel();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Input. Please use Google Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInputValue(speechToText);
      handleSendMessage(speechToText); // Auto-send to AI model
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone access blocked! Please click the lock icon in your browser URL bar and allow Microphone access.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsListening(false);
    }
  };

  const knowledgeBase = {
    location: "Baltistan Silicon Lab (BSL Academy) is located at Ali Chowk, near Hawa Market, Skardu. We are easily accessible and centrally located for all students.",
    courses: "Our curriculum includes specialized tracks in Artificial Intelligence, Data Science, Machine Learning (ML), Computer Vision (CV), and Natural Language Processing (NLP).",
    timing: "We offer flexible professional schedules: Morning Track (09:00 - 12:00) and Evening Track (17:00 - 20:00). Special weekend workshops are also conducted regularly.",
    contact: "For direct inquiries, please contact our administrative office via WhatsApp at +92 342 6930403 or email us at baltistansiliconlab@gmail.com.",
    fee: "Course fees vary by specialization. We provide scholarships for meritorious students. Please reach out to our admissions office for the latest fee structure.",
    admission: "Admissions are currently open. You can apply via the registration portal on our homepage. Shortlisted candidates will be called for a technical assessment.",
    instructor: "Our faculty consists of ms researchers and industry leads from top global technology firms, ensuring world-class mentorship."
  };

  // ── Detect which language the user typed ─────────────────────────
  const detectLang = (text) => {
    // Urdu Unicode block: \u0600-\u06FF, \u0750-\u077F, \uFB50-\uFDFF, \uFE70-\uFEFF
    const urduScriptRatio = (text.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length / text.length;
    if (urduScriptRatio > 0.2) return 'ur-PK';  // Urdu script

    // Roman Urdu common words
    const romanUrduWords = ['kya', 'hai', 'hain', 'kaise', 'mujhe', 'aap', 'yeh', 'woh', 'bhi', 'nahi', 'karo', 'karo', 'batao', 'bata', 'dena', 'lena', 'shukriya', 'mehrbani', 'adaab', 'salaam', 'kahan', 'kitna', 'kab', 'kuch', 'kyun', 'theek', 'accha', 'zyada', 'kam', 'beta', 'bhai', 'jee', 'haan', 'na', 'matlab', 'course', 'fee', 'timing', 'admission', 'register'];
    const lower = text.toLowerCase();
    const romanHits = romanUrduWords.filter(w => lower.includes(w)).length;
    if (romanHits >= 2) return 'ur-PK'; // Roman Urdu

    return 'en-US'; // Default English
  };

  // ── AI response with auto language matching ───────────────────────
  const getGroqResponse = async (userText, detectedLang) => {
    try {
      const langRule = detectedLang === 'ur-PK'
        ? `LANGUAGE RULE: The user wrote in Urdu or Roman Urdu.
- If they wrote in Urdu script (اردو), reply ONLY in proper Urdu script. Do NOT include any English.
- If they wrote in Roman Urdu (e.g. "kya hal hai"), reply ONLY in Roman Urdu. Do NOT include Urdu script or English.
- Be natural, warm and professional like a Pakistani male tutor.`
        : `LANGUAGE RULE: The user wrote in English. Reply ONLY in clear, professional English. Do NOT include any Urdu.`;

      const systemPrompt = `You are "Alex", a professional and warm Pakistani male AI Tutor for BSL Academy (Baltistan Silicon Lab), Skardu.

${langRule}

ABOUT BSL ACADEMY:
- Location: Ali Chowk, near Hawa Market, Skardu.
- Contact: WhatsApp 0342-6930403 | Email: baltistansiliconlab@gmail.com
- Courses: AI, Data Science, Machine Learning, Computer Vision, NLP, MERN Stack.
- Timings: Morning 9am–12pm, Evening 5pm–8pm. Weekend workshops available.
- Fees: Vary by course. Scholarships available for deserving students.
- Admission: Apply via the registration portal on the homepage.

RULES:
- No markdown, no bullet points, no asterisks — plain conversational sentences only.
- Answer ALL topics: technology, AI, programming, science, math, general knowledge, etc.
- Never refuse. Always give a helpful, intelligent answer.
- If asked who you are: say you are Alex, BSL Academy AI Tutor.`;

      const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
      console.log("API KEY:", process.env.REACT_APP_GROQ_API_KEY);

      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
          ],
          temperature: 0.75,
          max_tokens: 450,
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Groq API Error:", response.status, errData);
        throw new Error("API Error: " + response.status);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error("Groq Error:", error.message);
      return getLocalFallbackResponse(userText, detectedLang);
    }
  };

  const getLocalFallbackResponse = (input, lang) => {
    const text = input.toLowerCase();
    const isUrdu = lang === 'ur-PK';
    if (text.includes('location') || text.includes('kahan') || text.includes('skardu'))
      return isUrdu ? 'BSL اکیڈمی علی چوک، ہوا مارکیٹ کے قریب، سکردو میں واقع ہے۔' : knowledgeBase.location;
    if (text.includes('course') || text.includes('study') || text.includes('parhna'))
      return isUrdu ? 'ہم AI، ڈیٹا سائنس، مشین لرننگ، NLP اور کمپیوٹر ویژن کے کورسز پیش کرتے ہیں۔' : knowledgeBase.courses;
    if (text.includes('time') || text.includes('timing') || text.includes('waqt'))
      return isUrdu ? 'صبح کی کلاس 9 بجے سے 12 بجے تک اور شام کی کلاس 5 بجے سے 8 بجے تک ہوتی ہے۔' : knowledgeBase.timing;
    if (text.includes('fee') || text.includes('fees') || text.includes('kitna'))
      return isUrdu ? 'فیس کورس کے حساب سے مختلف ہے۔ ہمارے دفتر سے رابطہ کریں۔' : knowledgeBase.fee;
    return isUrdu ? 'میں BSL اکیڈمی کا AI ٹیوٹر ہوں۔ کورسز، فیس یا داخلے کے بارے میں پوچھیں۔' :
      "I'm your BSL AI Tutor! Ask me about courses, timings, fees or joining us in Skardu.";
  };

  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    window.speechSynthesis?.cancel();

    const detectedLang = detectLang(text);

    const userMessage = { id: Date.now(), type: 'user', text: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    isCancelledRef.current = false;

    const aiText = await getGroqResponse(text, detectedLang);

    if (isCancelledRef.current) { setIsTyping(false); return; }

    const aiResponse = { id: Date.now() + 1, type: 'ai', text: aiText };
    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);

    // Speak in the SAME language the user used
    speakText(aiText, detectedLang);
  };

  const suggestions = [
    "What courses do you offer?",
    "BSL kahan hai?",
    "Fee kitni hai?",
    "AI kya hota hai?"
  ];

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) window.speechSynthesis?.cancel(); // Muting immediately stops speech
  };

  const closeCall = () => {
    isCancelledRef.current = true; // Mark as cancelled so pending response won't speak
    window.speechSynthesis?.cancel(); // Stop any active voice immediately
    if (recognitionRef.current) recognitionRef.current.stop(); // Stop mic if listening
    setIsListening(false);
    setIsTyping(false);
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
        <div className="chatbot-window video-call-layout">
          {/* Background Avatar covering entire window */}
          <div className="video-call-background ai-breathe-bg">
            <img src="/ai_avatar_male.png" alt="Virtual Tutor" />
          </div>

          {/* Top Header Overlay */}
          <div className="video-call-header">
            <div className="vc-title">
              <span className="vc-status-dot"></span> BSL AI Tutor
            </div>
            <div className="vc-actions">
              <button className="vc-icon-btn" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? '🔇' : '🔊'}
              </button>
              <button className="vc-icon-btn" onClick={() => setVoiceLang(prev => prev === 'en-US' ? 'ur-PK' : 'en-US')} title="Voice Accent: EN / UR">
                🌐 {voiceLang === 'en-US' ? 'EN' : 'UR'}
              </button>
              <button className="vc-icon-btn vc-close-btn" onClick={closeCall}>
                ✕
              </button>
            </div>
          </div>

          {/* Middle Overlay: Subtitles */}
          <div className="vc-subtitles">
            {messages.slice(-3).map(msg => (
              <div key={msg.id} className={`vc-message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="vc-message ai typing-indicator">
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Overlay: Inputs */}
          <div className="vc-input-area">
            {showKeyboard ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="vc-input-form">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type or ask..."
                  className="vc-input"
                />
                <button type="submit" className="vc-send-btn" disabled={!inputValue.trim()}>
                  ➤
                </button>
              </form>
            ) : (
              <div className="vc-voice-controls">
                <button
                  className={`vc-mic-btn ${isListening ? 'listening' : ''}`}
                  onClick={startListening}
                >
                  {isListening ? '🛑 Stop' : '🎙️ Tap to Speak'}
                </button>
              </div>
            )}

            <button className="vc-mode-toggle" onClick={() => setShowKeyboard(!showKeyboard)}>
              {showKeyboard ? '🗣️ Switch to Voice' : '⌨️ Switch to Keyboard'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button (visible when closed) */}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={handleInitialOpen} style={{ padding: 0, overflow: 'hidden', zIndex: 999999, cursor: 'pointer' }}>
          <img src="/ai_avatar_male.png" alt="Virtual Tutor" className="ai-breathe" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
        </button>
      )}
    </div>
  );
};

export default AIChatbot;
