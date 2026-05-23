import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import logo from './assets/logo.png';

// Dynamically set the BSL company logo as the favicon
const setFavicon = () => {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/png';
  link.rel = 'shortcut icon';
  link.href = logo;
  document.getElementsByTagName('head')[0].appendChild(link);
};
setFavicon();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);