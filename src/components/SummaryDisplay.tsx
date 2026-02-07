import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SummaryDisplayProps {
  summary: string;
}

interface SummarySection {
  title: string;
  lines: string[];
}

function parseSummary(raw: string): SummarySection[] {
  const sections: SummarySection[] = [];
  let current: SummarySection | null = null;

  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect section headers: lines that are all-caps or end with ":"
    const isHeader =
      /^[A-Z\s&\-/]+:?$/.test(trimmed) ||
      /^[═─━=\-]{3,}$/.test(trimmed) ||
      (trimmed.endsWith(":") && !trimmed.startsWith("-") && trimmed.length < 60);

    if (isHeader && !/^[═─━=\-]{3,}$/.test(trimmed)) {
      current = { title: trimmed.replace(/:$/, ""), lines: [] };
      sections.push(current);
    } else if (/^[═─━=\-]{3,}$/.test(trimmed)) {
      // separator line, skip
    } else if (current) {
      current.lines.push(trimmed);
    } else {
      // Lines before any header
      current = { title: "Overview", lines: [trimmed] };
      sections.push(current);
    }
  }

  return sections;
}

function isHighlightLine(line: string): boolean {
  return /total\s*(estimated)?\s*cost/i.test(line);
}

const SummaryDisplay = ({ summary }: SummaryDisplayProps) => {
  const sections = parseSummary(summary);

  if (sections.length <= 1) {
    // Fallback: just render as monospace
    return (
      <div className="rounded-lg border bg-card p-4">
        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
          {summary}
        </pre>
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={sections.map((_, i) => `s-${i}`)} className="space-y-1">
      {sections.map((section, i) => (
        <AccordionItem key={i} value={`s-${i}`} className="border rounded-lg bg-card/60 px-4">
          <AccordionTrigger className="text-sm font-bold text-primary hover:no-underline py-3">
            {section.title}
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <ul className="space-y-1">
              {section.lines.map((line, j) => {
                const isBullet = line.startsWith("-") || line.startsWith("•");
                const text = isBullet ? line.slice(1).trim() : line;
                const highlight = isHighlightLine(line);

                return (
                  <li
                    key={j}
                    className={`text-xs font-mono leading-relaxed ${
                      highlight
                        ? "text-primary font-bold text-sm mt-2"
                        : isBullet
                        ? "text-muted-foreground pl-3 before:content-['•'] before:mr-2 before:text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {text}
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default SummaryDisplay;
