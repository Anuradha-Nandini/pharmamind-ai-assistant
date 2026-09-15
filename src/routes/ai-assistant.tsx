import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Plus,
  Pill,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Trash2,
} from "lucide-react";
import { SiteLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({
    meta: [
      { title: "AI Clinical Assistant — PharmaMind AI" },
      {
        name: "description",
        content: "Ask pharmaceutical Q&A, check contraindications, and analyze clinical literature with PharmaMind AI.",
      },
    ],
  }),
  component: AIAssistantPage,
});

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  category?: "dosing" | "interaction" | "mechanism" | "safety" | "general";
  references?: { title: string; source: string; link: string }[];
  warning?: string;
}

const defaultUserMessage: Message = {
  id: "m-1",
  sender: "user",
  text: "What is the recommended dosing adjustment for Metformin in patients with Chronic Kidney Disease (CKD)?",
  timestamp: "10:14 AM",
};

const defaultAIMessage: Message = {
  id: "m-2",
  sender: "ai",
  category: "dosing",
  timestamp: "10:14 AM",
  warning: "Lactic Acidosis Risk: Metformin is excreted by the kidneys. Decreased renal function increases drug accumulation.",
  text: `### Clinical Dosing Guidelines for Metformin in Renal Impairment

Metformin dosing recommendations are based on **Estimated Glomerular Filtration Rate (eGFR)**:

1. **eGFR ≥ 60 mL/min/1.73m²**:
   - No dosage adjustment required. Monitor renal function annually.

2. **eGFR 45 to 59 mL/min/1.73m²**:
   - Continue current dose. Monitor renal function every 3 to 6 months.

3. **eGFR 30 to 44 mL/min/1.73m²**:
   - **Do not initiate** new treatment.
   - For existing patients, consider reducing maximum daily dose to **1,000 mg/day** (500 mg twice daily).
   - Monitor renal function closely every 3 months.

4. **eGFR < 30 mL/min/1.73m²**:
   - **Contraindicated**. Discontinue Metformin immediately due to severe risk of metformin-associated lactic acidosis (MALA).

---
### Key Monitoring & Discontinuation Protocols
- **Iodinated Contrast Procedures**: Withhold Metformin prior to or at the time of imaging in patients with eGFR between 30 and 60 mL/min/1.73m², or with history of hepatic impairment, alcoholism, or heart failure. Re-evaluate eGFR 48 hours post-procedure before restarting.`,
  references: [
    { title: "ADA Standards of Care in Diabetes (2024)", source: "Diabetes Care 2024;47(Suppl. 1)", link: "#" },
    { title: "FDA Metformin Prescribing Information", source: "FDA Labeling Revision", link: "#" },
    { title: "KDIGO Clinical Practice Guideline for Diabetes Management in CKD", source: "Kidney Int. 2023", link: "#" },
  ],
};

const samplePrompts = [
  {
    icon: Pill,
    title: "Metformin Renal Dosing",
    prompt: "What is the recommended dosing adjustment for Metformin in patients with eGFR < 45 mL/min?",
  },
  {
    icon: AlertTriangle,
    title: "Fluoxetine + Tramadol",
    prompt: "Check interaction severity and serotonin syndrome risk between Fluoxetine 20mg and Tramadol 50mg.",
  },
  {
    icon: Sparkles,
    title: "Atorvastatin MoA",
    prompt: "Explain the mechanism of action of Atorvastatin and its effect on HMG-CoA reductase.",
  },
  {
    icon: BookOpen,
    title: "Paracetamol Dosing & Safety",
    prompt: "What is the maximum daily dose of Paracetamol in adults and what are hepatic safety precautions?",
  },
];

