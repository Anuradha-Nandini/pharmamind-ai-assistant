import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  ShieldCheck,
  Shuffle,
  BookOpen,
  Pill,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { SiteLayout, Section } from "@/components/layouts";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PharmaMind AI — Generative AI Assistant for Pharmaceuticals" },
      {
        name: "description",
        content:
          "PharmaMind AI unifies drug information, interaction checks and clinical literature in one AI-powered pharmaceutical knowledge workspace.",
      },
      { property: "og:title", content: "PharmaMind AI — AI Assistant for Pharmaceuticals" },
      {
        property: "og:description",
        content:
          "Ask clinical questions, check drug interactions and search a curated pharmaceutical knowledge base.",
      },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: Sparkles,
    title: "Generative AI Assistant",
    text: "Ask dosage, mechanism and contraindication questions in natural language and get sourced, structured answers.",
  },
  {
    icon: Pill,
    title: "Medicine Directory",
    text: "Browse molecules, brands, formulations and therapeutic classes with clean, comparable data cards.",
  },
  {
    icon: Shuffle,
    title: "Interaction Checker",
    text: "Combine multiple drugs and review severity-graded interaction insights before prescribing.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    text: "Curated monographs, guidelines and clinical literature organised by therapy area.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-minded",
    text: "Answers cite their sources, with clear disclaimers designed for regulated environments.",
  },
  {
    icon: Activity,
    title: "Team Workspace",
    text: "Save answers, keep a searchable history and share findings across your pharmacovigilance team.",
  },
];

const stats = [
  { value: "48k+", label: "Drug records modelled" },
  { value: "12k+", label: "Interaction pairs" },
  { value: "300+", label: "Therapy guidelines" },
  { value: "99.9%", label: "Target uptime" },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_0%,var(--teal-soft),transparent_70%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal-soft px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Generative AI for pharmaceutical teams
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Clinical answers you can <span className="text-teal">trace</span>,
              in seconds.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              PharmaMind AI brings drug information, interaction screening and
              curated literature into one assistant built for pharmacists,
              clinicians and life-science researchers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/ai-assistant">
                  Try the AI Assistant <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/knowledge-base">Explore Knowledge Base</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Sourced responses", "Severity-graded interactions", "Built for regulated teams"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <Card className="rounded-3xl border-border/80 shadow-lift">
            <CardHeader>
              <CardTitle className="text-base">Ask PharmaMind</CardTitle>
              <CardDescription>
                Search a molecule, brand or clinical question.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchBar placeholder="e.g. Metformin dosing in renal impairment" />
              <div className="space-y-3">
                {[
                  { q: "Can amoxicillin be taken with warfarin?", tag: "Interaction" },
                  { q: "Atorvastatin mechanism of action", tag: "Pharmacology" },
                  { q: "Paediatric paracetamol dosing chart", tag: "Dosing" },
                ].map((s) => (
                  <div
                    key={s.q}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                  >
                    <p className="text-sm text-foreground">{s.q}</p>
                    <span className="shrink-0 rounded-full bg-teal-soft px-2.5 py-1 text-xs font-medium text-accent-foreground">
                      {s.tag}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <Section muted className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft"
          >
            <p className="text-3xl font-semibold text-primary">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </Section>

      {/* Features */}
      <Section>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            One workspace for pharmaceutical knowledge
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every module shares the same data model, so an answer in the
            assistant links straight to the monograph behind it.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="rounded-2xl shadow-soft transition-shadow hover:shadow-lift">
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-soft text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </span>
                <CardTitle className="mt-4 text-lg">{f.title}</CardTitle>
                <CardDescription className="leading-relaxed">{f.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section muted>
        <div className="rounded-3xl bg-primary px-8 py-14 text-center shadow-lift sm:px-14">
          <h2 className="text-3xl font-semibold text-primary-foreground sm:text-4xl">
            Bring clarity to every clinical question
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/75">
            Create a free workspace and explore the assistant, medicine directory
            and interaction checker.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/signup">Create free account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/about">Learn more</Link>
            </Button>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}
