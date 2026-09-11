import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shuffle,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Printer,
  Sparkles,
  Search,
  ShieldCheck,
} from "lucide-react";
import { SiteLayout, Section } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/interactions")({
  head: () => ({
    meta: [
      { title: "Drug Interaction Checker — PharmaMind AI" },
      {
        name: "description",
        content: "Screen multi-drug regimens for severe, moderate, and minor drug-drug interactions with clinical management protocols.",
      },
    ],
  }),
  component: InteractionsPage,
});

interface InteractionPair {
  drugA: string;
  drugB: string;
  severity: "Major" | "Moderate" | "Minor";
  title: string;
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
}

const interactionDatabase: InteractionPair[] = [
  {
    drugA: "Warfarin",
    drugB: "Aspirin",
    severity: "Major",
    title: "Synergistic Anticoagulant & Antiplatelet Bleeding Risk",
    mechanism: "Additive inhibition of haemostasis: Warfarin inhibits vitamin K-dependent clotting factor synthesis while Aspirin irreversibly inactivates platelet cyclooxygenase-1 (COX-1).",
    clinicalEffect: "Significant escalation in gastrointestinal bleeding, intracranial hemorrhage, and major surgical bleeding.",
    recommendation: "Avoid concomitant therapy unless clinically mandated (e.g. mechanical heart valves). If combination is required, maintain target INR 2.0-2.5 and co-prescribe a Proton Pump Inhibitor (PPI) for gastric protection.",
  },
  {
    drugA: "Simvastatin",
    drugB: "Clarithromycin",
    severity: "Major",
    title: "CYP3A4 Inhibition Leading to Statin Toxicity & Rhabdomyolysis",
    mechanism: "Clarithromycin is a potent inhibitor of CYP3A4, the primary cytochrome P450 isoenzyme responsible for Simvastatin metabolism.",
    clinicalEffect: "Up to 10-fold increase in plasma Simvastatin AUC, leading to severe myopathy, elevated creatine kinase (CK), and acute kidney injury from rhabdomyolysis.",
    recommendation: "Contraindicated. Temporarily suspend Simvastatin during Clarithromycin therapy, or substitute with a non-CYP3A4 metabolized statin (e.g. Rosuvastatin or Pravastatin).",
  },
  {
    drugA: "Fluoxetine",
    drugB: "Tramadol",
    severity: "Major",
    title: "Serotonergic Toxicity & CYP2D6 Metabolic Blockade",
    mechanism: "Fluoxetine inhibits serotonin reuptake and strongly inhibits CYP2D6. Tramadol relies on CYP2D6 for conversion to active O-desmethyltramadol while inhibiting serotonin reuptake.",
    clinicalEffect: "Excessive central serotonin accumulation triggering Serotonin Syndrome (clonus, hyperthermia, delirium) and reduced analgesic efficacy.",
    recommendation: "Avoid combination. Switch to a non-serotonergic analgesic (e.g. Acetaminophen or short-acting non-serotonergic opioids) and monitor for serotonergic signs.",
  },
  {
    drugA: "Metformin",
    drugB: "Contrast Agent",
    severity: "Major",
    title: "Contrast-Induced Acute Kidney Injury & Lactic Acidosis",
    mechanism: "Iodinated radiocontrast agents can cause transient reduction in renal function, impairing urinary excretion of Metformin.",
    clinicalEffect: "Systemic accumulation of Metformin resulting in life-threatening Metformin-Associated Lactic Acidosis (MALA).",
    recommendation: "Withhold Metformin prior to or at the time of procedure in patients with eGFR 30–60 mL/min/1.73m². Re-evaluate renal function 48 hours post-procedure before resuming.",
  },
  {
    drugA: "Lisinopril",
    drugB: "Spironolactone",
    severity: "Moderate",
    title: "Synergistic Potassium Retention (Hyperkalemia)",
    mechanism: "ACE inhibitors (Lisinopril) reduce aldosterone secretion, while Spironolactone directly antagonizes aldosterone receptors in the renal distal tubule.",
    clinicalEffect: "Elevated serum potassium levels (> 5.5 mEq/L) leading to cardiac arrhythmias.",
    recommendation: "Regularly monitor serum potassium and creatinine (baseline, 1 week, 1 month, and quarterly). Instruct patient to avoid potassium supplements and high-potassium salt substitutes.",
  },
  {
    drugA: "Omeprazole",
    drugB: "Clopidogrel",
    severity: "Moderate",
    title: "CYP2C19 Inhibition Decreasing Clopidogrel Activation",
    mechanism: "Omeprazole inhibits CYP2C19, the primary enzyme required to convert prodrug Clopidogrel to its active antiplatelet metabolite.",
    clinicalEffect: "Decreased antiplatelet efficacy, increasing the risk of adverse cardiovascular events and stent thrombosis.",
    recommendation: "Use Pantoprazole or Rabeprazole instead of Omeprazole, as they exhibit significantly lower CYP2C19 inhibitory potency.",
  },
];

