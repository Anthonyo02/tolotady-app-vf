import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RESPONSABLES } from "@/types/inventory";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  responsableFilter: string;
  onResponsableChange: (value: string) => void;
}

const SearchBar = ({
  searchTerm,
  onSearchChange,
  responsableFilter,
  onResponsableChange,
}: SearchBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un matériel..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-secondary border-border focus:ring-primary"
        />
      </div>
      <div className="flex gap-3">
        <Select value={responsableFilter} onValueChange={onResponsableChange}>
          <SelectTrigger className="w-[180px] bg-secondary border-border">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Responsable" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Tous les responsables</SelectItem>
            {RESPONSABLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchBar;
