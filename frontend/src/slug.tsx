import React from 'react';
import ReactDOM from 'react-dom/client';
import SlugPage from './components/SlugPage';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <div className="container mx-auto p-4 overflow-y-auto h-screen">
        <SlugPage />
      </div>
    </React.StrictMode>
  );
}