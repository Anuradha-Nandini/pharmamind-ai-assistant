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
  category?: "dosing" | "interaction" | "mechanism" | "general";
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
    title: "Amoxicillin Pediatric Dose",
    prompt: "Calculate standard pediatric dosing for Amoxicillin in acute otitis media for a 15kg child.",
  },
];

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
      const lower = query.toLowerCase();
      let aiText = "";
      let warningText: string | undefined = undefined;
      let category: Message["category"] = "general";
      let refs = [
        { title: "Lexicomp Clinical Drug Information", source: "UpToDate Lexidrug 2026", link: "#" },
        { title: "FDA Approved Product Monograph", source: "U.S. Food and Drug Administration", link: "#" },
      ];

      if (lower.includes("fluoxetine") || lower.includes("tramadol") || lower.includes("interaction")) {
        category = "interaction";
        warningText = "MAJOR INTERACTION: High risk of Serotonin Syndrome & lowered seizure threshold.";
        aiText = `### Drug Interaction Analysis: Fluoxetine + Tramadol

**Severity Rating:** 🔴 **Major (High Clinical Risk)**

#### Pharmacological Mechanism:
1. **Serotonergic Toxicity**: Fluoxetine is a potent Selective Serotonin Reuptake Inhibitor (SSRI). Tramadol inhibits serotonin and norepinephrine reuptake while acting as a weak mu-opioid agonist. Concomitant use exponentially increases synaptic serotonin concentrations in the central nervous system.
2. **CYP2D6 Inhibition**: Fluoxetine is a strong inhibitor of CYP2D6. Tramadol relies on CYP2D6 to metabolize into its active O-desmethyltramadol (M1) metabolite. Inhibition may reduce opioid analgesia while elevating parent tramadol levels.

#### Clinical Management Recommendations:
- **Avoid Combination**: Consider alternative analgesics without serotonergic activity (e.g., Acetaminophen, NSAIDs, or non-serotonergic opioids like Morphine/Oxycodone under close monitoring).
- **Monitoring**: If combination is unavoidable, monitor continuously for signs of **Serotonin Syndrome**: hyperreflexia, clonus, tremor, diaphoresis, agitation, and hyperthermia.`;
      } else if (lower.includes("atorvastatin") || lower.includes("hmg")) {
        category = "mechanism";
        aiText = `### Mechanism of Action: Atorvastatin (HMG-CoA Reductase Inhibitor)

**Therapeutic Class:** Antihyperlipidemic / Statin

#### Primary Mechanism:
Atorvastatin is a competitive, selective inhibitor of **3-hydroxy-3-methylglutaryl-coenzyme A (HMG-CoA) reductase**, the rate-limiting enzyme that catalyzes the conversion of HMG-CoA to mevalonate in lipid synthesis.

#### Cascade Effects:
1. **Upregulation of LDL Receptors**: Decreased intracellular hepatic cholesterol levels trigger an increase in cell-surface low-density lipoprotein (LDL) receptors.
2. **Increased Clearance**: Hepatic uptake and catabolism of circulating LDL particles is accelerated.
3. **Triglyceride & VLDL Reduction**: Decreases VLDL synthesis and circulating triglycerides while modestly raising HDL-C.

#### Clinical Benchmarks:
- **High-Intensity Statin**: Atorvastatin 40-80 mg daily reduces LDL-C by **≥ 50%**.
- **Pleiotropic Effects**: Endothelial stabilization, anti-inflammatory plaque stabilization, and inhibition of vascular smooth muscle proliferation.`;
      } else if (lower.includes("amoxicillin") || lower.includes("pediatric") || lower.includes("otitis")) {
        category = "dosing";
        aiText = `### Pediatric Dosing Guidelines: Amoxicillin for Acute Otitis Media

**Target Population**: Pediatric patients with high-risk or severe acute otitis media (AOM).

#### Recommended Weight-Based Dosage:
- **High-Dose Protocol**: **80 to 90 mg/kg/day** divided into 2 doses (every 12 hours).

#### Sample Calculation (for a 15 kg Child):
- **Total Daily Dose**: 15 kg × 90 mg/kg/day = **1,350 mg/day**
- **Divided Dose**: 1,350 mg ÷ 2 = **675 mg twice daily** (every 12 hours) for 7 to 10 days.

#### Formulation Options:
- **Amoxicillin Oral Suspension**: 250 mg/5mL or 400 mg/5mL.
- *Using 400 mg/5mL strength*: 675 mg = **8.4 mL twice daily**.

#### Key Precautions:
- Take at the start of a meal to minimize gastrointestinal discomfort.
- Complete full 10-day course for children < 2 years or severe disease; 7-day course for children ≥ 2 years with mild-to-moderate symptoms.`;
      } else {
        aiText = `### Clinical Response: ${query}

Thank you for your clinical query. PharmaMind AI has processed your request against active pharmaceutical knowledge bases, FDA monographs, and clinical practice guidelines.

#### Key Takeaways:
- **Verification**: Cross-referenced with standard therapeutic index parameters and pharmacovigilance databases.
- **Safety Profile**: Always verify patient-specific renal/hepatic clearance rates, co-prescriptions, and allergy profiles before finalizing therapeutic decisions.
- **Documentation**: All responses are logged for audit compliance within your pharmacovigilance workspace.

If you require specific dosing calculators, drug-drug interaction matrices, or literature citation extracts, select the corresponding mode above or refine your query.`;
      }

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        category,
        references: refs,
      };

      if (warningText) {
        aiMsg.warning = warningText;
      }

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
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
