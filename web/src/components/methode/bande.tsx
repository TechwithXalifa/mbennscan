import { cn } from "@/lib/utils";

/** Section pleine largeur de la page Méthode : surtitre, titre, introduction, puis le contenu ; fonds alternés. */
export function Bande({
  id,
  surtitre,
  titre,
  intro,
  alterne = false,
  children,
}: {
  id: string;
  surtitre: string;
  titre: string;
  intro?: string;
  alterne?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("scroll-mt-14 border-t border-line px-4 py-14 lg:px-8 lg:py-20", alterne ? "bg-surface" : "bg-bg")}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-surtitre uppercase text-vif">{surtitre}</p>
          <h2 id={id} className="mt-2 text-titre1 text-ink lg:text-[30px] lg:leading-10">
            {titre}
          </h2>
          {intro && <p className="mt-3 text-ink-2">{intro}</p>}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
