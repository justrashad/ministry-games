import './i18n/register';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from '../../core/components/ErrorBoundary';
import { consumePurchaseLink } from './lib/router';

consumePurchaseLink();

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