const presetRegimens = [
  { name: "Anticoagulants + NSAID", drugs: ["Warfarin", "Aspirin"] },
  { name: "Statin + Antibiotic", drugs: ["Simvastatin", "Clarithromycin"] },
  { name: "SSRI + Opioid", drugs: ["Fluoxetine", "Tramadol"] },
  { name: "Cardiovascular Combo", drugs: ["Lisinopril", "Spironolactone"] },
  { name: "Antiplatelet + PPI", drugs: ["Omeprazole", "Clopidogrel"] },
];

export function InteractionsPage() {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(["Warfarin", "Aspirin"]);
  const [inputDrug, setInputDrug] = useState("");

  const handleAddDrug = (drugName?: string) => {
    const name = (drugName || inputDrug).trim();
    if (!name) return;
    if (!selectedDrugs.some((d) => d.toLowerCase() === name.toLowerCase())) {
      setSelectedDrugs((prev) => [...prev, name]);
    }
    if (!drugName) setInputDrug("");
  };

  const handleRemoveDrug = (drugName: string) => {
    setSelectedDrugs((prev) => prev.filter((d) => d !== drugName));
  };

  // Find interaction pairs present in selected drugs
  const activeInteractions: InteractionPair[] = [];
  for (let i = 0; i < selectedDrugs.length; i++) {
    for (let j = i + 1; j < selectedDrugs.length; j++) {
      const drug1 = selectedDrugs[i];
      const drug2 = selectedDrugs[j];
      if (!drug1 || !drug2) continue;

      const d1 = drug1.toLowerCase();
      const d2 = drug2.toLowerCase();

      const found = interactionDatabase.find(
        (pair) =>
          (pair.drugA.toLowerCase() === d1 && pair.drugB.toLowerCase() === d2) ||
          (pair.drugA.toLowerCase() === d2 && pair.drugB.toLowerCase() === d1),
      );

      if (found) {
        activeInteractions.push(found);
      }
    }
  }

  const hasMajor = activeInteractions.some((i) => i.severity === "Major");
  const hasModerate = activeInteractions.some((i) => i.severity === "Moderate");

  return (
    <SiteLayout>
      <div className="bg-background">
        {/* Header Hero */}
        <section className="border-b border-border bg-surface/50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal-soft px-3 py-1 text-xs font-medium text-accent-foreground">
                <Shuffle className="h-3.5 w-3.5 text-teal" />
                Regimen Screening Engine
              </span>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                Multi-Drug Interaction Checker
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                Screen patient drug regimens against severity-graded pharmacokinetic and pharmacodynamic interaction matrices.
              </p>

              {/* Quick Preset Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Sample Regimens:</span>
                {presetRegimens.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDrugs(preset.drugs)}
                    className="h-7 rounded-full text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Screening Section */}
        <Section className="py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Input Panel */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="rounded-2xl border-border shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base">Build Patient Drug Regimen</CardTitle>
                  <CardDescription className="text-xs">
                    Type a drug generic or brand name to add to the analysis list.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddDrug();
                    }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={inputDrug}
                        onChange={(e) => setInputDrug(e.target.value)}
                        placeholder="e.g. Warfarin, Simvastatin..."
                        className="pl-9 text-sm h-10"
                      />
                    </div>
                    <Button type="submit" size="sm" className="h-10 px-4">
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </form>

                  {/* Active Chips */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Active Regimen ({selectedDrugs.length} Drugs Selected)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDrugs.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-teal/30 bg-teal-soft/80 px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                        >
                          {d}
                          <button
                            type="button"
                            onClick={() => handleRemoveDrug(d)}
                            className="rounded-full p-0.5 hover:bg-teal/20"
                          >
                            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Regimen Risk Level:</span>
                    {hasMajor ? (
                      <Badge variant="destructive" className="gap-1 font-semibold uppercase">
                        <ShieldAlert className="h-3 w-3" /> High Risk Detected
                      </Badge>
                    ) : hasModerate ? (
                      <Badge className="bg-amber-500 text-white gap-1 font-semibold uppercase">
                        <AlertTriangle className="h-3 w-3" /> Moderate Risk
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 font-semibold uppercase text-teal border-teal/40">
                        <ShieldCheck className="h-3 w-3" /> No Major Interactions
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Info className="h-4 w-4 text-teal" /> How Severity Ratings Are Defined
                </p>
                <ul className="space-y-1 pl-4 list-disc">
                  <li><strong className="text-destructive">Major:</strong> Potentially life-threatening. Requires immediate alternative selection or intervention.</li>
                  <li><strong className="text-amber-500">Moderate:</strong> Potential clinical deterioration; close laboratory or dosage monitoring advised.</li>
                  <li><strong className="text-teal">Minor:</strong> Minimal effect; monitor symptoms standardly.</li>
                </ul>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Interaction Analysis Results ({activeInteractions.length} Identified)
                </h3>
                {activeInteractions.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 gap-1.5 text-xs">
                    <Printer className="h-3.5 w-3.5" /> Print Clinical Report
                  </Button>
                )}
              </div>

              {activeInteractions.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-border p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 font-semibold text-foreground">No Significant Interactions Flagged</h4>
                  <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                    The currently selected drug combination does not exhibit major documented interaction risks in our active pharmacovigilance index.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeInteractions.map((inter, idx) => (
                    <Card
                      key={idx}
                      className={`rounded-2xl border shadow-soft ${
                        inter.severity === "Major"
                          ? "border-destructive/40 bg-destructive/5"
                          : "border-amber-500/30 bg-amber-500/5"
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-semibold text-foreground text-base">
                              {inter.drugA} + {inter.drugB}
                            </span>
                          </div>
                          <Badge
                            variant={inter.severity === "Major" ? "destructive" : "default"}
                            className={inter.severity === "Moderate" ? "bg-amber-500 text-white" : ""}
                          >
                            {inter.severity} Severity
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-semibold text-foreground mt-1">{inter.title}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3 text-xs">
                        <div>
                          <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                            Pharmacological Mechanism:
                          </span>
                          <p className="mt-0.5 text-foreground leading-relaxed">{inter.mechanism}</p>
                        </div>

                        <div>
                          <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                            Clinical Consequence:
                          </span>
                          <p className="mt-0.5 text-foreground leading-relaxed">{inter.clinicalEffect}</p>
                        </div>

                        <div className="rounded-xl bg-card p-3 border border-border">
                          <span className="font-semibold text-teal flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> Actionable Management Recommendation:
                          </span>
                          <p className="mt-1 text-foreground leading-relaxed font-medium">{inter.recommendation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>
    </SiteLayout>
  );
}
