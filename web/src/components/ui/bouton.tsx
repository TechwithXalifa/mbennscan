import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const styleBouton = cva(
  "inline-flex min-w-cible items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] ease-sortie active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variante: {
        primaire: "bg-primary text-on-color shadow-1 hover:bg-primary-strong",
        secondaire: "border border-line bg-surface text-ink shadow-1 hover:border-line-strong hover:bg-surface-2",
        discret: "text-primary-ink hover:bg-primary-soft",
        icone: "text-ink-2 hover:bg-surface-3 hover:text-ink",
        danger: "border border-transparent bg-danger-soft text-danger hover:border-danger",
      },
      taille: {
        normale: "min-h-cible px-4 text-texte",
        // 36 px à la souris, 44 px au doigt
        compacte: "min-h-9 px-3 text-petit [@media(pointer:coarse)]:min-h-cible",
      },
      flottant: { true: "verre", false: "" },
    },
    compoundVariants: [
      { variante: "icone", class: "px-0" },
      { variante: "icone", taille: "compacte", class: "min-w-9 [@media(pointer:coarse)]:min-w-cible" },
    ],
    defaultVariants: { variante: "primaire", taille: "normale", flottant: false },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof styleBouton>;

/** Bouton. La variante `icone` exige un `aria-label`. */
export const Bouton = forwardRef<HTMLButtonElement, Props>(function Bouton(
  { variante, taille, flottant, className, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn(styleBouton({ variante, taille, flottant }), className)} {...props} />
  );
});
