import { Grid } from "@mui/material";
import React, { useEffect } from "react";

interface ToastSuccessProps {
  message: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  duration?: number;
}

export const ToastSuccess: React.FC<ToastSuccessProps> = ({
  message,
  show,
  setShow,
  duration = 5000,
}) => {
  // ⏱ fermeture automatique
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration]);

  if (!show) return null;

  return (
    <Grid
      container
      justifyContent="flex-end"
      position="fixed"
      bottom={20}
      right={40}
      zIndex={1300}
    >
      <div className="bg-transparent border border-green-500 text-green-600 px-4 py-3 rounded-lg shadow-md flex items-center gap-2 transition-opacity duration-300 ease-in-out">
        <span>{message}</span>

        <button
          onClick={() => setShow(false)}
          className="ml-2 font-bold text-lg hover:text-green-800"
        >
          ×
        </button>
      </div>
    </Grid>
  );
};
