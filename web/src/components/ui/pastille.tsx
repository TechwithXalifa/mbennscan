import { cn } from "@/lib/utils";

/** Pastille de filtre (par commune…) : bascule, état lu par les lecteurs d'écran ; une coche se dessine quand elle est active. */
export function Pastille({
  active,
  className,
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "group inline-flex min-h-9 shrink-0 items-center rounded-pill border px-3 text-petit font-medium transition-[color,background-color,border-color,transform] duration-etat ease-sortie active:scale-[0.97] [@media(pointer:coarse)]:min-h-cible",
        active
          ? "border-primary bg-primary text-on-color"
          : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
        className,
      )}
      {...props}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className="h-4 w-0 shrink-0 overflow-visible transition-[width,margin] duration-etat ease-ressort group-aria-pressed:mr-1.5 group-aria-pressed:w-4"
      >
        <path
          d="M3 8.5l3.2 3L13 4.5"
          className="fill-none stroke-current stroke-2 transition-[stroke-dashoffset] delay-75 duration-etat ease-sortie [stroke-dasharray:18] [stroke-dashoffset:18] [stroke-linecap:round] [stroke-linejoin:round] group-aria-pressed:[stroke-dashoffset:0]"
        />
      </svg>
      {children}
    </button>
  );
}
