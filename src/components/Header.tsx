import { useEffect, useState } from "react";
import logo from "../images/logo2.png";
import { Grid, Typography, Box } from "@mui/material";
import { colors } from "@/theme/colors";
import cam from "../images/birdcam.gif";
import { WifiOffIcon } from "lucide-react";

/* ===== Déclaration de WifiBars AVANT Header ===== */
const WifiBars = ({ level }: { level: 1 | 2 | 3 | 4 }) => {
  const colorMap = {
    1: "#d32f2f", // rouge
    2: "#ed6c02", // orange
    3: "#fbc02d", // jaune
    4: "#2e7d32", // vert
  };

  return (
    <Box display="flex" alignItems="flex-end" gap={0.4}>
      {[1, 2, 3, 4].map((bar) => (
        <Box
          key={bar}
          sx={{
            width: 3,
            height: bar * 3,
            borderRadius: 1,
            backgroundColor:
              bar <= level ? colorMap[level] : "rgba(255,255,255,0.25)",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </Box>
  );
};

/* ===== Header ===== */
const Header = () =>{
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      {/* Bandeau connexion */}

      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-white flex items-center justify-center shadow-glow">
              <img src={logo} alt="logo" style={{ borderRadius: 10 }} />
            </div>

            <div>
              <Typography
                variant="h5"
                fontWeight="bold"
                fontSize={30}
                color={colors.primary}
              >
                TOLO TADY
              </Typography>

              <p className="text-xs text-muted-foreground tracking-widest uppercase">
                Gestion d'inventaire
              </p>
            </div>
          </div>

          <Box width={80}>
            <img src={cam} alt="caméra" className="-scale-x-100" />
          </Box>
        </div>
      </div>
    </header>
  );
};

export default Header;
