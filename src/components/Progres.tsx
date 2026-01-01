import React from "react";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { Grid } from "@mui/material";

interface ProgresProps {
  show: boolean;
}

export default function Progres({ show }: ProgresProps) {
  if (!show) return null; // ne rien afficher si show = false

  return (
    <Grid
      container
      position="fixed"
      top={0}
      left={0}
      height="100vh"
      width="100%"
      justifyContent="center"
      alignItems="center"
      zIndex={100}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <Stack spacing={2} direction="row">
        <CircularProgress color="success" size={48} />
      </Stack>
    </Grid>
  );
}
