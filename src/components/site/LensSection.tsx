import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { LensRow } from "@/lib/portfolio";
import { MediaImage } from "@/lib/media";
import { SectionHeading } from "./Reveal";

export function LensSection({
  heading,
  intro,
  images,
}: {
  heading: string;
  intro?: string | undefined;
  images: LensRow[];
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  if (images.length === 0) return null;
  const loop = [...images, ...images];

  return (
    <section ref={ref} id="lens" className="scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div className="section-shell">
        <SectionHeading title={heading} intro={intro} />
      </div>

      <motion.div style={reduce ? {} : { x: drift }} className="mt-14">
        <div className="marquee-track marquee-reverse gap-6 sm:gap-8">
          {loop.map((image, index) => (
            <figure
              key={`${image.id}-${index}`}
              className="grain group w-[70vw] shrink-0 overflow-hidden rounded-3xl border border-border bg-panel shadow-soft sm:w-[38vw] lg:w-[26vw]"
            >
              <MediaImage
                value={image.url}
                alt={image.alt || image.caption || "Photography frame"}
                className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {image.caption ? (
                <figcaption className="px-5 py-4 text-sm text-muted-foreground">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
