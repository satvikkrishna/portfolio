import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Download } from "lucide-react";
import type { HeroContent, ResumeContent } from "@/lib/portfolio";
import { useMediaUrl, isAbsoluteUrl } from "@/lib/media";

function num(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function Hero({ hero, resume }: { hero: HeroContent; resume?: ResumeContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const bg = useMediaUrl(hero.background_url);
  const resumeUrl = useMediaUrl(resume?.url);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const baseZoom = num(hero.zoom, 1);
  const scale = useTransform(scrollYProgress, [0, 1], [baseZoom, baseZoom * 1.12]);

  const words = (hero.name || "").split(" ").filter(Boolean);
  const fit = hero.image_fit === "contain" ? "contain" : "cover";
  const focusX = num(hero.focus_x, 50);
  const focusY = num(hero.focus_y, 50);
  const overlay = num(hero.overlay, 35) / 100;

  const downloadHref =
    resumeUrl && !isAbsoluteUrl(resume?.url ?? "")
      ? `${resumeUrl}${resumeUrl.includes("?") ? "&" : "?"}download=${encodeURIComponent(
          resume?.filename?.trim() || "resume.pdf",
        )}`
      : resumeUrl;

  return (
    <div id="top" ref={ref} className="hero-text-white relative grain h-[100svh] min-h-[560px] overflow-hidden">
      <motion.div
        style={reduce ? { transform: `scale(${baseZoom})` } : { y: imageY, scale }}
        className="absolute inset-[-10%] bg-panel"
      >
        {bg ? (
          <img
            src={bg}
            alt=""
            fetchPriority="high"
            loading="eager"
            decoding="async"
            draggable={false}
            className="h-full w-full"
            style={{
              objectFit: fit,
              objectPosition: `${focusX}% ${focusY}%`,
            }}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(120% 90% at 25% 15%, var(--color-card) 0%, var(--color-panel) 45%, var(--color-sage) 100%)",
            }}
          />
        )}
      </motion.div>

      <div className="absolute inset-0 bg-background" style={{ opacity: overlay }} />

      <motion.div
        style={reduce ? {} : { y: contentY, opacity: contentOpacity }}
        className="relative flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="eyebrow"
        >
          {hero.eyebrow}
        </motion.p>

        <h1 className="hero-name mt-6 flex flex-wrap justify-center gap-x-5 font-display text-[clamp(3rem,11vw,8.5rem)] leading-[0.92]">
          {words.map((word, index) => (
            <span key={`${word}-${index}`} className="overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.25 + index * 0.09, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="mt-6 max-w-xl text-base text-secondary-foreground sm:text-lg"
        >
          {hero.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.9 }}
          className="eyebrow mt-4"
        >
          {hero.kicker}
        </motion.p>

        {downloadHref ? (
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            href={downloadHref}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-current/40 bg-background/20 px-6 py-3 text-xs uppercase tracking-[0.22em] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-background/35"
          >
            <Download className="h-4 w-4" />
            {resume?.label?.trim() || "Download résumé"}
          </motion.a>
        ) : null}
      </motion.div>


      <motion.a
        href="#about"
        style={reduce ? {} : { opacity: contentOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center"
      >
        <span className="eyebrow">{hero.scroll_hint || "Scroll"}</span>
        <motion.span
          animate={reduce ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mt-3 block h-8 w-px bg-foreground/40"
        />
      </motion.a>
    </div>
  );
}
