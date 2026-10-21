// Copie contracts/mocks/*.json dans public/mocks/ (lancé avant dev et build).
// En Node plutôt qu'en mkdir/cp pour marcher aussi sous Windows.
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(web, "..", "contracts", "mocks");
const cible = join(web, "public", "mocks");

mkdirSync(cible, { recursive: true });
const fichiers = readdirSync(source).filter((f) => f.endsWith(".json"));
for (const f of fichiers) copyFileSync(join(source, f), join(cible, f));
console.log(`${fichiers.length} mocks copiés dans public/mocks/`);
