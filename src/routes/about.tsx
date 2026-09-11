import { createFileRoute } from "@tanstack/react-router";
import { Target, ShieldCheck, Users, Layers } from "lucide-react";
import { SiteLayout, Section } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PharmaMind AI — Our Mission and Approach" },
      {
        name: "description",
        content:
          "Learn how PharmaMind AI builds a traceable, source-backed generative AI knowledge base for pharmaceutical and clinical teams.",
      },
      { property: "og:title", content: "About PharmaMind AI" },
      {
        property: "og:description",
        content: "A traceable, source-backed AI knowledge workspace for pharmaceutical teams.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Target, title: "Accuracy first", text: "Every answer is grounded in a referenced monograph or guideline." },
  { icon: ShieldCheck, title: "Safety by design", text: "Clear disclaimers, severity grading and audit-friendly history." },
  { icon: Layers, title: "One data model", text: "Drugs, interactions and literature share a single connected graph." },
  { icon: Users, title: "Built with clinicians", text: "Shaped by pharmacists, prescribers and pharmacovigilance teams." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <Section>
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-teal">About us</p>
          <h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-5xl">
            Pharmaceutical knowledge, made answerable
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Drug information lives in scattered PDFs, formularies and legacy
            databases. PharmaMind AI unifies those sources into a single
            assistant that answers in plain language and always shows where the
            answer came from.
          </p>
        </div>
      </Section>

      <Section muted>
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((v) => (
            <Card key={v.title} className="rounded-2xl shadow-soft">
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-soft text-accent-foreground">
                  <v.icon className="h-5 w-5" />
                </span>
                <CardTitle className="mt-4 text-lg">{v.title}</CardTitle>
                <CardDescription className="leading-relaxed">{v.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Card className="rounded-3xl shadow-soft">
          <CardHeader>
            <CardTitle>Important notice</CardTitle>
            <CardDescription>
              PharmaMind AI supports professional judgement — it does not replace it.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Content shown in this interface is illustrative. Clinical decisions
            should always be confirmed against approved product information and
            local prescribing guidance.
          </CardContent>
        </Card>
      </Section>
    </SiteLayout>
  );
}
