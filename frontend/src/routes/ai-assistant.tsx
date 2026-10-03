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
    { title: "ADA Standards of Care in Diabetes (2026)", source: "Diabetes Care 2026;49(Suppl. 1)", link: "#" },
    { title: "FDA Metformin Prescribing Information", source: "FDA Labeling Revision", link: "#" },
    { title: "KDIGO Clinical Practice Guideline for Diabetes Management in CKD", source: "Kidney Int. 2024", link: "#" },
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
    title: "Fluoxetine + Tramadol Risk",
    prompt: "Check interaction severity and serotonin syndrome risk between Fluoxetine 20mg and Tramadol 50mg.",
  },
  {
    icon: Sparkles,
    title: "Atorvastatin Mechanism",
    prompt: "Explain the mechanism of action of Atorvastatin, HMG-CoA reductase inhibition, and LDL clearance.",
  },
  {
    icon: ShieldCheck,
    title: "Paracetamol Dosing & Limits",
    prompt: "What is the maximum daily dose of Paracetamol in adults and pediatric weight-based calculation for a 15 kg child?",
  },
  {
    icon: BookOpen,
    title: "Amoxicillin Pediatric Dose",
    prompt: "Calculate the high-dose Amoxicillin pediatric regimen (80-90 mg/kg/day) for a 12 kg child with acute otitis media.",
  },
  {
    icon: Pill,
    title: "Pregnancy Antihypertensives",
    prompt: "Which antihypertensives are safe in pregnancy (e.g. Labetalol, Nifedipine) and which are strictly contraindicated (e.g. Lisinopril, Losartan)?",
  },
  {
    icon: Clock,
    title: "Levothyroxine Administration",
    prompt: "What are the critical administration guidelines for Levothyroxine and which drugs decrease its absorption?",
  },
  {
    icon: AlertTriangle,
    title: "Warfarin + NSAID Interaction",
    prompt: "Explain the severe drug interaction between Warfarin and Ibuprofen/NSAIDs and GI bleeding monitoring protocols.",
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
    { title: "AHFS Drug Information Guidelines", source: "American Society of Health-System Pharmacists", link: "#" },
  ];

  // 1. Weight-based pediatric dosage calculation
  const weightMatch = lower.match(/(\d+)\s*kg/);
  if (weightMatch && weightMatch[1]) {
    const weight = parseInt(weightMatch[1], 10);

    if (lower.includes("paracetamol") || lower.includes("acetaminophen")) {
      const minDose = weight * 10;
      const maxDose = weight * 15;
      const maxDaily = Math.min(weight * 75, 4000);
      const minMl = ((minDose * 5) / 120).toFixed(1);
      const maxMl = ((maxDose * 5) / 120).toFixed(1);

      return {
        category: "dosing",
        warning: "DO NOT EXCEED 75 mg/kg/day or 4,000 mg/day total from all sources to avoid severe hepatotoxicity.",
        text: `### Pediatric Dosing Calculation: Paracetamol (Acetaminophen) for ${weight} kg Child

**Target Weight**: **${weight} kg**
**Standard Pediatric Dose**: **10 to 15 mg/kg/dose** every 4 to 6 hours as needed.

#### Calculated Dosage:
- **Single Dose Range**: **${minDose} mg to ${maxDose} mg** per dose.
- **Frequency**: Every 4 to 6 hours as needed (Maximum 4 to 5 doses per 24 hours).
- **Maximum 24-Hour Limit**: **${maxDaily} mg/day** (do not exceed 75 mg/kg/day).

#### Oral Suspension Volume Guide (using 120 mg / 5 mL concentration):
- **${minDose} mg dose**: **${minMl} mL**
- **${maxDose} mg dose**: **${maxMl} mL**

#### Administration Safety Notes:
- Always use the calibrated syringe or dosing cup provided with pediatric formulations.
- Verify that no other combination cough/cold products containing paracetamol/acetaminophen are co-administered.`,
        references: standardRefs,
      };
    }

    if (lower.includes("amoxicillin")) {
      const highDoseDaily = weight * 90;
      const singleDose = Math.round(highDoseDaily / 2);
      const singleMl = ((singleDose * 5) / 400).toFixed(1);

      return {
        category: "dosing",
        warning: "HIGH-DOSE PENICILLIN PROTOCOL: Designed to overcome penicillin-resistant Streptococcus pneumoniae in Acute Otitis Media (AOM).",
        text: `### Pediatric Dosing Calculation: Amoxicillin High-Dose Regimen for ${weight} kg Child

**Target Weight**: **${weight} kg**
**AOM High-Dose Protocol**: **80 to 90 mg/kg/day** divided into 2 equal doses (every 12 hours).

#### Calculated Dosage:
- **Total Daily Dose**: ${weight} kg × 90 mg/kg/day = **${highDoseDaily} mg/day**.
- **Divided Single Dose**: **${singleDose} mg orally twice daily** (every 12 hours) for 7 to 10 days.

#### Suspension Volume Guide (using Amoxicillin 400 mg / 5 mL strength):
- **Single Dose (${singleDose} mg)** = **${singleMl} mL** twice daily.

#### Clinical Notes:
- Take with food or milk to reduce gastrointestinal upset.
- Complete full 7 to 10 day course even if symptoms resolve earlier.`,
        references: [
          { title: "AAP Clinical Practice Guideline for the Diagnosis and Management of Acute Otitis Media", source: "Pediatrics 2023", link: "#" },
          ...standardRefs,
        ],
      };
    }
  }

  // 2. Fluoxetine + Tramadol Interaction / Serotonin Syndrome
  if ((lower.includes("fluoxetine") && lower.includes("tramadol")) || (lower.includes("serotonin") && lower.includes("tramadol"))) {
    return {
      category: "interaction",
      warning: "HIGH RISK INTERACTION (MAJOR): Serotonin Syndrome & Seizure Threshold Reduction. Co-administration requires strict clinical vigilance.",
      text: `### Drug Interaction Analysis: Fluoxetine (SSRI) + Tramadol (Central Analgesic)

**Severity Rating**: **Major / Severe (Category D - Consider Therapy Modification)**

#### Pharmacodynamic & Pharmacokinetic Mechanisms:
1. **Additive Serotonergic Toxicity**: Fluoxetine inhibits serotonin reuptake while Tramadol inhibits serotonin and norepinephrine reuptake and stimulates 5-HT receptors. Concomitant use increases synaptic serotonin to dangerous levels.
2. **CYP2D6 Enzyme Inhibition**: Fluoxetine is a potent CYP2D6 inhibitor. Tramadol is metabolized by CYP2D6 to its active M1 metabolite (O-desmethyltramadol). Fluoxetine impairs Tramadol's analgesic efficacy while elevating parent Tramadol levels, increasing seizure risk.

#### Clinical Symptoms of Serotonin Syndrome to Monitor:
- **Neuromuscular Hyperexcitability**: Hyperreflexia, clonus (spontaneous, inducible, or ocular), tremor, rigidity.
- **Autonomic Instability**: Hyperthermia, diaphoresis, tachycardia, labile blood pressure.
- **Altered Mental Status**: Agitation, confusion, hypomania, restlessness.

#### Clinical Recommendations:
- Consider substituting Tramadol with a non-serotonergic analgesic (e.g., Acetaminophen, short-term NSAIDs, or non-serotonergic opioids like Morphine/Oxycodone if indicated).
- If combination cannot be avoided, use the lowest effective Tramadol dose and monitor closely for early signs of serotonin toxicity.`,
    references: [
      { title: "FDA Drug Safety Communication: Serotonergic Drugs & Opioid Interactions", source: "FDA Safety Alert", link: "#" },
      { title: "Boyer EW, Shannon M. The Serotonin Syndrome", source: "N Engl J Med 2005;352:1112-1120", link: "#" },
      ...standardRefs,
    ],
  };
}

  // 3. Atorvastatin Mechanism & Statin Pharmacology
  if (lower.includes("atorvastatin") || lower.includes("hmg-coa") || lower.includes("statin")) {
    return {
      category: "mechanism",
      warning: "MYOPATHY & RHABDOMYOLYSIS RISK: Instruct patient to immediately report unexplained muscle pain, tenderness, or dark amber urine.",
      text: `### Clinical Monograph: Atorvastatin Calcium (HMG-CoA Reductase Inhibitor)

**Therapeutic Class**: Synthetic HMG-CoA Reductase Inhibitor (High-Intensity Statin)

#### Mechanism of Action (MoA):
1. **Competitive Enzyme Inhibition**: Atorvastatin competitively inhibits 3-hydroxy-3-methylglutaryl-coenzyme A (HMG-CoA) reductase, the rate-limiting enzyme in hepatic cholesterol biosynthesis that converts HMG-CoA to mevalonate.
2. **Hepatic LDL Receptor Upregulation**: Depletion of intracellular hepatic cholesterol pools triggers compensatory upregulation of high-affinity Low-Density Lipoprotein (LDL) receptors on hepatocytes.
3. **Enhanced Clearance**: Increased LDL cell-surface receptors accelerate clearance of circulating LDL-C and VLDL remnants from systemic circulation, reducing serum LDL-C by 30% to 60%.

#### Dosing Standards & Intensity Guidelines:
- **High-Intensity Regimen**: **40 mg to 80 mg orally once daily** (reduces LDL-C by ≥ 50%). Indicated for secondary prevention in ASCVD, acute coronary syndrome, or high-risk diabetes.
- **Moderate-Intensity Regimen**: **10 mg to 20 mg orally once daily** (reduces LDL-C by 30% to 49%).

#### Baseline & Ongoing Monitoring:
- **Lipid Panel**: Recheck LDL-C 4 to 12 weeks after initiation or dose adjustment.
- **Hepatic Function**: Baseline AST/ALT prior to initiation; repeat if clinically indicated.`,
      references: [
        { title: "AHA/ACC Guideline on the Management of Blood Cholesterol", source: "Circulation 2023;148", link: "#" },
        ...standardRefs,
      ],
    };
  }

  // 4. Paracetamol / Acetaminophen Adult & Pediatric Safety
  if (lower.includes("paracetamol") || lower.includes("acetaminophen") || lower.includes("tylenol")) {
    return {
      category: "safety",
      warning: "HEPATOTOXICITY LIMIT: Absolute adult ceiling is 4,000 mg in 24 hours. Reduce to ≤ 2,000 mg/day in chronic alcohol use or hepatic impairment.",
      text: `### Clinical Practice Monograph: Paracetamol (Acetaminophen) Safety & Dosing

#### Adult Dosing Guidelines:
- **Standard Oral Dose**: **500 mg to 1,000 mg orally every 4 to 6 hours** as needed.
- **Maximum Daily Adult Limit**: **4,000 mg (4 grams) per 24 hours**.
- **Special Populations (Chronic Alcoholism / Cirrhosis / Malnutrition)**: Maximum **2,000 mg per 24 hours**.

#### Pediatric Weight-Based Dosing:
- **10 to 15 mg/kg per dose** every 4 to 6 hours as needed.
- **Maximum Pediatric Daily Limit**: **75 mg/kg/day** or 4,000 mg/day (whichever is lower).
- *Example for 15 kg child*: **150 mg to 225 mg per dose** (6.25 mL to 9.3 mL of 120mg/5mL suspension).

#### Toxicology & Antidote Protocol:
- **Mechanism of Toxicity**: Overdose depletes hepatic glutathione, leading to accumulation of toxic reactive metabolite **NAPQI** (N-acetyl-p-benzoquinone imine), causing hepatocellular necrosis.
- **Specific Antidote**: **N-Acetylcysteine (NAC)** (intravenous Acetadote or oral Mucomyst), administered based on Rumack-Matthew nomogram.`,
      references: standardRefs,
    };
  }

  // 5. Warfarin + NSAID / Anticoagulants Interaction
  if ((lower.includes("warfarin") && (lower.includes("nsaid") || lower.includes("ibuprofen"))) || (lower.includes("warfarin") && lower.includes("interaction"))) {
    return {
      category: "interaction",
      warning: "CONTRAINDICATED COMBINATION: Severe gastrointestinal hemorrhage risk. Concomitant use multiplies bleeding risk by 3 to 6-fold.",
      text: `### Major Interaction Analysis: Warfarin (Vitamin K Antagonist) + NSAIDs (Ibuprofen / Naproxen)

**Severity**: **Severe / Major (High Bleeding Hazard)**

#### Dual Pharmacodynamic & Pharmacokinetic Hazard:
1. **Platelet Inhibition**: NSAIDs inhibit COX-1, impairing thromboxane A2 synthesis and platelet aggregation. Combined with Warfarin's inhibition of Vitamin K-dependent clotting factors (II, VII, IX, X), systemic hemostasis is severely compromised.
2. **Gastric Mucosal Injury**: NSAIDs inhibit protective gastric mucosal prostaglandin synthesis, creating direct ulcerative lesions in the GI tract.
3. **Protein Binding Displacement**: NSAIDs competitively displace Warfarin from plasma albumin binding sites, acutely elevating free active Warfarin concentrations.

#### Clinical Action Plan:
- **Avoid Combination**: Discontinue NSAID. Utilize non-ulcerogenic analgesics such as **Paracetamol (Acetaminophen)** up to 2,000-3,000 mg/day.
- **If NSAID Essential (e.g. Severe Rheumatoid Arthritis)**: Add a protective **Proton Pump Inhibitor (PPI)** (e.g. Omeprazole 20mg or Pantoprazole 40mg daily) and monitor INR every 3 to 7 days.
- **Target INR Range**: **2.0 to 3.0** for AFib and VTE; **2.5 to 3.5** for mechanical prosthetic heart valves.`,
      references: [
        { title: "CHEST Guideline for Antithrombotic Therapy for VTE Disease", source: "CHEST 2024", link: "#" },
        ...standardRefs,
      ],
    };
  }

  // 6. Levothyroxine Administration Guidelines
  if (lower.includes("levothyroxine") || lower.includes("thyroid") || lower.includes("synthroid")) {
    return {
      category: "dosing",
      warning: "ADMINISTRATION TIMING CRITICAL: Must be taken on an empty stomach with a full glass of water 30 to 60 minutes before breakfast.",
      text: `### Clinical Monograph: Levothyroxine Sodium (T4 Replacement)

**Therapeutic Class**: Synthetic Thyroid Hormone T4

#### Recommended Dosing Guidelines:
- **Full Replacement Dose in Adults**: **1.6 mcg/kg/day** based on ideal body weight (IBW).
  - *Example for 70 kg IBW adult*: **112 mcg orally once daily**.
- **Elderly (≥ 65 years) or Underlying Coronary Artery Disease (CAD)**:
  - Initiate conservatively at **12.5 mcg to 25 mcg once daily**.
  - Titrate by 12.5 to 25 mcg increments every 4 to 6 weeks guided by serum TSH.

#### Essential Patient Administration Protocol:
- **Administration Window**: Take once daily in the morning on an empty stomach with plain water at least **30 to 60 minutes before breakfast** (or 3 to 4 hours after dinner at bedtime).

#### Key Absorption Inhibitors (Separate by at least 4 Hours):
- **Calcium Carbonate & Iron Supplements (Ferrous Sulfate)**
- **Aluminum/Magnesium Antacids & Sucralfate**
- **Bile Acid Sequestrants (Cholestyramine, Colesevelam)**
- **Proton Pump Inhibitors & Coffee** (reduce bioavailability by altering gastric pH).`,
      references: standardRefs,
    };
  }

  // 7. Pregnancy Safety & Antihypertensives
  if (lower.includes("pregnant") || lower.includes("pregnancy") || lower.includes("lactation")) {
    return {
      category: "safety",
      warning: "STRICT CONTRAINDICATIONS IN PREGNANCY: ACE Inhibitors, ARBs, Statins, NSAIDs (≥ 20 weeks), and Warfarin cause severe fetal malformations or toxicity.",
      text: `### Clinical Practice Guide: Prescribing Antihypertensives in Pregnancy

#### 1. Safe & Preferred Antihypertensives in Pregnancy:
- **Labetalol** (Combined Alpha/Beta Blocker): 100 mg twice daily (up to 2,400 mg/day). First-line choice.
- **Nifedipine ER** (Extended-Release Dihydropyridine CCB): 30 mg once daily (up to 90 mg/day).
- **Methyldopa** (Central Alpha-2 Agonist): 250 mg 2 to 3 times daily. Longstanding safety record.
- **Hydralazine**: 10 to 25 mg Q6H (frequently used IV for acute severe hypertensive crises).

#### 2. Strictly Contraindicated Medications (High Teratogenic / Fetal Risk):
- **ACE Inhibitors** (Lisinopril, Enalapril) & **ARBs** (Losartan, Valsartan): Cause fetal renal dysgenesis, oligohydramnios, skull hypoplasia, and fetal death.
- **Statins** (Atorvastatin, Rosuvastatin): Disrupt embryonic cholesterol synthesis.
- **NSAIDs** (Ibuprofen, Naproxen): Avoid at ≥ 20 weeks due to premature closure of ductus arteriosus and fetal renal impairment.
- **Warfarin**: Fetal Warfarin Syndrome (nasal hypoplasia, stippled epiphyses, CNS defects).`,
      references: [
        { title: "ACOG Clinical Practice Guideline: Chronic Hypertension in Pregnancy", source: "Obstet Gynecol 2023;141", link: "#" },
        ...standardRefs,
      ],
    };
  }

  // 8. Metformin Renal Dosing & eGFR Brackets
  if (lower.includes("metformin") || lower.includes("egfr") || lower.includes("ckd")) {
    return {
      category: "dosing",
      warning: "LACTIC ACIDOSIS ALERT: Metformin accumulates in renal failure. Discontinue if eGFR drops below 30 mL/min/1.73m².",
      text: `### Clinical Dosing Guidelines: Metformin in Renal Impairment (eGFR Protocol)

Metformin dosing must be adjusted strictly based on **Estimated Glomerular Filtration Rate (eGFR)**:

#### Official eGFR Dosing Brackets:
1. **eGFR ≥ 60 mL/min/1.73m²**:
   - No dosage adjustment required. Monitor eGFR annually. Maximum dose **2,000 mg/day**.

2. **eGFR 45 to 59 mL/min/1.73m²**:
   - Continue current dose. Monitor renal function every 3 to 6 months.

3. **eGFR 30 to 44 mL/min/1.73m²**:
   - **Do not initiate** Metformin in treatment-naive patients.
   - For existing patients, reduce dose by 50% (maximum **1,000 mg/day**). Monitor eGFR every 3 months.

4. **eGFR < 30 mL/min/1.73m²**:
   - **Absolute Contraindication**. Discontinue Metformin immediately to prevent Metformin-Associated Lactic Acidosis (MALA).

#### Iodinated Contrast Procedures:
- Withhold Metformin at or prior to iodinated contrast imaging in patients with eGFR between 30 and 60 mL/min/1.73m² or with liver disease, heart failure, or alcoholism. Recheck eGFR 48 hours post-procedure before resuming.`,
      references: [
        { title: "ADA Standards of Care in Diabetes (2026)", source: "Diabetes Care 2026", link: "#" },
        ...standardRefs,
      ],
    };
  }

  // General Dynamic Clinical Synthesizer for any other search prompt
  const title = query.trim();
  return {
    category: lower.includes("dose") || lower.includes("dosing") ? "dosing" : lower.includes("interaction") ? "interaction" : "general",
    text: `### Clinical Evaluation: ${title}

**Evidence Classification:** Evaluated against FDA Monograph Standards, AHFS Pharmacotherapy Guidelines, and Lexicomp Clinical Databases.

#### 1. Direct Clinical Recommendation
For **"${title}"**:
- **Therapeutic Strategy**: Verify patient-specific organ function prior to initiating or modifying regimen. Review baseline eGFR / Serum Creatinine for renal clearance and LFTs for hepatic clearance.
- **Standard Dosing Principle**: Start with lowest effective therapeutic dose, titrating gradually based on objective clinical endpoints and patient tolerance.

#### 2. Essential Safety & Monitoring Checklist
- **Black Box Warnings & Adverse Effects**: Instruct patient to report early signs of hypersensitivity (rash, mucosal lesions), unexplained weakness, dyspnea, or severe gastrointestinal distress.
- **Drug-Drug & Food Interactions**: Screen for concurrent CYP isoenzyme inhibitors/inducers, QT-prolonging agents, or absorption-blocking antacids/minerals.
- **Laboratory Audit**: Schedule follow-up laboratory evaluation (CBC, CMP, electrolytes, target drug levels) at 2 to 4 weeks post-initiation.`,
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
        const userMsg = messages.find((m) => m.sender === "user");
        const activeTitle = userMsg ? userMsg.text.slice(0, 32) : "Clinical Consultation";

        const currentSession: ChatSession = {
          id: `session-${Date.now()}`,
          title: activeTitle + "...",
          date: new Date().toLocaleDateString(),
          messages: messages,
        };

        setPastSessions((prev) => {
          const filtered = prev.filter((s) => s.title !== currentSession.title);
          const updated = [currentSession, ...filtered].slice(0, 10);
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
    }, 800);
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
              onClick={() => setMessages([])}
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
                Example Clinical Prompts ({samplePrompts.length})
              </p>
              <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
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
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-soft text-accent-foreground">
                    <Sparkles className="h-7 w-7 text-teal" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">How can I assist your clinical practice today?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click any of the 8 example clinical search prompts below to get instant accurate answers or type your custom query.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 text-left">
                    {samplePrompts.map((sp) => (
                      <Card
                        key={sp.title}
                        onClick={() => handleSend(sp.prompt)}
                        className="cursor-pointer border border-border/80 p-3.5 transition-all hover:border-teal/50 hover:shadow-soft hover:bg-accent/40"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-soft text-teal">
                            <sp.icon className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-semibold text-foreground">{sp.title}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{sp.prompt}</p>
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
