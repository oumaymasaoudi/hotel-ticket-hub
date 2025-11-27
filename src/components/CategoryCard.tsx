import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  color: string;
  selected?: boolean;
  onClick: () => void;
}

export const CategoryCard = ({ icon: Icon, name, color, selected, onClick }: CategoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative p-6 rounded-lg border-2 transition-all duration-200",
        "hover:shadow-lg hover:scale-105 bg-card",
        selected
          ? "border-primary shadow-md scale-105"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
            selected ? `bg-primary` : `bg-${color}-100 group-hover:bg-${color}-200`
          )}
        >
          <Icon className={cn("h-6 w-6", selected ? "text-primary-foreground" : `text-${color}-600`)} />
        </div>
        <span className={cn(
          "text-sm font-medium text-center",
          selected ? "text-primary" : "text-card-foreground"
        )}>
          {name}
        </span>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 h-3 w-3 bg-primary rounded-full" />
      )}
    </button>
  );
};
