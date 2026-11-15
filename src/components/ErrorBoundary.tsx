import { t } from '../i18n/i18n';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Last line of defense: a friendly recovery screen instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Ministry Showdown error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-3xl font-semibold">{t('Something went wrong on this screen')}</h1>
        <p className="text-night-100">{t('Your questions and settings are saved. Reload to continue; the current game will pick up where it left off.')}</p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-gold btn-lg" onClick={() => window.location.reload()}>
            {t('Reload')}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-lg"
            onClick={() => {
              window.location.hash = '/';
              window.location.reload();
            }}
          >
            {t('Go home')}
          </button>
        </div>
      </div>
    );
  }
}
