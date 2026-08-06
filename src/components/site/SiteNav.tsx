import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Link } from "@tanstack/react-router";

export function SiteNav({
  name,
  sections,
}: {
  name: string;
  sections: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-sage-deep"
      />
      <header className="fixed inset-x-0 top-0 z-40">
        <div
          className={`section-shell flex items-center justify-between py-5 transition-all duration-500 ${
            scrolled ? "opacity-100" : "opacity-90"
          }`}
        >
          <a
            href="#top"
            className="font-display text-lg tracking-tight text-foreground transition-opacity hover:opacity-70"
          >
            {name}
          </a>

          <motion.nav
            initial={false}
            animate={{
              backgroundColor: scrolled ? "var(--color-card)" : "transparent",
              boxShadow: scrolled ? "var(--shadow-soft)" : "none",
              borderColor: scrolled ? "var(--color-border)" : "transparent",
            }}
            transition={{ duration: 0.4 }}
            className="hidden items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-md md:flex"
          >
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="relative rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {active === section.id ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                ) : null}
                <span
                  className={`relative ${active === section.id ? "text-accent-foreground" : ""}`}
                >
                  {section.label}
                </span>
              </a>
            ))}
          </motion.nav>

          <Link
            to="/admin"
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            Edit
          </Link>
        </div>
      </header>
    </>
  );
}
