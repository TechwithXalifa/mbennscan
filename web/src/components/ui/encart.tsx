import { cn } from "@/lib/utils";

/** Surface à bord arrondi ; `flottant` (verre) quand elle est posée sur la carte. */
export function Encart({
  flottant = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { flottant?: boolean }) {
  return (
    <div className={cn("rounded-lg p-4", flottant ? "verre" : "border border-line bg-surface", className)} {...props} />
  );
}

/** Section d'une page ou d'une fiche : surtitre, titre, puis le contenu. */
export function Section({
  titre,
  surtitre,
  action,
  id,
  className,
  children,
}: {
  titre: string;
  surtitre?: string;
  action?: React.ReactNode;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id ? `${id}-titre` : undefined} id={id} className={cn("scroll-mt-20", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          {surtitre && <p className="text-surtitre uppercase text-ink-3">{surtitre}</p>}
          <h2 id={id ? `${id}-titre` : undefined} className="text-titre2">
            {titre}
          </h2>
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
