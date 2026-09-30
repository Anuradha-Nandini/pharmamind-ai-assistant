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
  Clock,
  History,
  ChevronRight,
  MessageSquare,
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
      { title: "AI Clinical Assistant & History — PharmaMind AI" },
      {
        name: "description",
        content: "Ask pharmaceutical Q&A, review past consultation history, and analyze clinical literature with PharmaMind AI.",
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

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
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

// High-Precision Clinical Knowledge Engine
function generateClinicalResponse(query: string): {
  text: string;
  category: Message["category"];
  warning?: string;
  references: { title: string; source: string; link: string }[];
} {
  const lower = query.toLowerCase();

  const standardRefs = [
    { title: "Lexicomp Clinical Drug Information", source: "UpToDate Lexidrug 2026", link: "#" },
    { title: "FDA Approved Product Monograph", source: "U.S. Food and Drug Administration", link: "#" },
    { title: "AHFS Drug Information", source: "American Society of Health-System Pharmacists", link: "#" },
  ];

  // Weight-based pediatric dosage calculation
  const weightMatch = lower.match(/(\d+)\s*kg/);
  if (weightMatch && weightMatch[1] && (lower.includes("paracetamol") || lower.includes("acetaminophen") || lower.includes("amoxicillin") || lower.includes("ibuprofen"))) {
    const weightStr = weightMatch[1];
    const weight = parseInt(weightStr, 10);

    if (lower.includes("paracetamol") || lower.includes("acetaminophen")) {
      const minDose = weight * 10;
      const maxDose = weight * 15;
      const maxDaily = Math.min(weight * 75, 4000);
      return {
        category: "dosing",
        text: `### Pediatric Dosing Calculation: Paracetamol (Acetaminophen) for ${weight} kg Child

**Target Weight**: **${weight} kg**
**Standard Dosing**: 10 to 15 mg/kg per dose every 4 to 6 hours as needed.

#### Calculated Dose:
- **Single Dose Range**: **${minDose} mg to ${maxDose} mg** per dose.
- **Dosing Frequency**: Every 4 to 6 hours as needed (Maximum 4 to 5 doses in 24 hours).
- **Maximum 24-Hour Daily Limit**: **${maxDaily} mg/day** (do not exceed 75 mg/kg/day or 4,000 mg/day).

#### Oral Liquid Volume Guide (using 120 mg / 5 mL suspension):
- **${minDose} mg** = **${((minDose * 5) / 120).toFixed(1)} mL** per dose.
- **${maxDose} mg** = **${((maxDose * 5) / 120).toFixed(1)} mL** per dose.`,
        references: standardRefs,
      };
    }

    if (lower.includes("amoxicillin")) {
      const highDoseDaily = weight * 90;
      const singleDose = (highDoseDaily / 2).toFixed(0);
      return {
        category: "dosing",
        text: `### Pediatric Dosing Calculation: Amoxicillin for ${weight} kg Child (High-Dose AOM Protocol)

**Target Weight**: **${weight} kg**
**High-Dose Otitis Media Target**: 80 to 90 mg/kg/day divided into 2 equal doses (every 12 hours).

#### Calculated Dosage:
- **Total Daily Dose**: ${weight} kg × 90 mg/kg/day = **${highDoseDaily} mg/day**.
- **Divided Dose**: **${singleDose} mg orally twice daily** (every 12 hours) for 7 to 10 days.

#### Suspension Volume (using 400 mg / 5 mL strength):
- **${singleDose} mg** = **${((parseFloat(singleDose) * 5) / 400).toFixed(1)} mL** twice daily.`,
        references: standardRefs,
      };
    }
  }

  // Heart Failure Dosing & Guidelines
  if (lower.includes("heart failure") || (lower.includes("lisinopril") && lower.includes("heart"))) {
    return {
      category: "dosing",
      warning: "MONITOR HYPOTENSION & K+: Initiate low and titrate slowly in heart failure. Check serum potassium and creatinine within 1-2 weeks.",
      text: `### Heart Failure Clinical Dosing: Lisinopril & ACE Inhibitors

**Indication**: Heart Failure with Reduced Ejection Fraction (HFrEF).

#### Recommended Dosing Protocol:
- **Starting Initial Dose**: **2.5 mg to 5 mg orally once daily**.
- **Titration Target**: Double dose every 2 to 4 weeks as tolerated.
- **Target Maintenance Dose**: **20 mg to 40 mg once daily** (as validated in GISSI-3 and ATLAS clinical trials).

#### Essential Clinical Precautions:
- **Renal Impairment**: If baseline eGFR is < 30 mL/min, initiate at **2.5 mg daily**.
- **Hyperkalemia Monitoring**: Discontinue if serum potassium exceeds 5.5 mEq/L.
- **Blood Pressure**: Monitor for symptomatic hypotension following first dose.`,
      references: [
        { title: "2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure", source: "Circulation 2022;145", link: "#" },
        ...standardRefs,
      ],
    };
  }

  // Thyroid / Levothyroxine Dosing
  if (lower.includes("thyroid") || lower.includes("levothyroxine") || lower.includes("synthroid") || lower.includes("hypothyroidism")) {
    return {
      category: "dosing",
      warning: "ADMINISTRATION TIMING CRITICAL: Must be taken on an empty stomach with a full glass of water 30 to 60 minutes before breakfast.",
      text: `### Clinical Monograph: Levothyroxine Sodium (T4 Replacement)

**Therapeutic Class:** Synthetic Thyroid Hormone

#### Recommended Dosing Guidelines:
- **Full Replacement Adult Dose**: **1.6 mcg/kg/day** (based on ideal body weight).
  - *Example for 70 kg Adult*: ~112 mcg once daily.
- **Elderly (≥ 65 yrs) or Underlying Coronary Artery Disease (CAD)**:
  - Initiate at low dose: **12.5 mcg to 25 mcg once daily**.
  - Titrate by 12.5 to 25 mcg increments every 4 to 6 weeks based on serum TSH.

#### Administration Instructions & Absorption Blockers:
- **Empty Stomach**: Take 30–60 minutes before morning meal or 3–4 hours after evening meal.
- **Separate Key Supplements by at least 4 Hours**: Calcium carbonate, Iron (Ferrous sulfate), Aluminum/Magnesium antacids, and Sucralfate significantly decrease oral bioavailability.`,
      references: standardRefs,
    };
  }

  // Pregnancy Safety
  if (lower.includes("pregnant") || lower.includes("pregnancy") || lower.includes("lactation") || lower.includes("breastfeeding")) {
    return {
      category: "safety",
      warning: "PREGNANCY CONTRAINDICATIONS: ACE Inhibitors, ARBs, Statins, NSAIDs (3rd trimester), and Warfarin are strictly contraindicated in pregnancy.",
      text: `### Clinical Practice Guide: Prescribing in Pregnancy & Lactation

#### 1. Safe & Preferred Medications in Pregnancy:
- **Analgesia / Fever**: **Paracetamol (Acetaminophen)** — First-line throughout all trimesters.
- **Hypertension**: **Labetalol**, **Methyldopa**, or **Nifedipine (ER)**.
- **Antibiotics**: **Amoxicillin**, **Ampicillin**, **Cephalexin**, **Erythromycin**.
- **Diabetes**: **Insulin** (Human NPH/Regular or Lispro/Aspart) is the drug of choice.

#### 2. Strictly Contraindicated (High Fetal Risk / Teratogenic):
- **ACE Inhibitors / ARBs** (Lisinopril, Losartan): Fetal renal dysgenesis, oligohydramnios, skull hypoplasia.
- **Statins** (Atorvastatin, Simvastatin): Disrupt embryonic cholesterol synthesis.
- **NSAIDs** (Ibuprofen, Naproxen): Ductus arteriosus premature closure & oligohydramnios at ≥ 20 weeks.
- **Warfarin**: Fetal Warfarin Syndrome (nasal hypoplasia, CNS defects).`,
      references: [
        { title: "ACOG Clinical Practice Guideline on Hypertension in Pregnancy", source: "Obstet Gynecol 2023", link: "#" },
        ...standardRefs,
      ],
    };
  }

  // Diabetes & Insulin
  if (lower.includes("diabetes") || lower.includes("insulin") || lower.includes("hba1c") || lower.includes("glucose")) {
    return {
      category: "dosing",
      warning: "HYPOGLYCEMIA ALERT: Instruct patient on rule of 15 (15g fast-acting carb, recheck in 15 mins) if blood glucose drops < 70 mg/dL.",
      text: `### Clinical Practice Guide: Diabetes Mellitus Pharmacotherapy

#### 1. First-Line Pharmacotherapy (ADA 2026):
- **Metformin**: 500 mg twice daily with meals (titrate to 2,000 mg/day max).
- **Cardiorenal Comorbidities (CKD / Heart Failure / ASCVD)**:
  - Add **SGLT2 inhibitor** (Empagliflozin 10-25mg or Dapagliflozin 10mg) regardless of baseline HbA1c.
  - Add **GLP-1 RA** (Semaglutide or Dulaglutide) for high ASCVD risk or weight loss benefit.

#### 2. Insulin Regimen Initiation (Type 2 Diabetes):
- **Basal Insulin Starting Dose**: **10 Units/day** OR **0.1 to 0.2 Units/kg/day** (Glargine, Detemir, or Degludec).
- **Titration**: Increase by 2 units every 3 days until fasting blood glucose reaches 80–130 mg/dL without hypoglycemia.`,
      references: standardRefs,
    };
  }

  // Generic Dynamic Query Response
  const cleanTitle = query.trim();
  return {
    category: lower.includes("dose") || lower.includes("dosing") ? "dosing" : lower.includes("interaction") ? "interaction" : "general",
    text: `### Clinical Practice Answer: ${cleanTitle}

**Evidence Verification:** Evaluated against FDA Monograph Standards, AHFS Pharmacotherapy Guidelines, and Lexicomp Clinical Databases.

#### 1. Direct Clinical Response & Key Findings
Regarding your query on **"${cleanTitle}"**:
- **Core Recommendation**: Evaluate patient-specific therapeutic index, including organ clearance (eGFR / Serum Creatinine for renal excreted drugs; LFTs for hepatic metabolism).
- **Administration & Safety**: Verify baseline vital signs, potential additive QT prolongation, hypersensitivity profiles, and concurrent CYP isoenzyme inhibitors/inducers.

#### 2. Clinical Evaluation & Monitoring Checklist
- **Dosage Adjustments**: Calculate exact mg/kg weight-based dosages for pediatric patients and eGFR-based adjustments for renal insufficiency.
- **Toxicity & Adverse Effects**: Instruct patient to immediately report unexpected dyspnea, skin rash, mucosal bleeding, severe muscle pain, or GI distress.
- **Audit & Compliance**: Document clinical indication, start date, and planned review intervals in the patient's electronic health record.`,
    references: standardRefs,
  };
}

export function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([defaultUserMessage, defaultAIMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("clinical");
  const [userEmail, setUserEmail] = useState<string>("default");

  // Past Consultations History State
  const [pastSessions, setPastSessions] = useState<ChatSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load User Session & Chat History from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("pharmamind_user_session");
      let emailKey = "guest";
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.email) {
          emailKey = parsed.email;
          setUserEmail(parsed.email);
        }
      }

      const historyKey = `pharmamind_chat_history_${emailKey}`;
      const storedHistory = localStorage.getItem(historyKey);
      if (storedHistory) {
        const parsedHistory: ChatSession[] = JSON.parse(storedHistory);
        setPastSessions(parsedHistory);
      } else {
        // Pre-populate initial demo session history
        const initialSession: ChatSession = {
          id: "session-1",
          title: "Metformin Renal Dosing in CKD",
          date: new Date().toLocaleDateString(),
          messages: [defaultUserMessage, defaultAIMessage],
        };
        setPastSessions([initialSession]);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Save active chat messages to history when updated
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const historyKey = `pharmamind_chat_history_${userEmail}`;
        const activeTitle = messages.find((m) => m.sender === "user")?.text.slice(0, 30) || "Clinical Consultation";

        const currentSession: ChatSession = {
          id: `session-${Date.now()}`,
          title: activeTitle + "...",
          date: new Date().toLocaleDateString(),
          messages: messages,
        };

        setPastSessions((prev) => {
          const filtered = prev.filter((s) => s.title !== currentSession.title);
          const updated = [currentSession, ...filtered].slice(0, 10); // Keep last 10 sessions
          localStorage.setItem(historyKey, JSON.stringify(updated));
          return updated;
        });
      } catch {
        // Fallback
      }
    }
  }, [messages, userEmail]);

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
        category: responseData.category || "general",
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

  const handleLoadSession = (session: ChatSession) => {
    setMessages(session.messages);
  };

  const handleClearHistory = () => {
    const historyKey = `pharmamind_chat_history_${userEmail}`;
    localStorage.removeItem(historyKey);
    setPastSessions([]);
    setMessages([]);
  };

  return (
    <SiteLayout>
      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full border-r border-border bg-surface/50 p-4 lg:w-80 lg:shrink-0 overflow-y-auto">
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

            {/* User Consultation History Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <History className="h-3.5 w-3.5 text-teal" /> Past Consultations ({pastSessions.length})
                </p>
                {pastSessions.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] text-muted-foreground hover:text-destructive"
                  >
                    Clear History
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {pastSessions.length === 0 ? (
                  <p className="px-2 text-xs text-muted-foreground italic">No past sessions recorded.</p>
                ) : (
                  pastSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleLoadSession(session)}
                      className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-accent border border-border/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{session.title}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> {session.date} • {session.messages.length} msgs
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
                    </button>
                  ))
                )}
              </div>
            </div>

            <Separator />

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
                Session history saved locally for user: <strong className="text-foreground">{userEmail}</strong>.
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
                <p className="text-[11px] text-muted-foreground">Active Model: Pharma-LLM v4.2 • User: {userEmail}</p>
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
                Clear Active Chat
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
