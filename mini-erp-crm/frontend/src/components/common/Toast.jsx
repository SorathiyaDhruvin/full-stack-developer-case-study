import { useState, useEffect, useCallback } from "react";

let toastId = 0;

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  useEffect(() => {
    window.__addToast = addToast;
    return () => {
      delete window.__addToast;
    };
  }, [addToast]);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}>
            x
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
