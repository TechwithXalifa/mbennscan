import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const styleBouton = cva(
  "inline-flex min-h-cible min-w-cible items-center justify-center gap-2 rounded-sm text-texte font-medium transition-[color,background-color,border-color,transform] ease-sortie active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variante: {
        primaire: "bg-primary px-4 text-on-color hover:bg-primary-strong",
        secondaire: "border border-line bg-surface px-4 text-ink hover:border-ink-2",
        discret: "px-3 text-primary hover:bg-bg",
        icone: "text-ink hover:bg-bg",
      },
      flottant: { true: "verre", false: "" },
    },
    defaultVariants: { variante: "primaire", flottant: false },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof styleBouton>;

/** Bouton. La variante `icone` exige un `aria-label`. */
export const Bouton = forwardRef<HTMLButtonElement, Props>(function Bouton(
  { variante, flottant, className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(styleBouton({ variante, flottant }), className)} {...props} />;
});
