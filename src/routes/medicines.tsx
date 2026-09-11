import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Pill,
  Search,
  Filter,
  FileText,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Info,
  Heart,
  Activity,
} from "lucide-react";
import { SiteLayout, Section } from "@/components/layouts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/medicines")({
  head: () => ({
    meta: [
      { title: "Medicine Directory — PharmaMind AI" },
      {
        name: "description",
        content: "Search and compare pharmaceutical monographs, brand names, indications, and clinical dosing guidelines.",
      },
    ],
  }),
  component: MedicinesPage,
});

interface Medicine {
  id: string;
  genericName: string;
  brandNames: string[];
  category: "Cardiovascular" | "Endocrine" | "Anti-infective" | "Gastrointestinal" | "CNS" | "Analgesic";
  form: string;
  strengths: string[];
  indications: string[];
  pregnancyCategory: "A" | "B" | "C" | "D" | "X";
  blackBoxWarning?: boolean;
  moa: string;
  dosingAdult: string;
  dosingPediatric?: string;
  sideEffectsCommon: string[];
  sideEffectsSevere: string[];
  contraindications: string[];
}

const medicinesData: Medicine[] = [
  {
    id: "med-1",
    genericName: "Metformin Hydrochloride",
    brandNames: ["Glucophage", "Fortamet", "Riomet"],
    category: "Endocrine",
    form: "Tablet (Immediate & Extended Release)",
    strengths: ["500 mg", "850 mg", "1000 mg"],
    indications: ["Type 2 Diabetes Mellitus", "Polycystic Ovary Syndrome (Off-label)"],
    pregnancyCategory: "B",
    blackBoxWarning: true,
    moa: "Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity by increasing peripheral glucose uptake and utilization.",
    dosingAdult: "Initial: 500 mg orally twice daily with meals. Titrate by 500 mg weekly up to max 2,500 mg/day.",
    dosingPediatric: "10 years and older: 500 mg twice daily. Maximum daily dose 2,000 mg/day.",
    sideEffectsCommon: ["Nausea", "Diarrhea", "Abdominal discomfort", "Flatulence", "Metallic taste"],
    sideEffectsSevere: ["Lactic Acidosis", "Vitamin B12 Deficiency", "Severe Hypoglycemia (with Sulfonylureas)"],
    contraindications: ["eGFR < 30 mL/min/1.73m²", "Acute metabolic acidosis", "Severe hepatic impairment"],
  },
  {
    id: "med-2",
    genericName: "Atorvastatin Calcium",
    brandNames: ["Lipitor"],
    category: "Cardiovascular",
    form: "Film-coated Tablet",
    strengths: ["10 mg", "20 mg", "40 mg", "80 mg"],
    indications: ["Hypercholesterolemia", "Prevention of Cardiovascular Disease", "Hypertriglyceridemia"],
    pregnancyCategory: "X",
    blackBoxWarning: false,
    moa: "Selective, competitive inhibitor of HMG-CoA reductase, enzyme converting 3-hydroxy-3-methylglutaryl-coenzyme A to mevalonate in lipid synthesis.",
    dosingAdult: "Initial 10-20 mg once daily. High-intensity regimen: 40-80 mg once daily.",
    sideEffectsCommon: ["Nasopharyngitis", "Arthralgia", "Diarrhea", "Pain in extremity"],
    sideEffectsSevere: ["Rhabdomyolysis", "Hepatotoxicity", "Immune-mediated Necrotizing Myopathy"],
    contraindications: ["Active liver disease", "Pregnancy & Lactation", "Unexplained persistent elevation of serum transaminases"],
  },
  {
    id: "med-3",
    genericName: "Amoxicillin Trihydrate",
    brandNames: ["Amoxil", "Trimox"],
    category: "Anti-infective",
    form: "Capsule, Tablet, Oral Suspension",
    strengths: ["250 mg", "500 mg", "875 mg", "125 mg/5mL", "250 mg/5mL"],
    indications: ["Otitis Media", "Streptococcal Pharyngitis", "Community-Acquired Pneumonia", "H. pylori Eradication"],
    pregnancyCategory: "B",
    blackBoxWarning: false,
    moa: "Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs), leading to bacterial cell lysis.",
    dosingAdult: "500 mg every 8 hours OR 875 mg every 12 hours. Severe pneumonia: 1,000 mg 3 times daily.",
    dosingPediatric: "High dose AOM: 80–90 mg/kg/day in 2 divided doses every 12 hours.",
    sideEffectsCommon: ["Diarrhea", "Rash", "Vomiting", "Urticaria"],
    sideEffectsSevere: ["Anaphylaxis", "Clostridioides difficile-associated diarrhea", "Stevens-Johnson Syndrome"],
    contraindications: ["History of severe hypersensitivity to penicillins or cephalosporins"],
  },
  {
    id: "med-4",
    genericName: "Lisinopril",
    brandNames: ["Zestril", "Prinivil"],
    category: "Cardiovascular",
    form: "Oral Tablet",
    strengths: ["2.5 mg", "5 mg", "10 mg", "20 mg", "40 mg"],
    indications: ["Hypertension", "Heart Failure", "Post-Myocardial Infarction"],
    pregnancyCategory: "D",
    blackBoxWarning: true,
    moa: "Inhibits Angiotensin-Converting Enzyme (ACE), preventing conversion of Angiotensin I to potent vasoconstrictor Angiotensin II.",
    dosingAdult: "Initial 10 mg once daily for hypertension; titrate to max 40 mg daily. Post-MI: 5 mg within 24 hours.",
    dosingPediatric: "Initial 0.07 mg/kg once daily in pediatric patients ≥ 6 years.",
    sideEffectsCommon: ["Persistent Dry Cough", "Dizziness", "Headache", "Hypotension"],
    sideEffectsSevere: ["Angioedema", "Hyperkalemia", "Acute Renal Failure", "Fetal Toxicity"],
    contraindications: ["History of ACE inhibitor-associated angioedema", "Concomitant Aliskiren in Diabetes", "Pregnancy"],
  },
  {
    id: "med-5",
    genericName: "Omeprazole",
    brandNames: ["Prilosec", "Losec"],
    category: "Gastrointestinal",
    form: "Delayed-Release Capsule, Suspension",
    strengths: ["10 mg", "20 mg", "40 mg"],
    indications: ["GERD", "Duodenal Ulcer", "Erosive Esophagitis", "Zollinger-Ellison Syndrome"],
    pregnancyCategory: "C",
    blackBoxWarning: false,
    moa: "Suppresses gastric acid secretion by specific inhibition of the H+/K+ ATPase enzyme system at the secretory surface of the gastric parietal cell.",
    dosingAdult: "GERD: 20 mg daily for 4-8 weeks. Zollinger-Ellison: 60 mg once daily.",
    sideEffectsCommon: ["Headache", "Abdominal pain", "Nausea", "Flatulence"],
    sideEffectsSevere: ["Bone Fracture Risk (Long-term)", "C. difficile Infection", "Hypomagnesemia", "Vitamin B12 Malabsorption"],
    contraindications: ["Hypersensitivity to substituted benzimidazoles", "Concomitant Rilpivirine"],
  },
  {
    id: "med-6",
    genericName: "Sertraline Hydrochloride",
    brandNames: ["Zoloft"],
    category: "CNS",
    form: "Tablet, Oral Concentrate",
    strengths: ["25 mg", "50 mg", "100 mg"],
    indications: ["Major Depressive Disorder", "Panic Disorder", "PTSD", "OCD"],
    pregnancyCategory: "C",
    blackBoxWarning: true,
    moa: "Potent and selective inhibitor of neuronal serotonin (5-HT) reuptake, with minimal effects on norepinephrine and dopamine reuptake.",
    dosingAdult: "Initial: 50 mg once daily. Titrate by 25-50 mg weekly to max 200 mg daily.",
    sideEffectsCommon: ["Insomnia", "Sexual Dysfunction", "Somnolence", "Diarrhea", "Tremor"],
    sideEffectsSevere: ["Serotonin Syndrome", "Suicidal Thoughts in Young Adults", "Bleeding Abnormalities", "Hyponatremia"],
    contraindications: ["Concomitant MAOIs", "Concomitant Pimozide", "Oral concentrate with Disulfiram"],
  },
];

