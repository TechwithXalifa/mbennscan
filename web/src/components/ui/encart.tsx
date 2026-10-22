import { cn } from "@/lib/utils";

/** Surface blanche à bord arrondi ; `flottant` (verre) quand elle est posée sur la carte. */
export function Encart({
  flottant = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { flottant?: boolean }) {
  return (
    <div className={cn("rounded-md p-4", flottant ? "verre" : "border border-line bg-surface", className)} {...props} />
  );
}
