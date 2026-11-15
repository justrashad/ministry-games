import '@fontsource-variable/outfit';
import './theme.css';
import './i18n/register';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '../../core/components/ErrorBoundary';
import App from './App';
import { adoptTypedPath } from './lib/router';

adoptTypedPath();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
