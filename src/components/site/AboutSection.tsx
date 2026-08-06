import { useRef } from "react";
import { motion, useInView, useScroll, useTransform, useReducedMotion } from "motion/react";
import type { AboutContent } from "@/lib/portfolio";
import { useMediaUrl } from "@/lib/media";
import { Reveal, Section } from "./Reveal";

function Stat({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <div ref={ref} className="border-t border-border pt-4">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-4xl text-foreground"
      >
        {value}
        <span className="text-xl text-sage-deep">{suffix}</span>
      </motion.p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  );
}

export function AboutSection({ about }: { about: AboutContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const portrait = useMediaUrl(about.portrait_url);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <Section id="about">
      <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <h2 className="font-display text-5xl leading-[1.02] text-foreground sm:text-6xl">
              {about.heading}
            </h2>
          </Reveal>
          <div className="mt-8 space-y-6">
            {(about.paragraphs ?? []).map((paragraph, index) => (
              <Reveal key={index} delay={index * 0.06}>
                <p className="text-lg leading-relaxed text-secondary-foreground">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          {(about.stats ?? []).length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {about.stats.map((stat) => (
                <Stat key={stat.label} {...stat} />
              ))}
            </div>
          ) : null}
        </div>

        <div ref={ref} className="relative">
          <motion.div
            style={reduce ? {} : { y }}
            className="grain sticky top-28 overflow-hidden rounded-3xl border border-border bg-panel shadow-lift"
          >
            {portrait ? (
              <img
                src={portrait}
                alt="Satvik Krishna"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center px-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Add your portrait from the admin panel — it drops in right here.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
