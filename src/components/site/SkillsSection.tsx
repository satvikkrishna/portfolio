import type { SkillGroupRow } from "@/lib/portfolio";
import { Reveal, Section, SectionHeading } from "./Reveal";

export function SkillsSection({ heading, groups }: { heading: string; groups: SkillGroupRow[] }) {
  if (groups.length === 0) return null;
  const marquee = groups.flatMap((group) => group.items).slice(0, 28);

  return (
    <Section id="skills" className="bg-card/60">
      <SectionHeading title={heading} />

      <div className="mt-14 space-y-12">
        {groups.map((group, index) => (
          <Reveal key={group.id} delay={index * 0.05}>
            <div className="grid gap-5 border-t border-border pt-7 md:grid-cols-[14rem_1fr] md:gap-10">
              <p className="text-xs uppercase tracking-[0.24em] text-sage-deep">{group.name}</p>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {marquee.length > 6 ? (
        <div className="mt-16 overflow-hidden border-y border-border py-5">
          <div className="marquee-track gap-8">
            {[...marquee, ...marquee].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="whitespace-nowrap font-display text-2xl text-muted-foreground/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </Section>
  );
}
