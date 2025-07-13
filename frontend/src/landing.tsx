import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './components/LandingPage';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <LandingPage />
    </React.StrictMode>
  );
}