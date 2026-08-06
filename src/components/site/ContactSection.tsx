import { ArrowUpRight, Download } from "lucide-react";
import type { ContactContent, ResumeContent } from "@/lib/portfolio";
import { useMediaUrl, isAbsoluteUrl } from "@/lib/media";
import { Reveal, Section } from "./Reveal";

export function ContactSection({
  contact,
  resume,
}: {
  contact: ContactContent;
  resume?: ResumeContent;
}) {
  const resumeUrl = useMediaUrl(resume?.url);
  const downloadHref =
    resumeUrl && !isAbsoluteUrl(resume?.url ?? "")
      ? `${resumeUrl}${resumeUrl.includes("?") ? "&" : "?"}download=${encodeURIComponent(
          resume?.filename?.trim() || "resume.pdf",
        )}`
      : resumeUrl;
  return (
    <Section id="contact" className="bg-card/60">
      <Reveal>
        <h2 className="max-w-3xl font-display text-6xl leading-[1.0] text-foreground sm:text-7xl">
          {contact.heading}
        </h2>
      </Reveal>
      {contact.intro ? (
        <Reveal delay={0.06}>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{contact.intro}</p>
        </Reveal>
      ) : null}

      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {(contact.cards ?? []).map((card, index) => (
          <Reveal key={`${card.label}-${index}`} delay={index * 0.05}>
            <a
              href={card.url}
              target={card.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex items-center justify-between gap-6 rounded-3xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:border-sage hover:shadow-lift"
            >
              <span>
                <span className="block text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {card.label}
                </span>
                <span className="mt-2 block font-display text-2xl text-foreground">
                  {card.value}
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-sage-deep transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </Reveal>
        ))}
      </div>

      {downloadHref ? (
        <Reveal delay={0.1}>
          <a
            href={downloadHref}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            {resume?.label?.trim() || "Download résumé"}
          </a>
        </Reveal>
      ) : null}
    </Section>
  );
}
