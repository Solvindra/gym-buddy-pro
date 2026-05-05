import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Combobox({ options, value, onChange, placeholder = "Search...", disabled = false }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleSelect = (opt: string) => {
    onChange(opt);
    setQuery(opt);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    if (e.target.value === "") onChange("");
  };

  const handleFocus = () => {
    if (!disabled) {
      setOpen(true);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={disabled ? "Select state first" : placeholder}
          disabled={disabled}
          className="pr-8"
          autoComplete="off"
        />
        <ChevronDown
          className={cn(
            "absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-transform",
            open && "rotate-180"
          )}
        />
      </div>

      {open && !disabled && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border rounded-xl shadow-xl overflow-hidden">
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.map((opt) => (
              <li
                key={opt}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors",
                  value === opt && "bg-primary/5 text-primary font-medium"
                )}
              >
                {value === opt && <Check className="h-3.5 w-3.5 shrink-0" />}
                <span className={value === opt ? "" : "pl-[1.375rem]"}>{opt}</span>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">No results</div>
          )}
        </div>
      )}

      {open && !disabled && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border rounded-xl shadow-xl">
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">No results for "{query}"</div>
        </div>
      )}
    </div>
  );
}