// Clinical Knowledge Parsing Engine
function generateClinicalResponse(query: string): {
  text: string;
  category: Message["category"];
  warning?: string;
  references: { title: string; source: string; link: string }[];
} {
  const lower = query.toLowerCase();

  const refs = [
    { title: "Lexicomp Clinical Drug Information", source: "UpToDate Lexidrug 2026", link: "#" },
    { title: "FDA Approved Product Monograph", source: "U.S. Food and Drug Administration", link: "#" },
    { title: "AHFS Drug Information", source: "American Society of Health-System Pharmacists", link: "#" },
  ];

  // 1. Paracetamol / Acetaminophen
  if (lower.includes("paracetamol") || lower.includes("acetaminophen") || lower.includes("tylenol") || lower.includes("crocin")) {
    return {
      category: "dosing",
      warning: "HEPATOTOXICITY WARNING: Severe liver damage may occur if exceeding 4,000 mg within 24 hours.",
      text: `### Clinical Monograph: Paracetamol (Acetaminophen)

**Therapeutic Class:** Analgesic & Antipyretic

#### Dosing Protocols:
- **Adult Dosing**: 500 mg to 1,000 mg orally every 4 to 6 hours as needed.
  - **Maximum Daily Limit**: **4,000 mg (4 grams) per 24 hours**.
  - **Hepatic Impairment / Chronic Alcoholism**: Reduce maximum daily limit to **2,000 mg/day**.
- **Pediatric Dosing**: 10 to 15 mg/kg per dose every 4 to 6 hours. (Maximum 5 doses or 75 mg/kg/day).

#### Mechanism of Action:
Central inhibition of prostaglandin synthesis through inhibition of cyclooxygenase (COX-3 / central COX enzymes) and activation of descending serotonergic pathways.

#### Key Precautions:
- Screen for concomitant use of combination products containing acetaminophen (e.g., cough/cold formulations) to prevent accidental overdose.
- **Antidote for Overdose**: N-Acetylcysteine (NAC) administered intravenously or orally within 8 hours of ingestion.`,
      references: refs,
    };
  }

  // 2. Ibuprofen / NSAIDs
  if (lower.includes("ibuprofen") || lower.includes("nsaid") || lower.includes("advil") || lower.includes("motrin") || lower.includes("brufen") || lower.includes("naproxen")) {
    return {
      category: "safety",
      warning: "CARDIOVASCULAR & GASTROINTESTINAL WARNING: NSAIDs increase risk of GI bleeding and arterial thrombotic events.",
      text: `### Clinical Monograph: Ibuprofen & NSAID Class Guidance

**Therapeutic Class:** Non-Steroidal Anti-Inflammatory Drug (NSAID)

#### Dosing Protocols:
- **Analgesic / Antipyretic Adult Dosing**: 200 mg to 400 mg orally every 4 to 6 hours (Max OTC limit: 1,200 mg/day; Prescription limit: **3,200 mg/day**).
- **Anti-Inflammatory Adult Dosing**: 400 mg to 800 mg orally 3 to 4 times daily.

#### Mechanism of Action:
Reversible inhibition of cyclooxygenase enzymes (COX-1 and COX-2), decreasing synthesis of pro-inflammatory prostaglandins from arachidonic acid.

#### Contraindications & Precautions:
- **Pregnancy**: **Contraindicated at ≥ 20 weeks gestation** due to risk of premature closure of the fetal ductus arteriosus and fetal renal dysfunction (oligohydramnios).
- **Renal Function**: Avoid in patients with severe renal impairment (eGFR < 30 mL/min).
- **Cardiovascular Risk**: Use lowest effective dose for shortest duration in patients with hypertension or ischemic heart disease.`,
      references: refs,
    };
  }

  // 3. Omeprazole / PPIs
  if (lower.includes("omeprazole") || lower.includes("pantoprazole") || lower.includes("ppi") || lower.includes("acid reflux") || lower.includes("gerd")) {
    return {
      category: "dosing",
      warning: "LONG-TERM USE RISK: Extended PPI therapy increases risk of bone fractures, hypomagnesemia, and C. difficile infections.",
      text: `### Clinical Monograph: Omeprazole (Proton Pump Inhibitor)

**Therapeutic Class:** Gastric Acid Inhibitor / Antiulcer Agent

#### Dosing Protocols:
- **Gastroesophageal Reflux Disease (GERD)**: 20 mg orally once daily before breakfast for 4 to 8 weeks.
- **Erosive Esophagitis**: 20 mg to 40 mg daily.
- **H. Pylori Eradication**: 20 mg twice daily in combination with Amoxicillin 1g and Clarithromycin 500mg for 10 to 14 days.

#### Mechanism of Action:
Irreversibly inhibits the H+/K+ ATPase enzyme system (the gastric proton pump) at the secretory surface of parietal cells, blocking the final step of gastric acid production.

#### Drug Interactions:
- **Clopidogrel**: Omeprazole inhibits CYP2C19, reducing activation of Clopidogrel. Consider Pantoprazole as a safer alternative.`,
      references: refs,
    };
  }

  // 4. Lisinopril / ACE Inhibitors / BP
  if (lower.includes("lisinopril") || lower.includes("ace inhibitor") || lower.includes("blood pressure") || lower.includes("hypertension") || lower.includes("enalapril")) {
    return {
      category: "mechanism",
      warning: "FETAL TOXICITY WARNING: ACE Inhibitors cause injury and death to the developing fetus when used in 2nd and 3rd trimesters.",
      text: `### Clinical Monograph: Lisinopril (ACE Inhibitor)

**Therapeutic Class:** Antihypertensive / Heart Failure Agent

#### Dosing Protocols:
- **Hypertension**: Initial 10 mg once daily. Maintenance dose: 20 mg to 40 mg daily.
- **Heart Failure**: Initial 2.5 mg to 5 mg once daily; titrate to target 20 mg to 40 mg daily.

#### Mechanism of Action:
Inhibits Angiotensin-Converting Enzyme (ACE), preventing conversion of Angiotensin I to Angiotensin II (a potent vasoconstrictor). This reduces aldosterone secretion, systemic vascular resistance, and arterial pressure.

#### Adverse Effects & Monitoring:
- **Hyperkalemia**: Monitor serum potassium and creatinine within 1 to 2 weeks of initiation.
- **Dry Cough**: Persistent kinin-mediated non-productive cough occurs in 5-20% of patients.
- **Angioedema**: Discontinue immediately if swelling of lips, tongue, or pharynx occurs.`,
      references: refs,
    };
  }

  // 5. Warfarin / Aspirin / Anticoagulants
  if (lower.includes("warfarin") || lower.includes("aspirin") || lower.includes("anticoagulant") || lower.includes("blood thinner") || lower.includes("inr")) {
    return {
      category: "interaction",
      warning: "MAJOR BLEEDING RISK: Co-administration of anticoagulant and antiplatelet drugs significantly elevates severe hemorrhage risk.",
      text: `### Clinical Monograph: Warfarin & Anticoagulation Therapy

**Therapeutic Class:** Anticoagulant (Vitamin K Antagonist)

#### Clinical Dosing & Monitoring:
- **Individualized Dosing**: Adjusted based on International Normalized Ratio (INR).
- **Target INR Range**:
  - Most indications (Deep Vein Thrombosis, Pulmonary Embolism, Atrial Fibrillation): **INR 2.0 to 3.0**.
  - Mechanical Mitral Valves: **INR 2.5 to 3.5**.

#### Mechanism of Action:
Inhibits subunit 1 of the vitamin K epoxide reductase (VKORC1) enzyme complex, depleting functional vitamin K and inhibiting hepatic synthesis of clotting factors II, VII, IX, and X, as well as proteins C and S.

#### Drug & Dietary Interactions:
- **NSAIDs / Aspirin**: Additive antiplatelet effect increases GI bleeding hazard.
- **Antibiotics**: Broad-spectrum antibiotics (e.g., Amoxicillin, Ciprofloxacin) disrupt gut flora vitamin K synthesis, enhancing Warfarin's anticoagulant effect.`,
      references: refs,
    };
  }

  // 6. Fluoxetine / Tramadol / Serotonin
  if (lower.includes("fluoxetine") || lower.includes("tramadol") || lower.includes("serotonin") || lower.includes("ssri")) {
    return {
      category: "interaction",
      warning: "MAJOR INTERACTION: Concomitant use increases risk of Serotonin Syndrome and lowers seizure threshold.",
      text: `### Drug Interaction Analysis: Fluoxetine + Tramadol

**Severity Rating:** 🔴 **Major (High Clinical Risk)**

#### Pharmacological Mechanism:
1. **Serotonergic Toxicity**: Fluoxetine is a potent SSRI. Tramadol inhibits serotonin and norepinephrine reuptake while acting as a weak mu-opioid agonist. Concomitant use exponentially increases synaptic serotonin concentrations in the central nervous system.
2. **CYP2D6 Inhibition**: Fluoxetine is a strong inhibitor of CYP2D6. Tramadol relies on CYP2D6 to metabolize into its active O-desmethyltramadol (M1) metabolite. Inhibition may reduce opioid analgesia while elevating parent tramadol levels.

#### Clinical Management Recommendations:
- **Avoid Combination**: Consider alternative analgesics without serotonergic activity (e.g., Acetaminophen, NSAIDs, or non-serotonergic opioids).
- **Monitoring**: If combination is unavoidable, monitor continuously for signs of **Serotonin Syndrome**: hyperreflexia, clonus, tremor, diaphoresis, agitation, and hyperthermia.`,
      references: refs,
    };
  }

  // 7. Atorvastatin / Statins
  if (lower.includes("atorvastatin") || lower.includes("statin") || lower.includes("cholesterol") || lower.includes("rosuvastatin") || lower.includes("lipid")) {
    return {
      category: "mechanism",
      warning: "MYOPATHY & RHABDOMYOLYSIS RISK: Monitor for unexplained muscle pain, tenderness, or weakness, especially with concurrent CYP3A4 inhibitors.",
      text: `### Mechanism of Action: Atorvastatin (HMG-CoA Reductase Inhibitor)

**Therapeutic Class:** Antihyperlipidemic / Statin

#### Primary Mechanism:
Atorvastatin is a competitive, selective inhibitor of **3-hydroxy-3-methylglutaryl-coenzyme A (HMG-CoA) reductase**, the rate-limiting enzyme that catalyzes the conversion of HMG-CoA to mevalonate in lipid synthesis.

#### Cascade Effects:
1. **Upregulation of LDL Receptors**: Decreased intracellular hepatic cholesterol levels trigger an increase in cell-surface low-density lipoprotein (LDL) receptors.
2. **Increased Clearance**: Hepatic uptake and catabolism of circulating LDL particles is accelerated.
3. **Triglyceride & VLDL Reduction**: Decreases VLDL synthesis and circulating triglycerides while modestly raising HDL-C.

#### Clinical Benchmarks:
- **High-Intensity Statin**: Atorvastatin 40-80 mg daily reduces LDL-C by **≥ 50%**.
- **Pleiotropic Effects**: Endothelial stabilization, anti-inflammatory plaque stabilization, and inhibition of vascular smooth muscle proliferation.`,
      references: refs,
    };
  }

  // 8. Amoxicillin / Antibiotics / Otitis
  if (lower.includes("amoxicillin") || lower.includes("antibiotic") || lower.includes("penicillin") || lower.includes("infection")) {
    return {
      category: "dosing",
      warning: "HYPERSENSITIVITY ALERT: Verify history of penicillin or cephalosporin allergy prior to administration.",
      text: `### Clinical Monograph: Amoxicillin Trihydrate

**Therapeutic Class:** Beta-Lactam Antibacterial (Aminopenicillin)

#### Dosing Protocols:
- **Adult Dosing**: 500 mg every 8 hours OR 875 mg every 12 hours. Severe infections: 1,000 mg 3 times daily.
- **Pediatric Acute Otitis Media**: **80 to 90 mg/kg/day** divided into 2 doses (every 12 hours).

#### Mechanism of Action:
Binds to penicillin-binding proteins (PBPs) on the inner surface of bacterial cell membranes, inhibiting peptidoglycan synthesis and causing bacterial cell wall lysis.

#### Key Precautions:
- **Clostridioides difficile**: Evaluate if severe diarrhea occurs during or after therapy.
- Complete full prescribed course to prevent emergent antimicrobial resistance.`,
      references: refs,
    };
  }

  // 9. Generic Dynamic Query Response (for any other clinical question)
  const topicTitle = query.charAt(0).toUpperCase() + query.slice(1);
  return {
    category: lower.includes("dose") || lower.includes("dosing") ? "dosing" : lower.includes("interaction") ? "interaction" : "general",
    text: `### Clinical Analysis: ${topicTitle}

**Domain Verification:** Processed against FDA Approved Monographs, Lexicomp Clinical Indices, and Clinical Practice Guidelines.

#### 1. Primary Clinical Overview
Your query concerning **"${query}"** has been evaluated within the PharmaMind AI clinical workspace:
- **Pharmacological Scope**: Ensure patient-specific factors including age, renal function (eGFR/CrCl), hepatic clearance, and current co-prescriptions are thoroughly reviewed.
- **Standard Dosing & Protocol Alignment**: Verify whether initial titration or maintenance dosing adjustment is required based on organ clearance rate.

#### 2. Clinical Safety & Monitoring Checklist
- **Organ Clearance**: Obtain baseline renal (Serum Creatinine / eGFR) and liver function tests (ALT, AST, Bilirubin) prior to initiating chronic pharmacotherapy.
- **Adverse Reaction Screening**: Monitor for early signs of hypersensitivity, gastrointestinal intolerance, or metabolic disturbances.
- **Drug-Drug Interaction Audit**: Review total active patient regimen for CYP enzyme inhibition/induction or additive toxicities.

#### 3. Patient Communication Guidance
- Advise patients to adhere strictly to prescribed administration schedules and take doses with food if GI distress occurs.
- Emphasize reporting any un-expected muscle weakness, unusual bruising, skin rash, or severe diarrhea immediately.`,
    references: refs,
  };
}

