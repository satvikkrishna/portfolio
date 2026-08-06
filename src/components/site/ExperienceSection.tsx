import type { ExperienceRow } from "@/lib/portfolio";
import { Reveal, Section, SectionHeading } from "./Reveal";

export function ExperienceSection({
  heading,
  items,
}: {
  heading: string;
  items: ExperienceRow[];
}) {
  if (items.length === 0) return null;

  return (
    <Section id="experience" className="bg-card/60">
      <SectionHeading title={heading} />
      <div className="mt-14 space-y-10">
        {items.map((item, index) => (
          <Reveal key={item.id} delay={index * 0.05}>
            <article className="grid gap-6 border-t border-border pt-8 md:grid-cols-[16rem_1fr] md:gap-12">
              <div>
                <p className="font-display text-2xl text-foreground">{item.company}</p>
                <p className="mt-1 text-sm text-sage-deep">{item.role}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {item.period}
                </p>
                {item.location ? (
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {item.location}
                  </p>
                ) : null}
              </div>
              <div>
                {item.note ? (
                  <p className="mb-4 text-sm italic text-muted-foreground">{item.note}</p>
                ) : null}
                <ul className="space-y-3">
                  {item.bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-3 text-base leading-relaxed text-secondary-foreground">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
