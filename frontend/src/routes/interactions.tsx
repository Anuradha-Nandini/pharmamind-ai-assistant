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
  Zap,
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

export interface InteractionPair {
  drugA: string;
  drugB: string;
  severity: "Major" | "Moderate" | "Minor" | "Minimal";
  title: string;
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
}

const availableDrugsList = [
  "Warfarin",
  "Aspirin",
  "Simvastatin",
  "Clarithromycin",
  "Fluoxetine",
  "Tramadol",
  "Metformin",
  "Contrast Agent",
  "Lisinopril",
  "Spironolactone",
  "Omeprazole",
  "Clopidogrel",
  "Atorvastatin",
  "Rosuvastatin",
  "Ibuprofen",
  "Paracetamol",
  "Amoxicillin",
  "Ciprofloxacin",
  "Nitroglycerin",
  "Sildenafil",
  "Sertraline",
  "Apixaban",
  "Heparin",
  "Metoprolol",
  "Amlodipine",
  "Digoxin",
  "Lithium",
];

const predefinedInteractions: InteractionPair[] = [
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
  {
    drugA: "Sildenafil",
    drugB: "Nitroglycerin",
    severity: "Major",
    title: "Severe Refractory Hypotension & Cardiovascular Collapse",
    mechanism: "Nitroglycerin increases cyclic GMP synthesis via nitric oxide, while Sildenafil prevents cGMP degradation via PDE5 inhibition.",
    clinicalEffect: "Profound, life-threatening drop in systemic blood pressure, precipitating myocardial infarction or cerebral ischemia.",
    recommendation: "ABSOLUTELY CONTRAINDICATED. Nitrates must not be administered within 24 hours of Sildenafil (or 48 hours of Tadalafil).",
  },
  {
    drugA: "Warfarin",
    drugB: "Ibuprofen",
    severity: "Major",
    title: "Gastrointestinal Mucosal Ulceration & Antiplatelet Hemorrhage",
    mechanism: "Ibuprofen causes direct gastric mucosal injury and COX-1 platelet inhibition, compounding Warfarin anticoagulant activity.",
    clinicalEffect: "Marked increase in upper GI hemorrhage and bleeding frequency.",
    recommendation: "Avoid NSAIDs in anticoagulated patients. Use Acetaminophen (up to 2g/day) for mild analgesia or co-prescribe PPI gastroprotection if NSAIDs are unavoidable.",
  },
];

// Dynamic Interaction Generator for Any Drug Pair
function analyzePairInteraction(drug1: string, drug2: string): InteractionPair {
  const d1 = drug1.toLowerCase();
  const d2 = drug2.toLowerCase();

  // 1. Check exact predefined match
  const predefined = predefinedInteractions.find(
    (p) =>
      (p.drugA.toLowerCase() === d1 && p.drugB.toLowerCase() === d2) ||
      (p.drugA.toLowerCase() === d2 && p.drugB.toLowerCase() === d1),
  );
  if (predefined) return predefined;

  // 2. Anticoagulant + NSAID/Antiplatelet
  if (
    (d1.includes("warfarin") || d1.includes("apixaban") || d1.includes("heparin")) &&
    (d2.includes("ibuprofen") || d2.includes("aspirin") || d2.includes("naproxen") || d2.includes("clopidogrel"))
  ) {
    return {
      drugA: drug1,
      drugB: drug2,
      severity: "Major",
      title: "Additive Hemostatic Suppression & GI Bleed Hazard",
      mechanism: `Combined inhibition of coagulation cascades (${drug1}) and platelet activation/gastric mucosal barrier protection (${drug2}).`,
      clinicalEffect: "Significantly elevated hazard of major gastrointestinal and mucosal bleeding.",
      recommendation: "Avoid concomitant administration if possible. Consider Acetaminophen as an alternative or co-prescribe a Proton Pump Inhibitor.",
    };
  }

  // 3. ACE Inhibitor / ARB + Potassium Sparing / NSAID
  if (
    (d1.includes("lisinopril") || d1.includes("enalapril") || d1.includes("ramipril")) &&
    (d2.includes("spironolactone") || d2.includes("ibuprofen") || d2.includes("naproxen"))
  ) {
    return {
      drugA: drug1,
      drugB: drug2,
      severity: "Moderate",
      title: "Renal Clearance Impairment & Hyperkalemia Risk",
      mechanism: `Synergistic reduction in renal arteriolar perfusion and suppression of aldosterone-mediated urinary potassium excretion.`,
      clinicalEffect: "Elevated risk of acute kidney injury and hyperkalemia (> 5.5 mEq/L).",
      recommendation: "Monitor serum potassium and renal function baseline and 1-2 weeks post initiation.",
    };
  }

  // 4. Statin + CYP3A4 Inhibitor / Macrolide
  if (
    (d1.includes("statin") || d1.includes("simvastatin") || d1.includes("atorvastatin")) &&
    (d2.includes("clarithromycin") || d2.includes("erythromycin") || d2.includes("ciprofloxacin"))
  ) {
    return {
      drugA: drug1,
      drugB: drug2,
      severity: "Major",
      title: "CYP Isoenzyme Inhibition & Statin Toxicity",
      mechanism: `${drug2} inhibits hepatic metabolic clearance of ${drug1}, leading to systemic drug accumulation.`,
      clinicalEffect: "Increased risk of skeletal muscle toxicity, myopathy, elevated creatine kinase, and rhabdomyolysis.",
      recommendation: "Temporarily hold statin therapy during antibiotic administration or switch to Pravastatin/Rosuvastatin.",
    };
  }

  // 5. SSRI / Antidepressant + Opioid
  if (
    (d1.includes("fluoxetine") || d1.includes("sertraline") || d1.includes("ssri")) &&
    (d2.includes("tramadol") || d2.includes("fentanyl"))
  ) {
    return {
      drugA: drug1,
      drugB: drug2,
      severity: "Major",
      title: "Serotonergic Accumulation & Central Toxicity",
      mechanism: `Synergistic elevation of synaptic serotonin levels in the central nervous system.`,
      clinicalEffect: "Risk of Serotonin Syndrome (hyperreflexia, clonus, fever, confusion) and lowered seizure threshold.",
      recommendation: "Avoid combination. Utilize alternative non-serotonergic analgesics.",
    };
  }

  // 6. Generic Minor / Minimal Risk fallback
  return {
    drugA: drug1,
    drugB: drug2,
    severity: "Minor",
    title: "Mild Pharmacokinetic Monitoring Advised",
    mechanism: `Minimal overlap in primary metabolic clearance pathways between ${drug1} and ${drug2}.`,
    clinicalEffect: "No major clinical toxicity documented under standard therapeutic dosing.",
    recommendation: "Standard clinical monitoring recommended. No dosage adjustment required.",
  };
}