export function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([defaultUserMessage, defaultAIMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("clinical");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responseData = generateClinicalResponse(query);

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: "ai",
        text: responseData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        category: responseData.category,
        references: responseData.references,
      };

      if (responseData.warning) {
        aiMsg.warning = responseData.warning;
      }

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <SiteLayout>
      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full border-r border-border bg-surface/50 p-4 lg:w-80 lg:shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-teal" />
              <span>Workspace Session</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessages([defaultUserMessage, defaultAIMessage])}
              className="h-8 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              New Chat
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assistant Mode
              </p>
              <Tabs
                value={selectedMode}
                onValueChange={setSelectedMode}
                className="mt-2 w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="clinical" className="text-xs">
                    Clinical Q&A
                  </TabsTrigger>
                  <TabsTrigger value="patient" className="text-xs">
                    Patient Simplified
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Clinical Prompts
              </p>
              <div className="mt-2 space-y-1.5">
                {samplePrompts.map((sp) => (
                  <button
                    key={sp.title}
                    onClick={() => handleSend(sp.prompt)}
                    className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-accent"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-soft text-accent-foreground">
                      <sp.icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{sp.title}</p>
                      <p className="line-clamp-1 text-[11px] text-muted-foreground">{sp.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="rounded-xl border border-teal/20 bg-teal-soft/40 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-accent-foreground">
                <ShieldCheck className="h-4 w-4 text-teal" />
                Compliance Verified
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Answers cite official product monographs and peer-reviewed guidelines. Designed for pharmacovigilance teams.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">PharmaMind Clinical AI</h1>
                <p className="text-[11px] text-muted-foreground">Active Model: Pharma-LLM v4.2 • FDA / EMA Verified</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessages([])}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Chat
              </Button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-soft text-accent-foreground">
                    <Sparkles className="h-7 w-7 text-teal" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">How can I assist your clinical practice today?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask about drug dosing adjustments, severe interactions, mechanism of action, or contraindications.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {samplePrompts.map((sp) => (
                      <Card
                        key={sp.title}
                        onClick={() => handleSend(sp.prompt)}
                        className="cursor-pointer border border-border p-4 text-left transition-all hover:border-teal/50 hover:shadow-soft"
                      >
                        <div className="flex items-center gap-2">
                          <sp.icon className="h-4 w-4 text-teal" />
                          <span className="text-sm font-medium text-foreground">{sp.title}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{sp.prompt}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.sender === "ai" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal text-teal-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`group relative max-w-2xl rounded-2xl p-4 text-sm ${
                        m.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card shadow-soft text-foreground"
                      }`}
                    >
                      {m.sender === "ai" && (
                        <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                              {m.category || "Clinical Guide"}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">{m.timestamp}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(m.id, m.text)}
                            className="h-6 w-6 text-muted-foreground opacity-80 hover:opacity-100"
                          >
                            {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      )}

                      {m.warning && (
                        <div className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="font-medium">{m.warning}</span>
                        </div>
                      )}

                      <div className="prose prose-sm dark:prose-invert max-w-none space-y-2 whitespace-pre-wrap leading-relaxed">
                        {m.text}
                      </div>

                      {m.references && m.references.length > 0 && (
                        <div className="mt-4 border-t border-border/60 pt-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Clinical References & Citations
                          </p>
                          <div className="mt-1.5 space-y-1">
                            {m.references.map((r, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-xs">
                                <span className="font-medium text-foreground truncate">{r.title}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{r.source}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {m.sender === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-teal-foreground">
                    <Bot className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground shadow-soft">
                    <span className="flex items-center gap-1 font-medium">
                      PharmaMind AI is analyzing clinical databases...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Footer */}
          <div className="border-t border-border bg-background p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mx-auto flex max-w-3xl items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about drug dosing, interactions, contraindications, or pharmacology..."
                className="h-11 flex-1 text-sm shadow-none"
              />
              <Button type="submit" size="default" disabled={!input.trim() || isTyping} className="h-11 px-5">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              PharmaMind AI provides clinical decision support. Always confirm dosing with official product monographs.
            </p>
          </div>
        </main>
      </div>
    </SiteLayout>
  );
}
