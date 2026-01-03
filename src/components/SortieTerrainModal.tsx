"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Autocomplete,
  Checkbox,
  ThemeProvider,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";

const API_URL =
  "https://script.google.com/macros/s/AKfycbwEWg03CAvuLGcGnRyWAv-NhnpbM15NXTcewv80MJBid5YxtQ3O2gMtQUhjN9td4_k0WQ/exec";

const RESPONSABLES = ["Miary", "Dio", "Aina", "Anthonyo"];
const EQUIPES = ["Miary", "Dio", "Aina", "Anthonyo"];

interface Materiel {
  id: number;
  name: string;
}

interface SortieTerrainModalProps {
  open: boolean;
  onClose: () => void;
  stock: any[];
   setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      paper: "#0f1218",
    },
    primary: {
      main: "#f9a825",
    },
  },
});

// type MaterielInLocal = {
//   id: number;
//   name: string;
//   totalQuantity: number;
//   utiliser: number;
//   preteur: string;
//   pret: number;
//   endommagé: number;
//   responsable: string;
// };

export default function SortieTerrainModal({
  open,
  onClose,
  stock,
  setShow,
}: SortieTerrainModalProps) {
  // const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   console.log("📝 State materiels mis à jour :", materiels);
  // }, [materiels]);

  const [formData, setFormData] = useState({
    date: "",
    lieu: "",
    description: "",
    responsable: "",
    equipe: [] as string[],
    equipements: [] as number[],
    remarque: "RAS",
    statut: "En attente",
  });

  // useEffect(() => {
  //   fetch(API_URL)
  //     .then((res) => res.json())
  //     .then((data: Materiel[]) => {
  //       console.log("📦 Données reçues depuis l'API :", data);
  //       setMateriels(data);
  //     })
  //     .catch((error) => {
  //       console.error("❌ Erreur fetch :", error);
  //     });
  // }, []);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    const payload = {
      ...formData,
    };

    console.log("📤 Données envoyées à l’API :", payload);
    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addSortieTerrain",
          ...formData,
        }),
      });
      setShow(true)
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
        // maxWidth="md"
        // fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#0f1218",
            borderRadius: 4, // ✅ ICI
            boxShadow: "none", // optionnel
          },
        }}
      >
        <DialogContent
          className="bg-card max-w-md"
          sx={{ border: "solid 1px #2c2c2cff", borderRadius: 4 }}
        >
          <Grid container justifyContent="center" my={2}>
            <Typography variant="h5" fontWeight="bold">
              Nouvelle sortie terrain
            </Typography>
          </Grid>

          <Grid container spacing={3}>
            {/* Date */}
            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                size="small"
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                sx={darkField}
              />
            </Grid>

            {/* Lieu */}
            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                size="small"
                label="Lieu"
                fullWidth
                value={formData.lieu}
                onChange={(e) =>
                  setFormData({ ...formData, lieu: e.target.value })
                }
                sx={darkField}
              />
            </Grid>
            <Grid
              container
              //   direction={{ xs: "column", sm: "row" }}
              direction={"row"}
              size={{ xs: 12 }}
            >
              {" "}
              <Grid container size={{ xs: 12, sm: 6 }}>
                {" "}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    size="small"
                    label="Description"
                    fullWidth
                    multiline
                    rows={1}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    sx={darkField}
                  />
                </Grid>
              </Grid>{" "}
              <Grid container direction={"column"} size={{ xs: 12, sm: 6 }}>
                <Grid container>
                  <TextField
                    size="small"
                    select
                    label="Responsable"
                    fullWidth
                    value={formData.responsable}
                    onChange={(e) =>
                      setFormData({ ...formData, responsable: e.target.value })
                    }
                    SelectProps={{
                      MenuProps: {
                        disablePortal: true, // 👈 FIX PRINCIPAL
                        onClick: () => {}, // 👈 force la fermeture
                      },
                    }}
                    sx={darkField}
                  >
                    {RESPONSABLES.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
            {/* Description */}
            {/* Équipe */}
            <Grid container size={{ xs: 12 }}>
              <Autocomplete
                fullWidth
                size="small"
                multiple
                disablePortal // mba tsy miala amin'ny DOM parent
                disableCloseOnSelect
                options={EQUIPES}
                value={formData.equipe}
                onChange={(e, v) => setFormData({ ...formData, equipe: v })}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox checked={selected} sx={{ color: "#fff" }} />
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Équipes" sx={darkField} />
                )}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "flip", // disable flipping
                        enabled: false,
                      },
                    ],
                  },
                }}
              />
            </Grid>
            {/* Responsable */}

            {/* Matériels */}
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                fullWidth
                size="small"
                multiple
                disablePortal
                disableCloseOnSelect
                options={stock}
                getOptionLabel={(option) => option.name}
                value={stock.filter((m) => formData.equipements.includes(m.id))}
                onChange={(e, v) =>
                  setFormData({ ...formData, equipements: v.map((m) => m.id) })
                }
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox checked={selected} sx={{ color: "#fff" }} />
                    {option.name}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Équipements"
                    size="small"
                    sx={darkField}
                  />
                )}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "flip",
                        enabled: false, // dropdown en bas toujours
                      },
                    ],
                  },
                  paper: {
                    sx: {
                      maxHeight: 300, // limite la hauteur
                      overflowY: "auto", // active le scroll vertical
                      bgcolor: "#111318", // fond sombre
                      "& ul": {
                        // pour le Listbox interne
                        padding: 0,
                        margin: 0,
                      },
                    },
                  },
                }}
              />
            </Grid>

            {/* Remarque */}
            <Grid size={{ xs: 12 }}>
              <TextField
                size="small"
                label="Remarque"
                multiline
                rows={1}
                fullWidth
                value={formData.remarque}
                onChange={(e) =>
                  setFormData({ ...formData, remarque: e.target.value })
                }
                sx={darkField}
              />
            </Grid>

            {/* Boutons */}
            <Grid size={{ xs: 12 }} container justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : null
                }
                sx={{
                  bgcolor: "#616637", // couleur de fond
                  color: "#fff", // texte blanc
                  "&:hover": {
                    bgcolor: "#50542a", // couleur hover un peu plus foncée
                  },
                }}
              >
                Enregistrer
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

/* 🎨 STYLE TextField sombre + icône date blanche */
const darkField = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#111318",
    color: "#fff",
    "& fieldset": {
      borderColor: "grey",
    },
    "&:hover fieldset": {
      borderColor: "#616637",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#fff",
  },
  "& input::-webkit-calendar-picker-indicator": {
    filter: "invert(1)", // 👈 icône calendrier blanche
  },
};
