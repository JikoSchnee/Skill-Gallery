import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
document.documentElement.style.setProperty('--card-back-logo-url', `url("${import.meta.env.BASE_URL}cards/back-logo.svg")`);
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
