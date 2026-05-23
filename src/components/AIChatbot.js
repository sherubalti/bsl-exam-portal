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
      const systemPrompt = `You are the ultimate Admissions Counselor and Support Assistant for Baltistan Silicon Lab (BSL Academy) in Skardu. Your core mission is to guide students, professionals, and tech aspirants towards enrolling in the perfect BSL course to launch their high-paying careers.

      BSL ACADEMY CONTEXT & DETAILS:
      - Location: Ali Chowk, near Hawa Market, Skardu, Gilgit-Baltistan.
      - Contact: WhatsApp +92 342 6930403 | Email: info@bsl.edu.pk.
      - Timings: Morning Track (9:00 AM - 12:00 PM), Evening Track (5:00 PM - 8:00 PM). Fully flexible for students and working professionals.
      - Registration: Students can easily apply via the online Registration Portal on our homepage. 
      - Mission: Bridging Skardu and Gilgit-Baltistan with the global digital economy through world-class IT education.

      BSL COURSE DIRECTORY (Focus intensely on these):
      1. Python for AI (Duration: 2 Months)
         - Target: Absolute beginners, school/college students, and people with no programming background.
         - Covered: Core Python syntax, loops, conditional logic, functions, and Object-Oriented Programming (OOP).
         - Value: The foundational stepping stone required before moving into Data Science or Advanced AI.
      2. MERN Stack Web Development / Web Advanced (Duration: 4 Months)
         - Target: Aspiring web developers, UI/UX enthusiasts, and freelancers.
         - Covered: HTML5, CSS3, Tailwind CSS, Modern JavaScript (ES6+), React.js, Node.js, Express.js, MongoDB, REST APIs, Git/GitHub, and cloud deployment.
         - Value: Perfect for students wanting to earn through international freelancing platforms (Upwork, Fiverr) or join global dev teams.
      3. Data Science & Machine Learning (Duration: 4 Months)
         - Target: Math lovers, analysts, and students interested in business insights.
         - Covered: Python libraries (Pandas, NumPy, Matplotlib, Seaborn), SQL Databases, Statistics, Predictive Modelling, and Core Machine Learning (Scikit-Learn).
         - Value: Opens career paths in global data analytics, market research, and business intelligence.
      4. Advanced AI & Deep Learning (Duration: 4 Months)
         - Target: Intermediate developers, tech enthusiasts who know basic Python.
         - Covered: Deep Learning, Artificial Neural Networks (ANN/CNN/RNN), TensorFlow, PyTorch, Computer Vision (OpenCV, YOLO Object Detection), NLP, and Generative AI.
         - Value: Extremely premium course aimed at landing elite, high-paying remote roles in artificial intelligence.
      5. Data Structures & Algorithms / DSA (Duration: 3 Months)
         - Target: Software engineers, Computer Science students, and interview candidates.
         - Covered: Logic optimization, Arrays, Linked Lists, Stacks, Queues, Recursion, Trees, Searching/Sorting algorithms.
         - Value: Vital for passing technical interviews at top software houses and globally recognized tech giants.

      YOUR RESPONSE INSTRUCTIONS:
      1. Be extremely encouraging, highly professional, polite, and detailed.
      2. FOCUS ON BSL COURSES: No matter what the user asks, connect it back to how BSL Academy's courses can help them achieve their dreams.
      3. If they ask a general tech question (e.g., "What is React?"), briefly explain it in simple terms, and then immediately say: "At BSL Academy, we teach React in-depth as part of our premium MERN Stack Web Development course..." and pitch the course!
      4. Actively ask the user about their current educational background or career interest so you can recommend the absolute perfect track for them.
      5. ALWAYS guide them seamlessly toward our online Registration Portal and share our Skardu location and WhatsApp (+92 342 6930403) for easy admissions.
      6. CRITICAL FORMATTING RULE: NEVER use markdown formatting like double asterisks (**) for bolding, or markdown headers (#), or bullet points with asterisks (*). Present all lists using standard numbers (1., 2.) or standard dashes (-). Make it look neat in plain text.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
    const text = input.toLowerCase().trim();
    if (text === 'hi' || text === 'hello' || text === 'hey' || text.startsWith('hi ') || text.startsWith('hello ')) {
      return "Hello! I am your BSL Support Assistant. How can I help you today? You can ask me about our courses, location, class timings, or how to register! I can also recommend courses based on your interests.";
    }
    
    // Course recommendation logic based on student interests
    if (text.includes('recommend') || text.includes('suggest') || text.includes('choose') || text.includes('select') || text.includes('interest') || text.includes('want to') || text.includes('career') || text.includes('job')) {
      if (text.includes('web') || text.includes('design') || text.includes('frontend') || text.includes('backend') || text.includes('app') || text.includes('site') || text.includes('mern')) {
        return `Based on your interest in building websites and interactive applications, I highly recommend our **MERN Stack Web Development** track!

