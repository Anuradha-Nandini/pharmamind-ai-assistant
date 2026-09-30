import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  Search,
  FileText,
  Bookmark,
  Share2,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
} from "lucide-react";
import { SiteLayout, Section } from "@/components/layouts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/knowledge-base")({
  head: () => ({
    meta: [
      { title: "Knowledge Base & Guidelines — PharmaMind AI" },
      {
        name: "description",
        content: "Curated pharmaceutical guidelines, clinical monographs, and FDA drug safety updates organized by medical specialty.",
      },
    ],
  }),
  component: KnowledgeBasePage,
});

interface Article {
  id: string;
  title: string;
  category: "Cardiology" | "Endocrinology" | "Infectious Disease" | "Oncology" | "Pharmacovigilance";
  publishedDate: string;
  source: string;
  evidenceGrade: "Grade A (High)" | "Grade B (Moderate)" | "FDA Communication";
  summary: string;
  readTime: string;
  keyTakeaways: string[];
  fullContent: string;
}

const articlesData: Article[] = [
  {
    id: "kb-1",
    title: "2026 ADA Clinical Practice Guidelines: Diabetes Management in CKD",
    category: "Endocrinology",
    publishedDate: "January 2026",
    source: "American Diabetes Association (ADA)",
    evidenceGrade: "Grade A (High)",
    readTime: "6 min read",
    summary: "Updated guidance on combining SGLT2 inhibitors and GLP-1 receptor agonists with Metformin for optimal renal and cardiovascular protection.",
    keyTakeaways: [
      "SGLT2 inhibitors are recommended for all T2D patients with eGFR ≥ 20 mL/min/1.73m².",
      "Metformin initiation should be avoided if eGFR is between 30 and 44 mL/min/1.73m².",
      "Routine monitoring of urinary albumin-to-creatinine ratio (uACR) is mandated twice yearly.",
    ],
    fullContent: `### Background & Scope
The 2026 ADA Standards of Care provide updated evidence-based guidelines for managing glycemic control and preventing renal disease progression in adults with Type 2 Diabetes Mellitus (T2D) and Chronic Kidney Disease (CKD).

### Key Clinical Recommendations
1. **First-Line Pharmacotherapy**:
   - Combine **Metformin** (if eGFR ≥ 45 mL/min/1.73m²) with an **SGLT2 inhibitor** (e.g., Empagliflozin or Dapagliflozin).
   - Continue SGLT2 inhibitor therapy even if eGFR falls below 30 mL/min/1.73m² until dialysis initiation, unless un-tolerated.

2. **Second-Line Intensification**:
   - For patients not meeting glycemic targets or requiring additional cardiovascular protection, add a long-acting **GLP-1 Receptor Agonist** (e.g., Semaglutide or Dulaglutide) with proven CVD benefits.

3. **Renal Function Monitoring Schedule**:
   - Measure eGFR and urinary albumin-to-creatinine ratio (uACR) at least twice annually in patients with established CKD.`,
  },
  {
    id: "kb-2",
    title: "FDA Safety Alert: Fluoroquinolone Prolonged Disability & Tendon Risk",
    category: "Pharmacovigilance",
    publishedDate: "February 2026",
    source: "FDA Drug Safety Communication",
    evidenceGrade: "FDA Communication",
    readTime: "4 min read",
    summary: "Re-emphasizing black box warnings for systemic fluoroquinolones (Ciprofloxacin, Levofloxacin) in uncomplicated sinus, bronchial, and urinary tract infections.",
    keyTakeaways: [
      "Fluoroquinolones should be reserved for patients with no alternative treatment options.",
      "Risk of tendinitis and tendon rupture increases significantly in patients > 60 years and corticosteroid users.",
      "Immediate drug discontinuation required upon onset of tendon pain or peripheral neuropathy.",
    ],
    fullContent: `### Executive Summary
The U.S. Food and Drug Administration (FDA) reinforces warnings regarding disabling and potentially irreversible serious adverse reactions associated with systemic (oral and injectable) fluoroquinolones.

### Risk Factors & Contraindications
- **Tendon Rupture**: The risk of Achilles tendon rupture is magnified in elderly patients (> 60 years), solid organ transplant recipients, and concomitant systemic corticosteroid therapy.
- **Aortic Aneurysm Risk**: Avoid fluoroquinolones in patients at high risk for aortic aneurysm or dissection unless no alternative antibacterial treatments are available.`,
  },
  {
    id: "kb-3",
    title: "ESC Guidelines: High-Intensity Statin Therapy in Post-ACS Patients",
    category: "Cardiology",
    publishedDate: "November 2025",
    source: "European Society of Cardiology",
    evidenceGrade: "Grade A (High)",
    readTime: "8 min read",
    summary: "Consensus recommendations on early initiation of high-potency statins (Atorvastatin 80mg or Rosuvastatin 40mg) combined with Ezetimibe post-Acute Coronary Syndrome.",
    keyTakeaways: [
      "Target LDL-C reduction of ≥ 50% from baseline AND absolute LDL-C < 55 mg/dL (1.4 mmol/L).",
      "Initiate Ezetimibe 10mg immediately if target LDL-C is unlikely to be achieved with maximum tolerated statin alone.",
      "Check baseline liver enzymes (ALT/AST) and lipid profile within 4–6 weeks post-ACS.",
    ],
    fullContent: `### Primary Therapeutic Goal
Achieve aggressive LDL-C lowering in all post-Acute Coronary Syndrome (ACS) patients to prevent secondary ischemic events and cardiac mortality.

### Pharmacological Strategy
1. **Immediate Statin Protocol**:
   - Prescribe high-intensity statin therapy: **Atorvastatin 80 mg** or **Rosuvastatin 40 mg** daily, regardless of baseline LDL-C concentration.
2. **Combination Therapy**:
   - Co-prescribe Ezetimibe 10 mg at discharge for patients with prior vascular disease or high baseline cholesterol.`,
  },
];

