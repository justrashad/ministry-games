import { t } from '../../i18n/i18n';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}

/** Native <dialog> gives us focus trapping, Escape handling and inert background for free. */
export function Modal({ open, onClose, title, description, children, footer, width = 560 }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute('open', '');
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      style={{ ['--modal-width' as string]: `${width}px` }}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="modal-card panel max-h-[88vh] overflow-y-auto !p-0">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <h2 id={titleId} className="text-xl font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1 text-sm text-night-200">
                  {description}
                </p>
              )}
            </div>
            <button type="button" className="btn btn-subtle btn-sm -mr-2" onClick={onClose} aria-label={t('Close')}>
              <X className="btn-icon" aria-hidden />
            </button>
          </div>
          {children && <div className="px-5 py-5 sm:px-6">{children}</div>}
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 px-5 py-4 sm:px-6">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
