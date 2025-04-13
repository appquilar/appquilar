
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RepositoryConfig } from './infrastructure/config/RepositoryConfig';

// Initialize repositories (default to mock repositories)
RepositoryConfig.useMockRepositories();

// To use API repositories, uncomment the line below:
// RepositoryConfig.useApiRepositories('https://api.example.com');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
