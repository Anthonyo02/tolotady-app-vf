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
import { TerrainItem } from "@/types/inventory";
import { set } from "date-fns";

const API_URL =
  "https://script.google.com/macros/s/AKfycbw6lWC7cRT6C-a65sf5Mb-XCKUsqWCdqdZeymX0ZrNPfaAoIcyfaJWhe0MgbFzcjBiz7w/exec";

const RESPONSABLES = ["Miary", "Dio", "Aina", "Anthonyo"];
const EQUIPES = ["Miary", "Dio", "Aina", "Anthonyo"];

interface Materiel {
  utiliser: number;
  name: string;
  id: number;
}

interface EquipmentModalTerrain {
  reLoad: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  onClose: () => void;
  equipement: any;
  local: any;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  idEditTerrain: TerrainItem | null;
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

export default function EquipmentModalTerrain({
  open,
  onClose,
  setShow,
  local,
  reLoad,
  idEditTerrain,
}: EquipmentModalTerrain) {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ id: number; name: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [checkedMaterielIds, setCheckedMaterielIds] = useState<number[]>([]);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("materiels");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);
  const autoCheckMateriel = (ids: number[]) => {
    if (!local.length) return;

    const autoChecked = local
      .filter((m) => ids.includes(m.id))
      .map((m) => {
        const edited = form.materiel.find((e) => e.id === m.id);

        return {
          id: m.id,
          name: m.name,
          utiliser: edited?.utiliser ?? 1, // 👈 priorité aux données modifiées
        };
      });

    setForm((prev) => ({
      ...prev,
      materiel: autoChecked,
    }));
  };

  useEffect(() => {
    if (checkedMaterielIds.length > 0) {
      autoCheckMateriel(checkedMaterielIds);
    }
  }, [checkedMaterielIds, local]);

