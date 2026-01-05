import { Search, Filter, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TerrainSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  responsableFilter: string;
  onResponsableChange: (value: string) => void;
  equipeFilter: string;
  onEquipeChange: (value: string) => void;
  sortDate: "recent" | "ancien";
  onSortDateChange: (value: "recent" | "ancien") => void;
  responsables: string[];
  equipes: string[];
  onReset?: () => void; // fonction optionnelle pour le bouton reset
}

export default function TerrainSearchBar({
  searchTerm,
  onSearchChange,
  responsableFilter,
  onResponsableChange,
  equipeFilter,
  onEquipeChange,
  sortDate,
  onSortDateChange,
  responsables,
  equipes,
  onReset,
}: TerrainSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in items-start sm:items-center">
      {/* Recherche */}
      <div className="relative flex-1 w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full sm:w-[250px] bg-secondary border-border focus:ring-primary"
        />
      </div>

      {/* Responsable */}
      <Select value={responsableFilter} onValueChange={onResponsableChange}>
        <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border">
          <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Responsable" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">Tous les responsables</SelectItem>
          {responsables.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Équipe */}
      <Select value={equipeFilter} onValueChange={onEquipeChange}>
        <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border">
          <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Équipe" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">Toutes les équipes</SelectItem>
          {equipes.map((e) => (
            <SelectItem key={e} value={e}>
              {e}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tri date */}
      <Select value={sortDate} onValueChange={(v) => onSortDateChange(v as "recent" | "ancien")}>
        <SelectTrigger className="w-full sm:w-[140px] bg-secondary border-border">
          <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Trier par date" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="recent">Plus récent</SelectItem>
          <SelectItem value="ancien">Plus ancien</SelectItem>
        </SelectContent>
      </Select>

      {/* Bouton Réinitialiser */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="flex items-center gap-2 w-full sm:w-auto"
      >
        <RefreshCw className="h-4 w-4" /> Réinitialiser
      </Button>
    </div>
  );
}
