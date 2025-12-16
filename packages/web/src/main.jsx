import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// Configure axios to use the API URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://linklock-api-hm2c.onrender.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