  const resetForm = () => {
    setForm({
      date: "",
      lieu: "",
      description: "",
      responsable: "",
      equipe: [],
      materiel: [],
      remarque: "",
      statut: "En attente",
    });
    setEditId(null);
    setSubmitted(false);
    localStorage.removeItem("inventaire_form");
  };
  const formatForInput = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return ""; // sécuriser
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [formData, setFormData] = useState({
    date: "",
    lieu: "",
    description: "",
    responsable: "",
    equipe: [] as string[],
    materiel: [] as any[],
    remarque: "",
    statut: "En attente",
  });

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data: Materiel[]) => setMateriels(data))
      .catch(console.error);
  }, []);

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("inventaire_form");
    return saved
      ? JSON.parse(saved)
      : {
          date: "",
          lieu: "",
          description: "",
          responsable: "",
          equipe: [],
          materiel: [],
          remarque: "",
          statut: "En attente",
        };
  });
  const [editId, setEditId] = useState(null);

  const formatDateWithTime = (date) => {
    const d = new Date(date);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const save = async () => {
    setSubmitted(true);

    if (!isFormValid) {
      setGo(false);
      return;
    }

    try {
      setGo(true);

      const payload = {
        action: editId === null ? "add" : "update",
        ...(editId !== null && { id: editId }),
        ...form,
        materiel: form.materiel.map(
          (m) => `id(${m.id}) ; ${m.name} ; (${m.utiliser})`
        ),
        date: formatDateWithTime(form.date),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload), // 👈 PAS DE headers
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!data.success) throw new Error(data.error || "Erreur inconnue");

      setForm({
        date: "",
        lieu: "",
        description: "",
        responsable: "",
        equipe: [],
        materiel: [],
        remarque: "",
        statut: "En attente",
      });

      setShow(true);
      reLoad(false);
      onClose();
      setEditId(null);
      localStorage.removeItem("inventaire_form");
    } catch (err: any) {
      console.error(err);
      alert("Erreur save : " + err.message);
    } finally {
      setGo(false);
      setSubmitted(false);
    }
  };
  const parseMaterielString = (str: string) => {
    if (!str) return [];

    return str
      .split(",")
      .map((item) => {
        const match = item.match(/id\((\d+)\)\s*;\s*(.*?)\s*;\s*\((\d+)\)/);

        if (!match) return null;

        return {
          id: Number(match[1]),
          name: match[2],
          utiliser: Number(match[3]),
        };
      })
      .filter(Boolean);
  };

  useEffect(() => {
    if (idEditTerrain) {
      setEditId(idEditTerrain.id);

      // Si c'est une chaîne séparée par "," on split correctement
      const equipeArray = Array.isArray(idEditTerrain.equipe)
        ? idEditTerrain.equipe.filter(Boolean)
        : typeof idEditTerrain.equipe === "string"
        ? idEditTerrain.equipe
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean) // 👈 supprime "" et null
        : [];
      const parsedMateriel =
        typeof idEditTerrain.materiel === "string"
          ? parseMaterielString(idEditTerrain.materiel)
          : [];

      const materielIds = parsedMateriel.map((m) => m.id);
      setCheckedMaterielIds(materielIds);
      setForm({
        date: formatForInput(idEditTerrain.date),
        lieu: idEditTerrain.lieu,
        description: idEditTerrain.description,
        responsable: idEditTerrain.responsable,
        equipe: equipeArray,
        materiel: parsedMateriel,
        remarque: idEditTerrain.remarque || "",
        statut: idEditTerrain.statut || "En attente",
      });
    } else {
      resetForm();
    }
  }, [open]);
  const getUtiliser = (name: string) => {
    const found = form.materiel.find((m) => m.name === name);
    return found ? found.utiliser : 1;
  };
  const isFormValid =
    form.date &&
    form.lieu.trim() !== "" &&
    form.responsable.trim() !== "" &&
    form.materiel.length > 0;

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
        PaperProps={{
          sx: {
            backgroundColor: "#0f1218",
            borderRadius: 4,
            boxShadow: "none",
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
            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                required
                error={submitted && !form.date}
                helperText={submitted && !form.date ? "Date obligatoire" : ""}
                size="small"
                label="Date et heure"
                type="datetime-local"
                fullWidth
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                sx={darkField}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().slice(0, 16),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                required
                error={submitted && !form.lieu}
                helperText={submitted && !form.lieu ? "Lieu obligatoire" : ""}
                size="small"
                label="Lieu"
                fullWidth
                value={form.lieu}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                sx={darkField}
              />
            </Grid>
            <Grid container direction={"row"} size={{ xs: 12 }}>
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
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    sx={darkField}
                  />
                </Grid>
              </Grid>{" "}
              <Grid container direction={"column"} size={{ xs: 12, sm: 6 }}>
                <Grid container>
                  <TextField
                    required
                    error={submitted && !form.responsable}
                    helperText={
                      submitted && !form.responsable
                        ? "Responsable obligatoire"
                        : ""
                    }
                    size="small"
                    select
                    label="Responsable"
                    fullWidth
                    value={form.responsable}
                    onChange={(e) =>
                      setForm({ ...form, responsable: e.target.value })
                    }
                    SelectProps={{
                      MenuProps: {
                        disablePortal: true,
                        onClick: () => {},
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
            <Grid container size={{ xs: 12 }}>
              <Autocomplete
                fullWidth
                size="small"
                multiple
                disablePortal
                disableCloseOnSelect
                options={EQUIPES}
                 value={form.equipe.filter(Boolean)} 
                onChange={(e, v) => setForm({ ...form,  equipe: v.filter(Boolean)})}
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
                    placement: "bottom-start", // 👈 toujours en bas
                    modifiers: [
                      {
                        name: "flip",
                        enabled: false, // 👈 empêche le passage en haut
                      },
                      {
                        name: "preventOverflow",
                        enabled: false, // optionnel
                      },
                    ],
                    sx: {
                      "& .MuiAutocomplete-listbox": {
                        maxHeight: 120, // 👈 hauteur fixe
                        overflowY: "auto",
                      },
                    },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                fullWidth
                size="small"
                multiple
                disablePortal
                disableCloseOnSelect
                options={local}
                value={local.filter((m) =>
                  form.materiel.some((e) => e.name === m.name)
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(o) => `${o.name} (${getUtiliser(o.name)})`}
                onChange={(e, v) => {
                  const newMateriel = v.map((m) => {
                    const exist = form.materiel.find((e) => e.name === m.name);
                    return {
                      id: m.id,
                      name: m.name,
                      utiliser: exist ? exist.utiliser : 1,
                    };
                  });
                  // const materielStrings = form.materiel.map(
                  //   (m: any) => `${m.name} (${m.utiliser})`
                  // );
                  // // console.log("materiel sélectionné :", materielStrings);

                  setForm({ ...form, materiel: newMateriel });
                }}
                slotProps={{
                  popper: {
                    placement: "bottom-start", // 👈 toujours en bas
                    modifiers: [
                      {
                        name: "flip",
                        enabled: false, // 👈 empêche le passage en haut
                      },
                      {
                        name: "preventOverflow",
                        enabled: false, // optionnel
                      },
                    ],
                    sx: {
                      "& .MuiAutocomplete-listbox": {
                        maxHeight: 120, // 👈 hauteur fixe
                        overflowY: "auto",
                      },
                    },
                  },
                }}
                renderOption={(props, option, { selected }) => {
                  const current = getUtiliser(option.name);
                  const max = option.utiliser;
                  const showControls = max > 1;
                  return (
                    <li
                      {...props}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Checkbox checked={selected} />

                      <Typography sx={{ flexGrow: 1 }}>
                        {option.name} ({current})
                      </Typography>

                      {selected && showControls && (
                        <div style={{ display: "flex", gap: 4 }}>
                          {/* ➖ */}
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={current <= 1}
                            sx={{
                              minWidth: 28,
                              height: 28,
                              borderRadius: "50%",
                              padding: 0,
                              borderColor: "#616637",
                              color: "#fff",
                              "&:disabled": {
                                opacity: 0.3,
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm((prev) => ({
                                ...prev,
                                materiel: prev.materiel.map((m) =>
                                  m.name === option.name
                                    ? {
                                        ...m,
                                        utiliser: Math.max(1, m.utiliser - 1),
                                      }
                                    : m
                                ),
                              }));
                            }}
                          >
                            –
                          </Button>

                          {/* ➕ */}
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={current >= max}
                            sx={{
                              minWidth: 28,
                              height: 28,
                              borderRadius: "50%",
                              padding: 0,
                              borderColor: "#616637",
                              color: "#fff",
                              "&:disabled": {
                                opacity: 0.3,
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm((prev) => ({
                                ...prev,
                                materiel: prev.materiel.map((m) =>
                                  m.name === option.name
                                    ? {
                                        ...m,
                                        utiliser: Math.min(max, m.utiliser + 1),
                                      }
                                    : m
                                ),
                              }));
                            }}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={submitted && form.materiel.length === 0}
                    helperText={
                      submitted && form.materiel.length === 0
                        ? "Au moins un équipement requis"
                        : ""
                    }
                    label="Équipements"
                    sx={darkField}
                  />
                )}
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
                value={form.remarque}
                onChange={(e) => setForm({ ...form, remarque: e.target.value })}
                sx={darkField}
              />
            </Grid>

            {/* Boutons */}
            <Grid size={{ xs: 12 }} container justifyContent="flex-end">
              {idEditTerrain === null ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    save();
                    setGo(true);
                  }}
                  // disabled={loading}
                  sx={{
                    bgcolor: "#616637",
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "#50542a",
                    },
                    "&:disabled": {
                      bgcolor: "#444",
                      color: "#999",
                    },
                  }}
                >
                  {go ? (
                    <>
                      <CircularProgress
                        size={18}
                        sx={{ color: "#fff", mr: 1 }}
                      />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => {
                    save();
                    setGo(true);
                  }}
                  // disabled={loading}
                  sx={{
                    bgcolor: "#616637",
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "#50542a",
                    },
                    "&:disabled": {
                      bgcolor: "#444",
                      color: "#999",
                    },
                  }}
                >
                  {go ? (
                    <>
                      <CircularProgress
                        size={18}
                        sx={{ color: "#fff", mr: 1 }}
                      />
                      Modification...
                    </>
                  ) : (
                    "Modifier"
                  )}
                </Button>
              )}
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