export function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);

  const categories = ["All", "Cardiovascular", "Endocrine", "Anti-infective", "Gastrointestinal", "CNS"];

  const filteredMeds = medicinesData.filter((m) => {
    const matchesSearch =
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      m.brandNames.some((b) => b.toLowerCase().includes(search.toLowerCase())) ||
      m.indications.some((i) => i.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCategory === "All" || m.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <SiteLayout>
      <div className="bg-background">
        {/* Header Hero */}
        <section className="border-b border-border bg-surface/50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal-soft px-3 py-1 text-xs font-medium text-accent-foreground">
                <Pill className="h-3.5 w-3.5 text-teal" />
                Comprehensive Monograph Database
              </span>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                Pharmaceutical Medicine Directory
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                Search over 48,000 modeled molecules, brands, mechanisms of action, adult & pediatric dosing, and FDA black box warnings.
              </p>

              {/* Search & Category filter */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by generic name, brand (e.g. Lipitor), or indication..."
                    className="h-11 pl-10 text-sm shadow-none"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="h-8 rounded-full text-xs"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Directory Grid */}
        <Section className="py-10 sm:py-14">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredMeds.length}</span> essential medicine monographs
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMeds.map((med) => (
              <Card key={med.id} className="flex flex-col rounded-2xl shadow-soft transition-all hover:shadow-lift border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">{med.genericName}</CardTitle>
                      <CardDescription className="mt-1 text-xs text-muted-foreground">
                        Brands: <span className="font-medium text-foreground">{med.brandNames.join(", ")}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[11px]">
                      {med.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-muted-foreground">Form & Strengths:</span>
                    <p className="text-foreground">{med.form} • {med.strengths.join(", ")}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-muted-foreground">Primary Indications:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {med.indications.map((ind) => (
                        <span key={ind} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-[10px]">
                      Pregnancy Cat: <strong className="ml-1 text-foreground">{med.pregnancyCategory}</strong>
                    </Badge>
                    {med.blackBoxWarning && (
                      <Badge variant="destructive" className="gap-1 text-[10px] uppercase">
                        <ShieldAlert className="h-3 w-3" /> Black Box Warning
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/60">
                  <Button
                    onClick={() => setSelectedMed(med)}
                    variant="outline"
                    className="w-full justify-between gap-1 text-xs"
                  >
                    <span>View Monograph & Dosing</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      {/* Monograph Detail Sheet */}
      <Sheet open={!!selectedMed} onOpenChange={(open) => !open && setSelectedMed(null)}>
        {selectedMed && (
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6">
            <SheetHeader className="pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{selectedMed.category}</Badge>
                <Badge variant="outline" className="text-xs">Pregnancy Category {selectedMed.pregnancyCategory}</Badge>
                {selectedMed.blackBoxWarning && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <ShieldAlert className="h-3.5 w-3.5" /> Black Box Warning
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-2xl font-bold text-foreground mt-2">{selectedMed.genericName}</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Trade Names: <strong className="text-foreground">{selectedMed.brandNames.join(", ")}</strong>
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="overview" className="mt-6 w-full">
              <TabsList className="grid w-full grid-cols-3 text-xs">
                <TabsTrigger value="overview">Overview & MoA</TabsTrigger>
                <TabsTrigger value="dosing">Dosing & Admin</TabsTrigger>
                <TabsTrigger value="safety">Safety & Warnings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-teal" /> Mechanism of Action (MoA)
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground bg-surface p-3.5 rounded-xl border border-border">
                    {selectedMed.moa}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">Therapeutic Indications</h4>
                  <ul className="mt-2 space-y-1 text-xs">
                    {selectedMed.indications.map((ind) => (
                      <li key={ind} className="flex items-center gap-2 text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal" />
                        {ind}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">Available Dosage Forms & Strengths</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{selectedMed.form}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedMed.strengths.map((str) => (
                      <span key={str} className="rounded-lg bg-teal-soft border border-teal/20 px-2.5 py-1 text-xs font-medium text-accent-foreground">
                        {str}
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Dosing Tab */}
              <TabsContent value="dosing" className="mt-4 space-y-4 text-sm">
                <div className="rounded-xl border border-border bg-card p-4">
                  <h4 className="font-semibold text-foreground">Adult Dosing Protocol</h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{selectedMed.dosingAdult}</p>
                </div>

                {selectedMed.dosingPediatric && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h4 className="font-semibold text-foreground">Pediatric Dosing Guidelines</h4>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{selectedMed.dosingPediatric}</p>
                  </div>
                )}

                <div className="rounded-xl border border-teal/30 bg-teal-soft/30 p-3.5 text-xs text-muted-foreground">
                  <p className="font-semibold text-accent-foreground flex items-center gap-1">
                    <Info className="h-4 w-4 text-teal" /> Clinical Administration Note
                  </p>
                  <p className="mt-1">
                    Ensure baseline serum creatinine and LFTs are obtained prior to initiating chronic therapy. Adjust for renal impairment per standard clinical guidelines.
                  </p>
                </div>
              </TabsContent>

              {/* Safety Tab */}
              <TabsContent value="safety" className="mt-4 space-y-4 text-sm">
                {selectedMed.blackBoxWarning && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertOctagon className="h-4 w-4" /> FDA Boxed Warning Active
                    </div>
                    <p className="mt-1 leading-relaxed">
                      Consult complete prescribing information regarding potential organ toxicity or severe adverse events prior to administration.
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-foreground">Common Side Effects</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedMed.sideEffectsCommon.map((se) => (
                      <span key={se} className="rounded-md bg-muted px-2.5 py-1 text-xs text-foreground">
                        {se}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">Severe / Life-Threatening Reactions</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedMed.sideEffectsSevere.map((se) => (
                      <span key={se} className="rounded-md bg-destructive/15 text-destructive px-2.5 py-1 text-xs font-medium">
                        {se}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">Absolute Contraindications</h4>
                  <ul className="mt-2 space-y-1 text-xs">
                    {selectedMed.contraindications.map((ci) => (
                      <li key={ci} className="flex items-center gap-2 text-foreground">
                        <AlertOctagon className="h-3.5 w-3.5 text-destructive" />
                        {ci}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </SheetContent>
        )}
      </Sheet>
    </SiteLayout>
  );
}
