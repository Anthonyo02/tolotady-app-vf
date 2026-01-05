"use client";

import { useState, useMemo } from "react";
import { MoreHorizontal, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@mui/material";
import { TerrainItem } from "@/types/inventory";
import TerrainSearchBar from "./TerrainSearchBar";

// ✅ constantes fixes
const RESPONSABLES = ["Miary", "Dio", "Aina", "Anthonyo"];
const EQUIPES = ["Miary", "Dio", "Aina", "Anthonyo"];

interface Props {
  show: boolean;
  data: TerrainItem[];
  reload: () => void;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  onEditTerrain: (item: TerrainItem) => void;
}

const TERRAIN_URL =
  "https://script.google.com/macros/s/AKfycbw6lWC7cRT6C-a65sf5Mb-XCKUsqWCdqdZeymX0ZrNPfaAoIcyfaJWhe0MgbFzcjBiz7w/exec";

export default function EquipmentTableTerrain({
  data,
  reload,
  setShow,
  show,
  onEditTerrain,
}: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [responsableFilter, setResponsableFilter] = useState("all");
  const [equipeFilter, setEquipeFilter] = useState("all");
  const [sortDate, setSortDate] = useState<"recent" | "ancien">("recent");

  // helper pour string | string[] → string[]
  const toStringArray = (value?: string | string[]): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  // filtre + tri
  const filteredData = useMemo(() => {
    return (
      [...data]
        // 🔍 recherche texte
        .filter((item) => {
          const q = searchTerm.toLowerCase();
          const lieu = item.lieu?.toLowerCase() ?? "";
          const responsable = toStringArray(item.responsable)
            .join(",")
            .toLowerCase();
          const equipe = toStringArray(item.equipe).join(",").toLowerCase();
          return (
            lieu.includes(q) || responsable.includes(q) || equipe.includes(q)
          );
        })
        // 👤 responsable
        .filter((item) =>
          responsableFilter === "all"
            ? true
            : toStringArray(item.responsable).includes(responsableFilter)
        )
        // 👥 équipe
        .filter((item) =>
          equipeFilter === "all"
            ? true
            : toStringArray(item.equipe).includes(equipeFilter)
        )
        // 📅 tri date ancien / récent
        .sort((a, b) => {
          const da = new Date(a.date).getTime();
          const db = new Date(b.date).getTime();
          return sortDate === "recent" ? db - da : da - db;
        })
    );
  }, [data, searchTerm, responsableFilter, equipeFilter, sortDate]);

  const remove = async (id: any) => {
    try {
      const res = await fetch(TERRAIN_URL, {
        method: "POST",
        body: JSON.stringify({ action: "delete", id }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setLoad(false);
      setIsOpen(false);
      setDeleteId(null);
      reload();
      setShow(true);
    } catch (err) {
      console.error(err);
    }
  };

  const formatShortDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return (
      date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " à " +
      date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const formatLongDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return (
      date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }) +
      " à " +
      date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (!loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <Package className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">Aucune sortie terrain trouvée</p>
        <p className="text-sm">Ajoutez votre première sortie</p>
      </div>
    );
  }

  return (
    <>
      {/* Search + filtres */}
      <TerrainSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        responsableFilter={responsableFilter}
        onResponsableChange={setResponsableFilter}
        equipeFilter={equipeFilter}
        onEquipeChange={setEquipeFilter}
        sortDate={sortDate}
        onSortDateChange={setSortDate}
        responsables={RESPONSABLES}
        equipes={EQUIPES}
        onReset={() => {
          setSearchTerm("");
          setResponsableFilter("all");
          setEquipeFilter("all");
          setSortDate("recent");
        }}
      />

      {/* Desktop */}
      <div className="hidden md:block rounded-xl border bg-card shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {show && loading && (
              <TableRow>
                <TableCell colSpan={10}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            )}

            {filteredData.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell>
                  <span title={formatLongDate(item.date)}>
                    {formatShortDate(item.date)}
                  </span>
                </TableCell>
                <TableCell>{item.lieu}</TableCell>
                <TableCell>
                  <Badge variant="responsable">{item.responsable}</Badge>
                </TableCell>
                <TableCell>{item.equipe}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={!navigator.onLine}
                        className={`transition-colors duration-300 ${
                          navigator.onLine
                            ? "hover:bg-gray-100"
                            : "cursor-not-allowed hover:bg-transparent opacity-50"
                        }`}
                        title={!navigator.onLine ? "Hors ligne" : ""}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          onEditTerrain(item);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setDeleteId(item.id);
                          setIsOpen(true);
                        }}
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

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border bg-card p-4 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-muted-foreground text-white/80">
                  {formatShortDate(item.date)}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {formatLongDate(item.date)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditTerrain(item)}>
                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setDeleteId(item.id);
                      setIsOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">
                  Lieu:{" "}
                </span>
                <span>{item.lieu}</span>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-medium" style={{ color: "#616637" }}>
                  Responsable:
                </span>
                <Badge
                  className="text-white"
                  style={{ backgroundColor: "#A6A867" }}
                >
                  {item.responsable}
                </Badge>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-medium" style={{ color: "#616637" }}>
                  Équipe:
                </span>
                <Badge
                  className="text-white"
                  style={{ backgroundColor: "#706639" }}
                >
                  {item.equipe}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      <AlertDialog open={isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                remove(deleteId);
                setLoad(true);
              }}
              disabled={load}
              className="bg-destructive text-destructive-foreground"
            >
              {load ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
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