Here are the key details:
- **Duration**: 4 Months (Flexible Morning/Evening slots)
- **What You Will Learn**: HTML5, CSS3, Tailwind CSS, Modern JavaScript (ES6+), MongoDB, Express.js, React.js, Node.js, and REST APIs.
- **Hands-on Practice**: You will build 5+ real-world projects, including an E-commerce store and a fully functional social app.
- **Career Roles**: Full-Stack Web Developer, Frontend Engineer, React Specialist, Freelance Developer.
- **Average Starting Salary**: Highly lucrative remote/on-site positions!`;
      }
      if (text.includes('math') || text.includes('number') || text.includes('statistic') || text.includes('data') || text.includes('analysis') || text.includes('science')) {
        return `Since you enjoy working with data, numbers, and analytics, our **Data Science & AI** track is the absolute perfect fit for you!

Here are the course details:
- **Duration**: 4 Months (Includes intensive workshops)
- **What You Will Learn**: Python Programming, SQL Databases, Data Wrangling (Pandas, NumPy), Data Visualization (Matplotlib, Seaborn), and Core Machine Learning Algorithms (Regression, Classification, Clustering with Scikit-Learn).
- **Practical Exposure**: Work on live datasets to predict prices, classify images, and generate reports.
- **Career Roles**: Data Analyst, Data Scientist, Business Intelligence (BI) Analyst, Machine Learning Intern.`;
      }
      if (text.includes('robot') || text.includes('automation') || text.includes('intelligence') || text.includes('ai') || text.includes('ml') || text.includes('deep')) {
        return `Since you are fascinated by cutting-edge automation, AI, and smart systems, I strongly recommend our **Advanced AI & Deep Learning** track!

Here are the course details:
- **Duration**: 4 Months (Prerequisite: Core Python knowledge)
- **What You Will Learn**: Deep Learning, Neural Networks (TensorFlow & PyTorch), Computer Vision (OpenCV, YOLO Object Detection), Natural Language Processing (NLP), and Generative AI concepts.
- **Capstone Project**: Build custom image classifiers, object detection systems, or your own conversational AI.
- **Career Roles**: AI Engineer, Computer Vision Engineer, NLP Developer, Research Associate.`;
      }
      if (text.includes('python') || text.includes('code') || text.includes('program') || text.includes('logic')) {
        return `If you want to start programming or need to strengthen your problem-solving skills, I highly recommend our **Python for AI & Data Structures** track!

Here are the course details:
- **Duration**: 2-3 Months
- **What You Will Learn**: Core Python concepts (Data Types, Loops, Functions, OOPs), recursion, algorithms (sorting, searching), and essential Data Structures (Arrays, Linked Lists, Stacks, Queues, Trees).
- **Why this path**: It forms the fundamental baseline for Data Science, AI, and backend web roles, and prepares you to clear technical code interviews.
- **Career Roles**: Junior Python Developer, Software QA Tester, or a solid launchpad for Advanced AI/Web development.`;
      }
      return `I would love to recommend the perfect course for you! Are you interested in:

1. **Web Development** (Building websites and applications with React & Node.js)
2. **Data Science** (Analyzing data, working with charts, and predicting trends with Python)
3. **Advanced AI & Deep Learning** (Training deep neural networks and building smart computer vision systems)

Reply with which one sounds interesting to you, and I will give you full details!`;
    }

    if (text.includes('location') || text.includes('where') || text.includes('skd') || text.includes('skardu') || text.includes('address') || text.includes('place') || text.includes('map') || text.includes('chowk') || text.includes('hawa')) {
      return knowledgeBase.location;
    }
    if (text.includes('course') || text.includes('study') || text.includes('class') || text.includes('syllabus') || text.includes('track') || text.includes('program')) {
      return knowledgeBase.courses;
    }
    if (text.includes('time') || text.includes('schedule') || text.includes('hour') || text.includes('timing') || text.includes('morning') || text.includes('evening')) {
      return knowledgeBase.timing;
    }
    if (text.includes('contact') || text.includes('whatsapp') || text.includes('number') || text.includes('phone') || text.includes('email') || text.includes('call')) {
      return knowledgeBase.contact;
    }
    if (text.includes('fee') || text.includes('price') || text.includes('cost') || text.includes('charge') || text.includes('scholarship')) {
      return knowledgeBase.fee;
    }
    if (text.includes('join') || text.includes('register') || text.includes('apply') || text.includes('admission') || text.includes('enroll')) {
      return knowledgeBase.admission;
    }
    if (text.includes('instructor') || text.includes('teacher') || text.includes('trainer') || text.includes('faculty') || text.includes('nasir') || text.includes('sher') || text.includes('sharafat') || text.includes('who teaches')) {
      return knowledgeBase.instructor;
    }
    
    return "Hello! I am your BSL Support Assistant. I'm here to help you with details about our professional courses, class schedules, location at Skardu, and registration. How can I assist you today?";
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
