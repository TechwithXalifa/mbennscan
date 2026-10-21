import { cn } from "@/lib/utils";

/** Pastille de filtre (par commune…) : bascule, état lu par les lecteurs d'écran. */
export function Pastille({
  active,
  className,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-cible items-center rounded-pill border px-4 text-petit transition-colors",
        active ? "border-primary bg-primary text-on-color" : "border-line bg-surface text-ink hover:border-ink-2",
        className,
      )}
      {...props}
    />
  );
}
