import React, { useEffect, useState } from "react";

interface ToastSuccessProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export const ToastSuccess: React.FC<ToastSuccessProps> = ({
  message,
  onClose,
  duration = 5000,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!onClose) return;

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // attendre la fin de l'animation avant fermeture
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded shadow-lg flex items-center gap-2 transition-opacity duration-300 ease-in-out">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 font-bold text-lg hover:text-green-200"
        >
          ×
        </button>
      )}
    </div>
  );
};
