import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Training from './components/Training';
import About from './components/About';
import Contact from './components/Contact';
import StudentLogin from './components/StudentLogin';
import AdminLogin from './components/AdminLogin';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Exam from './components/Exam';
import Result from './components/Result';
import ProjectUpload from './components/ProjectUpload';
import StudentRegister from './components/StudentRegister';
import AIChatbot from './components/AIChatbot';
import { db } from './firebase';
import { ref, onValue } from "firebase/database";
import './App.css';

function AppContent({ currentUser, isAdmin, isOnline, handleLogin, handleLogout }) {
  const location = useLocation();
  const publicPaths = ['/', '/courses', '/student-register', '/about', '/contact'];
  const isHomePage = publicPaths.includes(location.pathname);

  return (
    <div className="App">
      {isHomePage ? (
        <Navbar />
      ) : (
        <Sidebar 
          currentUser={currentUser} 
          isAdmin={isAdmin} 
          onLogout={handleLogout} 
          isOnline={isOnline}
        />
      )}
      
      <div className={`main-content ${isHomePage ? 'full-width' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Training />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/student-login" 
            element={
              currentUser && !isAdmin ? 
              <Navigate to="/student-dashboard" /> :
              <StudentLogin onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/student-register" 
            element={
              currentUser && !isAdmin ? 
              <Navigate to="/student-dashboard" /> :
              <StudentRegister onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/admin-login" 
            element={
              isAdmin ? 
              <Navigate to="/admin-dashboard" /> :
              <AdminLogin onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/student-dashboard" 
            element={
              currentUser && !isAdmin ? 
              <StudentDashboard user={currentUser} /> :
              <Navigate to="/student-login" />
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              isAdmin ? 
              <AdminDashboard /> :
              <Navigate to="/admin-login" />
            } 
          />
          <Route 
            path="/exam" 
            element={
              currentUser && !isAdmin ? 
              <Exam user={currentUser} /> :
              <Navigate to="/student-login" />
            } 
          />
          <Route 
            path="/result" 
            element={
              currentUser && !isAdmin ? 
              <Result user={currentUser} /> :
              <Navigate to="/student-login" />
            } 
          />
          <Route 
            path="/project-upload" 
            element={
              currentUser && !isAdmin ? 
              <ProjectUpload user={currentUser} /> :
              <Navigate to="/student-login" />
            } 
          />
        </Routes>
      </div>
      <AIChatbot />
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData.user);
      setIsAdmin(userData.isAdmin || false);
    }

    // Monitor Firebase Connection Status
    const connectedRef = ref(db, ".info/connected");
    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        console.log("Firebase Connected");
        setIsOnline(true);
      } else {
        console.log("Firebase Disconnected");
        setIsOnline(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user, admin = false) => {
    setCurrentUser(user);
    setIsAdmin(admin);
    localStorage.setItem('currentUser', JSON.stringify({
      user: user,
      isAdmin: admin
    }));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <AppContent 
        currentUser={currentUser}
        isAdmin={isAdmin}
        isOnline={isOnline}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
