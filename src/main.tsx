import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const isLandingOnlyModeEnabled = (() => {
  const raw = String(import.meta.env.VITE_LANDING_ONLY_MODE ?? '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
})();

const resolveLandingEntry = (): string => {
  const configured = String(import.meta.env.VITE_LANDING_ENTRY ?? '').trim();
  if (configured.length > 0) {
    return configured;
  }
  return '/landing/index.html';
};

const mount = async (): Promise<void> => {
  if (isLandingOnlyModeEnabled) {
    const landingEntry = resolveLandingEntry();
    const landingUrl = new URL(landingEntry, window.location.origin);
    if (window.location.pathname !== landingUrl.pathname) {
      if (landingUrl.origin === window.location.origin) {
        const requestedPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        landingUrl.searchParams.set('appquilar_landing_path', requestedPath);
      }
      window.location.replace(landingUrl.toString());
    }
    return;
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element #root was not found');
  }

  const root = ReactDOM.createRoot(rootElement);
  const [{ default: App }] = await Promise.all([import('./App.tsx')]);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

void mount();
