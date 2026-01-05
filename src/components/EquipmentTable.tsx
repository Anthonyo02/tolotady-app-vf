"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Equipment } from "@/types/inventory";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Grid, Skeleton } from "@mui/material";

interface Props {
  show: boolean;
  equipment: Equipment[];
  reload: React.Dispatch<React.SetStateAction<boolean>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  onEdit: (item: Equipment) => void;
}

const API_URL =
  "https://script.google.com/macros/s/AKfycbw6lWC7cRT6C-a65sf5Mb-XCKUsqWCdqdZeymX0ZrNPfaAoIcyfaJWhe0MgbFzcjBiz7w/exec";

export default function EquipmentTable({
  equipment,
  reload,
  setShow,
  show,
  onEdit,
}: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // =========================
  // Fetch
  // =========================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      localStorage.setItem("equipment", JSON.stringify(data));
    } catch {
      console.warn("Mode offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // Delete
  // =========================
  const deleteItem = async () => {
    if (!deleteId || isDeleting) return;

    setIsDeleting(true);

    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors", // 👈 important
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          id: deleteId,
        }),
      });

      setDeleteId(null);
      setShow(true);
      reload(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================
  // Empty state
  // =========================
  if (!loading && equipment.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <Package className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">Aucun matériel trouvé</p>
        <p className="text-sm">Ajoutez votre premier équipement</p>
      </div>
    );
  }

  return (
    <>
      {/* ========================= DESKTOP TABLE ========================= */}
      <div className="hidden md:block rounded-xl border bg-card shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matériel</TableHead>
              <TableHead className="text-center">Qté</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {show && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            )}

            {equipment.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell className="font-medium">{item.name}</TableCell>

                <TableCell className="text-center">
                  <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-secondary font-semibold">
                    {item.totalQuantity}
                  </span>
                </TableCell>

                <TableCell>
                  <Grid container spacing={1} >
                    {item.utiliser !== 0 && (
                      <Grid size={{ xs: 12, md: 4}}>
                        <Badge
                          className="w-full h-10 justify-center"
                          variant="noentina"
                        >
                          Utilisé {item.utiliser}
                        </Badge>
                      </Grid>
                    )}

                    {item.pret !== 0 && (
                      <Grid size={{ xs: 12, md: 4}}>
                        <Badge
                          className="w-full h-10 justify-center"
                          variant="nampindramina"
                        >
                          Prêt {item.pret}
                        </Badge>
                      </Grid>
                    )}

                    {item.endommagé !== 0 && (
                      <Grid size={{ xs: 12, md: 4}}>
                        <Badge
                          className="w-full h-10 justify-center"
                          variant="destructive"
                        >
                          Endommagé {item.endommagé}
                        </Badge>
                      </Grid>
                    )}
                  </Grid>
                </TableCell>

                <TableCell>
                  <Badge variant="responsable">{item.responsable}</Badge>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={!navigator.onLine}
                        className={`
    transition-colors duration-300
    ${
      navigator.onLine
        ? "hover:bg-gray-100" // couleur hover normale
        : "cursor-not-allowed hover:bg-transparent opacity-50"
    }
  `}
                        title={!navigator.onLine ? "Vous êtes hors ligne" : ""}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" /> Modifier
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ========================= MOBILE CARDS ========================= */}
      <div className="md:hidden space-y-4">
        {equipment.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border bg-card p-4 shadow space-y-3"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold " style={{ fontSize: "25px" }}>
                {item.name}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="mr-2 mt-2 h-4 w-4" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge className="py-2" variant="secondary">
                Qté {item.totalQuantity}
              </Badge>
              <Badge className="py-2" variant="responsable">
                {item.responsable}
              </Badge>
            </div>

            <div className="space-y-2" >
              {item.utiliser !== 0 && (
                <Badge
                  className="w-full justify-center py-2"
                  variant="noentina"
                >
                  Utilisé {item.utiliser}
                </Badge>
              )}
              {item.pret !== 0 && (
                <Badge
                  className="w-full justify-center py-2"
                  variant="nampindramina"
                >
                  Prêt {item.pret}
                </Badge>
              )}
              {item.endommagé !== 0 && (
                <Badge
                  className="w-full justify-center py-2"
                  variant="destructive"
                >
                  Endommagé {item.endommagé}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ========================= DELETE MODAL ========================= */}
      <AlertDialog open={!!deleteId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Annuler
            </Button>

            <Button
              onClick={deleteItem}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
