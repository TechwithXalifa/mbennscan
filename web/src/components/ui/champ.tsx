import { ChevronDown, Search, X } from "lucide-react";
import { forwardRef } from "react";
import { ICONE_PETITE } from "@/lib/design";
import { cn } from "@/lib/utils";

const CHAMP =
  "min-h-cible w-full rounded-sm border border-line-strong bg-surface text-texte text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] hover:border-ink-2 focus-visible:border-focus sm:min-h-10 sm:text-petit [@media(pointer:coarse)]:min-h-cible";

/** Champ de recherche avec loupe et bouton d'effacement. */
export const ChampRecherche = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { onEffacer?: () => void }
>(function ChampRecherche({ className, onEffacer, value, ...props }, ref) {
  return (
    <div className={cn("relative", className)}>
      <Search
        {...ICONE_PETITE}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
        aria-hidden
      />
      <input ref={ref} type="search" value={value} className={cn(CHAMP, "pl-9 pr-10")} {...props} />
      {onEffacer && value !== "" && (
        <button
          type="button"
          onClick={onEffacer}
          aria-label="Effacer la recherche"
          className="absolute right-0 top-0 inline-flex h-full w-10 items-center justify-center text-ink-3 hover:text-ink"
        >
          <X {...ICONE_PETITE} aria-hidden />
        </button>
      )}
    </div>
  );
});

/** Liste déroulante native (accessible partout, y compris sur téléphone), au style des champs. */
export function Selection({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("relative", className)}>
      <select className={cn(CHAMP, "appearance-none pl-3 pr-9")} {...props}>
        {children}
      </select>
      <ChevronDown
        {...ICONE_PETITE}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"
        aria-hidden
      />
    </div>
  );
}
