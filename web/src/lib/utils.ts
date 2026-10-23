import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge doit connaître les jetons du design system : sans cela, il prend `text-petit`
// pour une couleur et le supprime dès qu'une classe de couleur (`text-ink-2`) le suit.
const fusionner = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "mention",
            "surtitre",
            "petit",
            "texte",
            "titre3",
            "titre2",
            "titre1",
            "chiffre",
            "display",
            "intro",
            "titre-page",
            "hero",
            "hero-lg",
            "geant",
            "ecran",
            "ecran-xl",
          ],
        },
      ],
      shadow: [{ shadow: ["1", "float", "pop"] }],
      rounded: [{ rounded: ["pill", "pixel", "xs", "interne"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return fusionner(clsx(inputs));
}
