import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import StudentLogin from './components/StudentLogin';
import AdminLogin from './components/AdminLogin';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Exam from './components/Exam';
import Result from './components/Result';
import ProjectUpload from './components/ProjectUpload';
import { db } from './firebase';
import { ref, onValue } from "firebase/database";
import './App.css';

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
      <div className="App">
        <Sidebar 
          currentUser={currentUser} 
          isAdmin={isAdmin} 
          onLogout={handleLogout} 
          isOnline={isOnline}
        />
        
        <div className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                currentUser ? 
                <Navigate to={isAdmin ? "/admin-dashboard" : "/student-dashboard"} /> :
                <Navigate to="/student-login" />
              } 
            />
            <Route 
              path="/student-login" 
              element={
                currentUser && !isAdmin ? 
                <Navigate to="/student-dashboard" /> :
                <StudentLogin onLogin={handleLogin} />
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
      </div>
    </Router>
  );
}

export default App;