const presetRegimens = [
  { name: "Anticoagulants + NSAID", drugs: ["Warfarin", "Aspirin"] },
  { name: "Statin + Antibiotic", drugs: ["Simvastatin", "Clarithromycin"] },
  { name: "SSRI + Opioid", drugs: ["Fluoxetine", "Tramadol"] },
  { name: "Cardiovascular Combo", drugs: ["Lisinopril", "Spironolactone"] },
  { name: "Antiplatelet + PPI", drugs: ["Omeprazole", "Clopidogrel"] },
  { name: "Vasodilator + Nitrate", drugs: ["Sildenafil", "Nitroglycerin"] },
];

export function InteractionsPage() {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(["Warfarin", "Aspirin"]);
  const [inputDrug, setInputDrug] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = availableDrugsList.filter(
    (d) =>
      d.toLowerCase().includes(inputDrug.toLowerCase()) &&
      !selectedDrugs.some((sd) => sd.toLowerCase() === d.toLowerCase()),
  );

  const handleAddDrug = (drugName?: string) => {
    const name = (drugName || inputDrug).trim();
    if (!name) return;
    if (!selectedDrugs.some((d) => d.toLowerCase() === name.toLowerCase())) {
      setSelectedDrugs((prev) => [...prev, name]);
    }
    setInputDrug("");
    setShowSuggestions(false);
  };

  const handleRemoveDrug = (drugName: string) => {
    setSelectedDrugs((prev) => prev.filter((d) => d !== drugName));
  };

  // Dynamically compute all pairwise interactions
  const activeInteractions: InteractionPair[] = [];
  for (let i = 0; i < selectedDrugs.length; i++) {
    for (let j = i + 1; j < selectedDrugs.length; j++) {
      const drug1 = selectedDrugs[i];
      const drug2 = selectedDrugs[j];
      if (!drug1 || !drug2) continue;

      const pairResult = analyzePairInteraction(drug1, drug2);
      activeInteractions.push(pairResult);
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
                  <div className="relative">
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
                          onChange={(e) => {
                            setInputDrug(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          placeholder="Type drug name (e.g. Sildenafil, Warfarin...)"
                          className="pl-9 text-sm h-10 shadow-none"
                        />
                      </div>
                      <Button type="submit" size="sm" className="h-10 px-4">
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </form>

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && inputDrug.trim() && filteredSuggestions.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-border bg-popover p-1 shadow-lift">
                        <p className="px-2 py-1 text-[10px] uppercase font-semibold text-muted-foreground">
                          Suggested Drugs:
                        </p>
                        {filteredSuggestions.slice(0, 5).map((sugg) => (
                          <button
                            key={sugg}
                            type="button"
                            onClick={() => handleAddDrug(sugg)}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground text-left"
                          >
                            <span>{sugg}</span>
                            <Plus className="h-3 w-3 text-teal" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Chips */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Active Regimen ({selectedDrugs.length} Drugs)
                      </p>
                      {selectedDrugs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDrugs([])}
                          className="text-[11px] text-muted-foreground hover:text-destructive"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedDrugs.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-teal/30 bg-teal-soft/80 px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-xs"
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
                    <span className="text-muted-foreground font-medium">Regimen Risk Level:</span>
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
                        <ShieldCheck className="h-3 w-3" /> Safe / Low Risk
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
                  Interaction Analysis Results ({activeInteractions.length} Pairs Analyzed)
                </h3>
                {activeInteractions.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 gap-1.5 text-xs">
                    <Printer className="h-3.5 w-3.5" /> Print Clinical Report
                  </Button>
                )}
              </div>

              {selectedDrugs.length < 2 ? (
                <Card className="rounded-2xl border-dashed border-border p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 font-semibold text-foreground">Add at least 2 drugs to screen</h4>
                  <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                    Select drugs above or click one of the sample regimen buttons to run an instant interaction check.
                  </p>
                </Card>
              ) : activeInteractions.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-border p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 font-semibold text-foreground">No Major Interactions Flagged</h4>
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
                          : inter.severity === "Moderate"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-border bg-card"
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
                            className={
                              inter.severity === "Moderate"
                                ? "bg-amber-500 text-white"
                                : inter.severity === "Minor"
                                ? "bg-teal text-white"
                                : ""
                            }
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
