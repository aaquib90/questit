import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);
const DEFAULT_DURATION = 4000;

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    ({ title, description, duration = DEFAULT_DURATION } = {}) => {
      const id = generateId();
      setToasts((items) => [...items, { id, title, description, duration }]);
      if (Number.isFinite(duration)) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-3 px-4 sm:bottom-6">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border/40 bg-background/95 shadow-xl shadow-black/10 backdrop-blur"
                >
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                      {toast.description ? (
                        <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => dismiss(toast.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
