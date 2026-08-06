import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  DEFAULT_SECTION_ORDER,
  SECTION_LABELS,
  experiencesQuery,
  lensQuery,
  pick,
  projectsQuery,
  siteContentQuery,
  skillGroupsQuery,
  type AboutContent,
  type CertificationsContent,
  type ContactContent,
  type ResumeContent,
  type EducationContent,
  type HeroContent,
  type SectionsContent,
} from "@/lib/portfolio";
import { SiteNav } from "@/components/site/SiteNav";
import { Hero } from "@/components/site/Hero";
import { AboutSection } from "@/components/site/AboutSection";
import { ExperienceSection } from "@/components/site/ExperienceSection";
import { ProjectsSection } from "@/components/site/ProjectsSection";
import { SkillsSection } from "@/components/site/SkillsSection";
import { LensSection } from "@/components/site/LensSection";
import { EducationSection } from "@/components/site/EducationSection";
import { ContactSection } from "@/components/site/ContactSection";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Satvik Krishna — AI Systems, Product & Design Portfolio" },
      {
        name: "description",
        content:
          "Portfolio of Satvik Krishna, Computer Science Engineering student at RV College of Engineering, Bengaluru — multi-agent AI systems, machine learning and product design.",
      },
      { property: "og:title", content: "Satvik Krishna — AI Systems, Product & Design Portfolio" },
      {
        property: "og:description",
        content:
          "Multi-agent AI systems, machine learning and product design work by Satvik Krishna, CSE student at RVCE Bengaluru.",
      },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const content = useQuery(siteContentQuery);
  const projects = useQuery(projectsQuery);
  const experiences = useQuery(experiencesQuery);
  const skills = useQuery(skillGroupsQuery);
  const lens = useQuery(lensQuery);


  const site = content.data ?? {};

  const hero = pick<HeroContent>(site, "hero", {
    name: "Satvik Krishna",
    eyebrow: "Bengaluru, India",
    tagline: "Computer Science Engineering · RV College of Engineering",
    kicker: "",
    background_url: "",
    scroll_hint: "Scroll",
    image_fit: "cover",
    focus_x: 50,
    focus_y: 50,
    zoom: 1,
    overlay: 35,
  });

  const resume = pick<ResumeContent>(site, "resume", { label: "", url: "", filename: "" });

  const about = pick<AboutContent>(site, "about", {
    heading: "About",
    portrait_url: "",
    paragraphs: [],
    stats: [],
  });

  const education = pick<EducationContent>(site, "education", { heading: "Education", items: [] });
  const extras = pick<CertificationsContent>(site, "certifications", {
    heading: "Certifications & Interests",
    certifications: [],
    interests: [],
    languages: [],
  });
  const contact = pick<ContactContent>(site, "contact", {
    heading: "Let's Connect",
    intro: "",
    cards: [],
  });
  const sections = pick<SectionsContent>(site, "sections", {
    order: DEFAULT_SECTION_ORDER,
    hidden: [],
  });
  const footer = pick<{ left: string; right: string }>(site, "footer", { left: "", right: "" });

  const experienceHeading =
    (site["experience_section"] as { heading?: string } | undefined)?.heading ?? "Experience";
  const projectsMeta = (site["projects_section"] ?? {}) as { heading?: string; intro?: string };
  const skillsHeading =
    (site["skills_section"] as { heading?: string } | undefined)?.heading ?? "Skills";
  const lensMeta = (site["lens"] ?? {}) as { heading?: string; intro?: string };
  const navTitles = (site["section_titles"] ?? {}) as Record<string, string>;

  const visibleProjects = (projects.data ?? []).filter((row) => row.is_visible);
  const visibleExperiences = (experiences.data ?? []).filter((row) => row.is_visible);
  const visibleSkills = (skills.data ?? []).filter((row) => row.is_visible);
  const visibleLens = (lens.data ?? []).filter((row) => row.is_visible);

  const hasContent: Record<string, boolean> = {
    about: true,
    experience: visibleExperiences.length > 0,
    projects: visibleProjects.length > 0,
    skills: visibleSkills.length > 0,
    lens: visibleLens.length > 0,
    education: (education.items ?? []).length > 0,
    contact: (contact.cards ?? []).length > 0,
  };

  const order = (sections.order?.length ? sections.order : DEFAULT_SECTION_ORDER).filter(
    (id) => !(sections.hidden ?? []).includes(id) && hasContent[id],
  );

  const rendered: Record<string, React.ReactNode> = {
    about: <AboutSection key="about" about={about} />,
    experience: (
      <ExperienceSection key="experience" heading={experienceHeading} items={visibleExperiences} />
    ),
    projects: (
      <ProjectsSection
        key="projects"
        heading={projectsMeta.heading ?? "Projects"}
        intro={projectsMeta.intro}
        projects={visibleProjects}
      />
    ),
    skills: <SkillsSection key="skills" heading={skillsHeading} groups={visibleSkills} />,
    lens: (
      <LensSection
        key="lens"
        heading={lensMeta.heading ?? "Lens"}
        intro={lensMeta.intro}
        images={visibleLens}
      />
    ),
    education: <EducationSection key="education" education={education} extras={extras} />,
    contact: <ContactSection key="contact" contact={contact} resume={resume} />,
  };

  return (
    <main className="relative">
      <SiteNav
        name={hero.name}
        sections={order.map((id) => ({
          id,
          label: navTitles[id]?.trim() || SECTION_LABELS[id] || id,
        }))}
      />

      <Hero hero={hero} resume={resume} />
      {order.map((id) => rendered[id])}
      <footer className="border-t border-border py-10">
        <div className="section-shell flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground sm:flex-row sm:justify-between">
          <span>{footer.left}</span>
          <span>{footer.right}</span>
        </div>
      </footer>
    </main>
  );
}
