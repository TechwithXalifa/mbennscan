import { cn } from "@/lib/utils";

/** Bloc gris aux formes du contenu attendu, traversé d'un reflet ; jamais un écran blanc. */
export function Squelette({ className }: { className?: string }) {
  return <div className={cn("squelette rounded-sm bg-line", className)} aria-hidden />;
}
