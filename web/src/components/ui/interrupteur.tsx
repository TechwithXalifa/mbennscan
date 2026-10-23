import { cn } from "@/lib/utils";

/** Interrupteur (afficher une couche, une option) : rôle « switch », libellé et détail cliquables. */
export function Interrupteur({
  actif,
  onChange,
  libelle,
  detail,
  disabled = false,
}: {
  actif: boolean;
  onChange: (actif: boolean) => void;
  libelle: string;
  detail?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      disabled={disabled}
      onClick={() => onChange(!actif)}
      className="flex min-h-cible w-full items-center gap-3 rounded-sm px-1 text-left transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-petit font-medium text-ink">{libelle}</span>
        {detail && <span className="block text-mention font-normal text-ink-3">{detail}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-pill border transition-colors duration-etat",
          actif ? "border-primary bg-primary" : "border-line-strong bg-surface-3",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-3.5 -translate-y-1/2 rounded-pill shadow-1 transition-transform duration-etat ease-ressort",
            actif ? "translate-x-[18px] bg-on-color" : "translate-x-[2px] bg-ink-3",
          )}
        />
      </span>
    </button>
  );
}
