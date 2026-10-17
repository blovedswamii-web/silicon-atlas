import type { Metadata } from "next";
import { Glossary } from "@/components/glossary/Glossary";
import { DepthToggle } from "@/components/ui/Depth";
import { PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Every hardware term in plain language first, then technically, then in depth — with each vendor's name for it.",
};

export default function GlossaryPage() {
  return (
    <>
      <PageHeader
        kicker="Reference"
        title="Glossary"
        lede="Plain language first. Switch the depth to see the technical and deep-dive explanation of every term — and the name each company uses for the same idea."
      >
        <DepthToggle size="md" />
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Glossary />
      </div>
    </>
  );
}
