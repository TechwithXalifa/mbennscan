import { cn } from "@/lib/utils";

/** Surface blanche à bord arrondi ; `flottant` quand elle est posée sur la carte. */
export function Encart({
  flottant = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { flottant?: boolean }) {
  return (
    <div
      className={cn("rounded-md bg-surface p-4", flottant ? "shadow-float" : "border border-line", className)}
      {...props}
    />
  );
}
