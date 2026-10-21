import { cn } from "@/lib/utils";

/** Bloc gris aux formes du contenu attendu, jamais un écran blanc. */
export function Squelette({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-sm bg-line", className)} aria-hidden />;
}
