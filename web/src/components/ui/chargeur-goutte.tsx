// Pictogramme du logo, pixel par pixel : « s » sec (bleu clair), « m » mouillé (primaire).
const GOUTTE = [
  ".....s.....",
  ".....s.....",
  "....sss....",
  "....sss....",
  "...sssss...",
  "...sssss...",
  "..sssssss..",
  ".mmmmmmmmm.",
  "mmmmmmmmmmm",
  "mmmmmmmmmmm",
  "mmmmmmmmmmm",
  ".mmmmmmmmm.",
  "..mmmmmmm..",
];

/** Chargement aux couleurs de la marque : la goutte de pixels se remplit du bas vers le haut. */
export function ChargeurGoutte({ libelle = "Chargement" }: { libelle?: string }) {
  return (
    <div role="status" className="grid grid-cols-[repeat(11,8px)] gap-0.5">
      {GOUTTE.flatMap((ligne, r) =>
        ligne.split("").map((c, i) => (
          <span
            key={`${r}-${i}`}
            aria-hidden
            className={c === "." ? "size-2" : "pixel-goutte size-2 rounded-[2px]"}
            style={
              c === "."
                ? undefined
                : ({
                    "--rang": GOUTTE.length - 1 - r,
                    "--teinte": c === "s" ? "var(--picto-sec)" : "var(--primary)",
                  } as React.CSSProperties)
            }
          />
        )),
      )}
      <span className="sr-only">{libelle}</span>
    </div>
  );
}
