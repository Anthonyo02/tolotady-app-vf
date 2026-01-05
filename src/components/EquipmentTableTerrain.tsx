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
import { Skeleton, Typography } from "@mui/material";
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
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainItem | null>(
    null
  );
  const [viewOpen, setViewOpen] = useState(false);

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
  const normalizeMateriel = (
    m?: string | (string | { name?: string })[]
  ): string[] => {
    if (!m) return [];
    if (typeof m === "string") return m.split(",").map((s) => s.trim());
    if (Array.isArray(m))
      return m
        .map((x) => (typeof x === "string" ? x : x?.name ?? String(x)))
        .map((s) => s.trim());
    return [];
  };
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

                    {/* ✅ Tous les MenuItem sont ici */}
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTerrain(item);
                          setViewOpen(true);
                        }}
                      >
                        <Package className="mr-2 h-4 w-4" /> Voir
                      </DropdownMenuItem>

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
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTerrain(item);
                      setViewOpen(true);
                    }}
                  >
                    <Package className="mr-2 h-4 w-4" /> Voir
                  </DropdownMenuItem>

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

      <AlertDialog open={viewOpen} onOpenChange={setViewOpen}>
        <AlertDialogContent className="max-w-lg max-h-[80vh] mx-auto rounded-2xl bg-[#616637] text-white shadow-2xl overflow-auto">
          {/* HEADER */}
          <div className="p-4 border-b border-white/20">
            <Typography variant="h6" fontWeight="bold">
              Sortie terrain
            </Typography>

            <div className="mt-1 flex flex-col gap-0.5 text-white/80 text-sm">
              <span>
                {selectedTerrain && formatLongDate(selectedTerrain.date)}
              </span>
              <span className="font-medium">{selectedTerrain?.lieu}</span>
            </div>
          </div>

          {/* BODY */}
          <div className="p-4 space-y-3 text-sm">
            {/* RESPONSABLE & ÉQUIPE */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-xs text-white/70">Responsable</span>
                <Badge className="mt-1 bg-[#A6A867] text-white block w-fit text-xs px-2 py-0.5">
                  {selectedTerrain?.responsable}
                </Badge>
              </div>

              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-xs text-white/70">Équipe</span>
                <Badge className="mt-1 bg-[#706639] text-white block w-fit text-xs px-2 py-0.5">
                  {selectedTerrain?.equipe}
                </Badge>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-xs font-semibold text-white/80">
                Description
              </span>
              <p className="mt-1 leading-relaxed">
                {selectedTerrain?.description}
              </p>
            </div>

            {/* MATÉRIELS */}
            <div>
              <span className="text-xs font-semibold text-white/80">
                Matériels utilisés
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(() => {
                  const items = normalizeMateriel(selectedTerrain?.materiel);
                  if (items.length === 0) return "-";

                  return items.map((raw, i) => {
                    const clean = raw
                      .replace(/id\([0-9]+\)\s*;\s*/g, "")
                      .trim();
                    return (
                      <Badge
                        key={i}
                        className="bg-[#F0E68C] text-gray-900 rounded-full px-2 py-0.5 text-xs"
                      >
                        {clean}
                      </Badge>
                    );
                  });
                })()}
              </div>
            </div>

            {/* REMARQUE */}
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-xs font-semibold text-white/80">
                Remarque
              </span>
              <p className="mt-1 text-white/70">
                {selectedTerrain?.remarque || "-"}
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-white/20 flex justify-end">
            <Button
              onClick={() => setViewOpen(false)}
              className="bg-[#A6A867] hover:bg-[#8f9256] text-white px-6 py-1.5 rounded-full text-sm"
            >
              Fermer
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
