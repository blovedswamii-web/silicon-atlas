import Link from "next/link";
import type { Metadata } from "next";
import { Callout, PageHeader, Section } from "@/components/ui/primitives";
import { PlatformCompare } from "@/components/comparisons/PlatformCompare";

export const metadata: Metadata = {
  title: "Platform Comparison",
  description: "Mac vs AMD, Intel and NVIDIA-based PCs — every row explains what it means.",
};

export default function ComparePage() {
  return (
    <>
      <PageHeader
        kicker="Platform comparison"
        title="Compare platforms, not logos."
        lede="Pick two or three kinds of computer. Each row compares one property — and explains what that difference means for you. There's no score and no winner: the right answer depends on your workload."
      />
      <Section className="pt-0">
        <PlatformCompare />
        <Callout tone="warn" className="mt-6" title="About these values">
          Rows describe typical configurations and representative ranges, not specific products. For exact numbers see the{" "}
          <Link href="/hardware" className="text-accent underline underline-offset-2">hardware database</Link> — and check the manufacturer&apos;s spec page before you buy. Never infer real-world
          performance from a spec row; look for measurements in your own workload.
        </Callout>
      </Section>
    </>
  );
}
