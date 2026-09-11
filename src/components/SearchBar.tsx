import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
};

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search medicines, molecules or guidelines…",
  buttonLabel = "Search",
  className,
}: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value ?? "");
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft",
        className,
      )}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" className="h-11 shrink-0 px-5">
        {buttonLabel}
      </Button>
    </form>
  );
}
