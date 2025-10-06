import React, { useState, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext, Toast, ToastVariant } from './toastContext';


// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Toast provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Add a new toast
  const toast = (props: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast = { id, ...props };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  };
  
  // Dismiss a toast
  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  
  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

// Toast container component
const ToastContainer: React.FC<{ toasts: Toast[]; dismiss: (id: string) => void }> = ({ 
  toasts, 
  dismiss 
}) => {
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col items-end space-y-2 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            w-full bg-white rounded-lg shadow-lg border border-gray-100 p-4 flex items-start 
            transform transition-all duration-300 ease-in-out animate-toast-slide-in
            ${getToastStyles(toast.variant || 'default')}
          `}
        >
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {getToastIcon(toast.variant || 'default')}
          </div>
          <div className="flex-1 mr-2">
            {toast.title && (
              <h3 className="font-medium text-sm">{toast.title}</h3>
            )}
            {toast.description && (
              <p className="text-xs text-gray-500 mt-1">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper functions for toast styles
const getToastStyles = (variant: ToastVariant): string => {
  switch (variant) {
    case 'success':
      return 'border-l-4 border-l-green-500';
    case 'destructive':
      return 'border-l-4 border-l-red-500';
    case 'info':
      return 'border-l-4 border-l-blue-500';
    default:
      return 'border-l-4 border-l-gray-500';
  }
};

// Helper function for toast icons
const getToastIcon = (variant: ToastVariant): JSX.Element => {
  switch (variant) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'destructive':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

// Export the provider for use in main.tsx
export default ToastProvider;