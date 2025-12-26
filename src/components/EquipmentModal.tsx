"use client";

import { useState, useEffect } from "react";
import { Equipment, RESPONSABLES } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Grid, Typography } from "@mui/material";

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment?: Equipment | null;
  reload: React.Dispatch<React.SetStateAction<boolean>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const API_URL = "https://script.google.com/macros/s/AKfycbxdpPxqHw4eC_pndM5exhYIGKuSSpMJ-3CdyZYS3Agge35vBF9QvvP-DGjVs-zUf1Is/exec";

const EquipmentModal = ({
  isOpen,
  reload,
  onClose,
  equipment,
  setShow,
}: EquipmentModalProps) => {
  // état unique pour le formulaire
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    utiliser: 0,
    pret: 0,
    preteur: "",
    endommagé: 0,
    totalQuantity: 0,
    responsable: RESPONSABLES[0],
  });

  const [isLoading, setIsLoading] = useState(false);

  // Calcul automatique du total
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      totalQuantity: prev.utiliser + prev.pret + prev.endommagé,
    }));
  }, [formData.utiliser, formData.pret, formData.endommagé]);

  // Pré-remplissage si modification
  useEffect(() => {
    if (equipment) {
      setFormData({
        id: equipment.id,
        name: equipment.name || "",
        utiliser: equipment.utiliser || 0,
        pret: equipment.pret || 0,
        preteur: equipment.preteur || "",
        endommagé: equipment.endommagé || 0,
        totalQuantity:
          (equipment.utiliser || 0) +
          (equipment.pret || 0) +
          (equipment.endommagé || 0),
        responsable: equipment.responsable || RESPONSABLES[0],
      });
    } else {
      resetForm();
    }
  }, [equipment, isOpen]);

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      utiliser: 0,
      preteur: "",
      pret: 0,
      endommagé: 0,
      totalQuantity: 0,
      responsable: RESPONSABLES[0],
    });
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isLoading) return;

  setIsLoading(true);
  const action = formData.id ? "update" : "add";

  try {
    // Préparer les données à envoyer
    const payload: any = { action, ...formData };
    if (action === "add") {
      delete payload.id; // ne pas envoyer l'id lors de l'ajout
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    toast({
      title: `Matériel ${action === "add" ? "ajouté" : "modifié"} avec succès`,
    });

    setShow(true);
    reload(true);
    onClose();
    resetForm();
  } catch (err) {
    console.error(err);
    toast({
      title: "Erreur",
      description: "Impossible d'enregistrer le matériel",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <Grid container justifyContent={"center"} my={2}>
            <Typography variant="h5" component="h2" fontFamily={"unset"} fontWeight={'bold'}>
              {equipment
                ? "Modifier le matériel"
                : "Ajouter un nouveau matériel"}
            </Typography >
          </Grid>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Grid container columnSpacing={4} direction={"row"}>
            <Grid container size={{ xs: 9 }} gap={1} direction={"column"} >
              <Label>Nom du matériel</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isLoading}
              />
            </Grid>
            <Grid container size={{ xs: 3 }} gap={1} direction={"column"} >
              <Label>Total</Label>
              <Input value={formData.totalQuantity} disabled />
            </Grid>
          </Grid>

          <div>
            <Label>Quantité utilisée</Label>
            <Input
              type="number"
              min={0}
              value={formData.utiliser}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  utiliser: Number(e.target.value) || 0,
                })
              }
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>Quantité endommagée</Label>
            <Input
              type="number"
              min={0}
              value={formData.endommagé}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endommagé: Number(e.target.value) || 0,
                })
              }
              disabled={isLoading}
            />
          </div>
          <Grid
            container
            columnSpacing={4}
            direction={"row"}
            justifyContent={"center"}
            alignContent={"center"}
          >
            <Grid container size={{ xs: 9 }} gap={1} direction={"column"} >
              <Label>Preteur</Label>
              <Input
                value={formData.preteur}
                onChange={(e) =>
                  setFormData({ ...formData, preteur: e.target.value })
                }
                disabled={isLoading}
              />
            </Grid>
            <Grid container size={{ xs: 3 }} gap={1} direction={"column"} >
              <Label>Qté prêt</Label>
              <Input
                type="number"
                min={0}
                value={formData.pret}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pret: Number(e.target.value) || 0,
                  })
                }
                disabled={isLoading}
              />
            </Grid>
          </Grid>

          <div>
            <Label>Responsable</Label>
            <Select
              value={formData.responsable}
              onValueChange={(val) =>
                setFormData({ ...formData, responsable: val })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un responsable" />
              </SelectTrigger>
              <SelectContent>
                {RESPONSABLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {equipment ? "Modification..." : "Ajout..."}
                </>
              ) : equipment ? (
                "Modifier"
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentModal;
