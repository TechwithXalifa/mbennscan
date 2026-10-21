import type { Metadata } from "next";
import { Catalogue } from "@/components/design-system/catalogue";

export const metadata: Metadata = { title: "Design system · MbënnScan", robots: { index: false } };

export default function Page() {
  return <Catalogue />;
}
