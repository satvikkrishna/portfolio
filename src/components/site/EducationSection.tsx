import type { CertificationsContent, EducationContent } from "@/lib/portfolio";
import { Reveal, Section, SectionHeading } from "./Reveal";

export function EducationSection({
  education,
  extras,
}: {
  education: EducationContent;
  extras: CertificationsContent;
}) {
  return (
    <Section id="education">
      <SectionHeading title={education.heading} />

      <div className="mt-14 space-y-8">
        {(education.items ?? []).map((item, index) => (
          <Reveal key={index} delay={index * 0.05}>
            <article className="grid gap-4 border-t border-border pt-7 md:grid-cols-[1fr_16rem] md:gap-10">
              <div>
                <h3 className="font-display text-3xl text-foreground">{item.school}</h3>
                <p className="mt-1 text-base text-sage-deep">{item.detail}</p>
                {item.note ? (
                  <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
                ) : null}
              </div>
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground md:text-right">
                <p>{item.period}</p>
                <p>{item.location}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 grid gap-10 border-t border-border pt-10 sm:grid-cols-3">
        {[
          { label: "Certifications", items: extras.certifications ?? [] },
          { label: "Interests", items: extras.interests ?? [] },
          { label: "Languages", items: extras.languages ?? [] },
        ]
          .filter((column) => column.items.length > 0)
          .map((column, index) => (
            <Reveal key={column.label} delay={index * 0.06}>
              <p className="text-xs uppercase tracking-[0.24em] text-sage-deep">{column.label}</p>
              <ul className="mt-4 space-y-2">
                {column.items.map((item) => (
                  <li key={item} className="text-sm text-secondary-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
      </div>
    </Section>
  );
}
