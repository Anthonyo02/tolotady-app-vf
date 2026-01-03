import splashAnimation from "@/images/logo.png";
import { useEffect, useState } from "react";

type Props = {
  onFinish: () => void;
};

export default function Splash({ onFinish }: Props) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Déclenche la disparition après 3s
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    // Supprime complètement le splash
    const endTimer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(endTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <img
        src={splashAnimation}
        alt="Splash"
        style={{
          width: "20px",
          maxWidth: "60%",
          height: "auto",
          objectFit: "contain",

          /* 🎬 Animations */
          animation: fadeOut
            ? "none"
            : "rotate 4s linear infinite, pulse 1.5s ease-in-out infinite",
          transform: fadeOut ? "scale(0.85)" : "scale(1)",
          transition: "transform 0.5s ease-in-out",
        }}
      />

      <style>
        {`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.06); }
            100% { transform: scale(0.8); }
          }
        `}
      </style>
    </div>
  );
}