export function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories = ["All", "Cardiology", "Endocrinology", "Infectious Disease", "Pharmacovigilance"];

  const filteredArticles = articlesData.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.summary.toLowerCase().includes(search.toLowerCase()) ||
      art.source.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === "All" || art.category === selectedCategory;

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
                <BookOpen className="h-3.5 w-3.5 text-teal" />
                Clinical Practice Guidelines & Safety Alerts
              </span>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                Pharmaceutical Knowledge Base
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                Curated Monographs, FDA Drug Safety Communications, and Evidence-based Practice Protocols.
              </p>

              {/* Search & Categories */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clinical guidelines, FDA alerts, topics..."
                    className="h-11 pl-10 text-sm shadow-none"
                  />
                </div>
              </div>

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

        {/* Article Grid */}
        <Section className="py-10 sm:py-14">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((art) => (
              <Card key={art.id} className="flex flex-col rounded-2xl border-border shadow-soft transition-all hover:shadow-lift">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-[11px]">
                      {art.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {art.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold leading-snug text-foreground mt-2">
                    {art.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Building2 className="h-3.5 w-3.5 text-teal" />
                    {art.source} • {art.publishedDate}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 text-xs">
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">{art.summary}</p>

                  <div className="rounded-xl bg-surface p-3 border border-border/60">
                    <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider block mb-1">
                      Key Clinical Takeaways:
                    </span>
                    <ul className="space-y-1">
                      {art.keyTakeaways.slice(0, 2).map((kt, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-muted-foreground text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal shrink-0 mt-0.5" />
                          <span>{kt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/60">
                  <Button
                    onClick={() => setSelectedArticle(art)}
                    variant="outline"
                    className="w-full justify-between gap-1 text-xs"
                  >
                    <span>Read Full Guideline</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      {/* Reader Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        {selectedArticle && (
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <DialogHeader className="pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedArticle.category}</Badge>
                <Badge variant="outline" className="text-xs">{selectedArticle.evidenceGrade}</Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-foreground mt-2">{selectedArticle.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                <span>{selectedArticle.source}</span>
                <span>•</span>
                <span>Published {selectedArticle.publishedDate}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground">
              <div className="rounded-xl bg-teal-soft/40 border border-teal/20 p-4 text-xs text-accent-foreground">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-teal" /> Clinical Summary
                </p>
                <p className="mt-1 text-muted-foreground">{selectedArticle.summary}</p>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {selectedArticle.fullContent}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">
                  Complete Clinical Takeaways
                </h4>
                <ul className="space-y-2 text-xs">
                  {selectedArticle.keyTakeaways.map((kt, i) => (
                    <li key={i} className="flex items-start gap-2 bg-card p-2.5 rounded-lg border border-border">
                      <CheckCircle2 className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                      <span className="text-foreground">{kt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedArticle(null)} className="text-xs">
                  Close Reader
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </SiteLayout>
  );
}
