import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, Github, Play, X } from "lucide-react";
import type { ProjectRow } from "@/lib/portfolio";
import { MediaImage, MediaVideo } from "@/lib/media";
import { Reveal, Section, SectionHeading } from "./Reveal";

function ProjectDetail({ project, onClose }: { project: ProjectRow; onClose: () => void }) {
  const images = (project.images ?? []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && images.length) setIndex((i) => (i + 1) % images.length);
      if (event.key === "ArrowLeft" && images.length) setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const active = images[index];

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        aria-label="Close project details"
        onClick={onClose}
        className="fixed inset-0 bg-foreground/45 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.985 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-lift"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full border border-border bg-card/85 p-2 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {active || project.cover_url ? (
          <div className="relative grain bg-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={active ?? project.cover_url}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                <MediaImage
                  value={active ?? project.cover_url}
                  alt={`${project.title} image ${index + 1}`}
                  className="aspect-[16/9] w-full object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {images.length > 1 ? (
              <>
                <button
                  aria-label="Previous image"
                  onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-card/85 p-2 text-foreground backdrop-blur transition-transform hover:-translate-x-0.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  aria-label="Next image"
                  onClick={() => setIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-card/85 p-2 text-foreground backdrop-blur transition-transform hover:translate-x-0.5"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {images.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto px-6 pt-5">
            {images.map((image, imageIndex) => (
              <button
                key={`${image}-${imageIndex}`}
                onClick={() => setIndex(imageIndex)}
                aria-label={`Show image ${imageIndex + 1}`}
                className={`shrink-0 overflow-hidden rounded-xl border transition-all ${
                  imageIndex === index ? "border-sage-deep opacity-100" : "border-border opacity-60 hover:opacity-90"
                }`}
              >
                <MediaImage value={image} alt="" className="h-16 w-24 object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="p-6 sm:p-9">
          <h3 className="font-display text-4xl leading-tight text-foreground">{project.title}</h3>
          {project.subtitle ? <p className="mt-1 text-base text-sage-deep">{project.subtitle}</p> : null}
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {[project.role, project.period].filter(Boolean).join(" · ")}
          </p>

          {project.summary ? (
            <p className="mt-6 text-base leading-relaxed text-secondary-foreground">{project.summary}</p>
          ) : null}

          <ul className="mt-6 space-y-3">
            {project.bullets.map((bullet, bulletIndex) => (
              <li key={bulletIndex} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          {project.tech.length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>
          ) : null}

          {project.video_url ? (
            <div className="mt-7">
              {showVideo ? (
                <MediaVideo
                  value={project.video_url}
                  className="aspect-video w-full rounded-2xl border border-border bg-panel"
                />
              ) : (
                <button
                  type="button"
                  onClick={(event) => {
                  event.stopPropagation();
                  setShowVideo(true);
                }}
                  className="inline-flex items-center gap-2 rounded-full border border-sage bg-accent px-4 py-2 text-sm text-accent-foreground transition-transform hover:-translate-y-0.5"
                >
                  <Play className="h-3.5 w-3.5" /> Watch demo
                </button>
              )}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-5">
            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border-b border-sage-deep pb-0.5 text-sm text-sage-deep transition-opacity hover:opacity-70"
              >
                Visit project <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {project.github_url ? (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border-b border-border pb-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" /> Source
              </a>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProjectCard({ project, onOpen }: { project: ProjectRow; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showVideo, setShowVideo] = useState(false);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -4, y: px * 5 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      style={{ transformPerspective: 1000 }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      {project.cover_url ? (
        <div className="grain overflow-hidden bg-panel">
          <MediaImage
            value={project.cover_url}
            alt={`${project.title} cover`}
            className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-7 sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-3xl leading-tight text-foreground">{project.title}</h3>
            {project.subtitle ? (
              <p className="mt-1 text-base text-sage-deep">{project.subtitle}</p>
            ) : null}
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {[project.role, project.period].filter(Boolean).join(" · ")}
            </p>
          </div>
          {project.github_url ? (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              aria-label={`${project.title} on GitHub`}
              className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-sage hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        {project.summary ? (
          <p className="mt-5 text-base leading-relaxed text-secondary-foreground">{project.summary}</p>
        ) : null}

        <ul className="mt-5 space-y-3">
          {project.bullets.map((bullet, index) => (
            <li key={index} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {project.tech.length > 0 ? (
          <div className="mt-7 flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
          </div>
        ) : null}

        {project.video_url ? (
          <div className="mt-7">
            {showVideo ? (
              <MediaVideo
                value={project.video_url}
                className="aspect-video w-full rounded-2xl border border-border bg-panel"
              />
            ) : (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowVideo(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-sage bg-accent px-4 py-2 text-sm text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                <Play className="h-3.5 w-3.5" /> Watch demo
              </button>
            )}
          </div>
        ) : null}

        {project.live_url ? (
          <a
            href={project.live_url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="mt-7 inline-flex items-center gap-1.5 self-start border-b border-sage-deep pb-0.5 text-sm text-sage-deep transition-opacity hover:opacity-70"
          >
            Visit project <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : null}

        <span className="mt-7 inline-flex items-center gap-1.5 self-start text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-sage-deep">
          <Expand className="h-3.5 w-3.5" /> View details
        </span>
      </div>
    </motion.div>
  );
}

export function ProjectsSection({
  heading,
  intro,
  projects,
}: {
  heading: string;
  intro?: string | undefined;
  projects: ProjectRow[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (projects.length === 0) return null;
  const openProject = projects.find((project) => project.id === openId) ?? null;

  return (
    <Section id="projects">
      <SectionHeading title={heading} intro={intro} />
      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal key={project.id} delay={(index % 2) * 0.08} className="h-full">
            <ProjectCard project={project} onOpen={() => setOpenId(project.id)} />
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {openProject ? (
          <ProjectDetail
            key={openProject.id}
            project={openProject}
            onClose={() => setOpenId(null)}
          />
        ) : null}
      </AnimatePresence>
    </Section>
  );
}
