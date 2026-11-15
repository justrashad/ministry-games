import { t } from '../../i18n/i18n';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { onStorageError } from '../../lib/storage';

type Tone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}
interface ToastApi {
  show: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastApi>({ show: () => undefined });

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (message: string, tone: Tone = 'success') => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), tone === 'error' ? 6500 : 3500);
    },
    [dismiss],
  );

  useEffect(() => onStorageError((message) => show(message, 'error')), [show]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="no-print pointer-events-none fixed inset-x-0 bottom-28 z-[70] lg:bottom-4 flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {toasts.map((toastItem) => {
          const Icon = ICONS[toastItem.tone];
          return (
            <div
              key={toastItem.id}
              className={`pop-in pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 shadow-2xl ring-1 ${
                toastItem.tone === 'error' ? 'bg-rose-950 text-rose-50 ring-rose-400/40' : 'bg-night-800 text-cream ring-white/15'
              }`}
            >
              <Icon aria-hidden className={`mt-0.5 h-5 w-5 shrink-0 ${toastItem.tone === 'error' ? 'text-rose-300' : toastItem.tone === 'success' ? 'text-emerald-300' : 'text-gold-300'}`} />
              <p className="text-sm font-semibold">{toastItem.message}</p>
              <button type="button" className="ml-1 rounded p-0.5 text-night-200 hover:text-cream" onClick={() => dismiss(toastItem.id)} aria-label={t('Dismiss')}>
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
