import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setApiErrorHandler } from '../api/axios';

const UIFeedbackContext = createContext(null);

export function UIFeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = 'error') => {
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    setApiErrorHandler((error) => {
      const apiMessage = error?.response?.data?.error;
      if (apiMessage) notify(apiMessage, 'error');
    });
  }, [notify]);

  const value = useMemo(() => ({ notify, removeToast, toasts }), [notify, removeToast, toasts]);

  return (
    <UIFeedbackContext.Provider value={value}>
      {children}
      <div className="ui-toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`ui-toast ui-toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => removeToast(toast.id)}>x</button>
          </div>
        ))}
      </div>
    </UIFeedbackContext.Provider>
  );
}

export function useUIFeedback() {
  const context = useContext(UIFeedbackContext);
  if (!context) {
    throw new Error('useUIFeedback debe usarse dentro de UIFeedbackProvider');
  }
  return context;
}
