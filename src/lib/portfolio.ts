import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Json = Record<string, unknown>;

export type ProjectRow = {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  period: string;
  summary: string;
  bullets: string[];
  tech: string[];
  github_url: string;
  live_url: string;
  video_url: string;
  cover_url: string;
  images: string[];
  sort_order: number;
  is_visible: boolean;
};

export type ExperienceRow = {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  note: string;
  bullets: string[];
  sort_order: number;
  is_visible: boolean;
};

export type SkillGroupRow = {
  id: string;
  name: string;
  items: string[];
  sort_order: number;
  is_visible: boolean;
};

export type GalleryRow = {
  id: string;
  url: string;
  caption: string;
  alt: string;
  sort_order: number;
  is_visible: boolean;
};

export type LensRow = GalleryRow;


export type HeroContent = {
  name: string;
  eyebrow: string;
  tagline: string;
  kicker: string;
  background_url: string;
  scroll_hint: string;
  image_fit?: string;
  focus_x?: number;
  focus_y?: number;
  zoom?: number;
  overlay?: number;
};

export type ResumeContent = {
  label: string;
  url: string;
  filename: string;
};

export type AboutContent = {
  heading: string;
  portrait_url: string;
  paragraphs: string[];
  stats: { label: string; value: string; suffix: string }[];
};

export type EducationContent = {
  heading: string;
  items: {
    school: string;
    detail: string;
    period: string;
    location: string;
    note: string;
  }[];
};

export type CertificationsContent = {
  heading: string;
  certifications: string[];
  interests: string[];
  languages: string[];
};

export type ContactContent = {
  heading: string;
  intro: string;
  cards: { label: string; value: string; url: string }[];
};

export type SectionsContent = { order: string[]; hidden: string[] };

export type SiteContent = Record<string, Json>;

export const SECTION_LABELS: Record<string, string> = {
  about: "About",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  lens: "Lens",
  education: "Education",
  contact: "Contact",
};

export const DEFAULT_SECTION_ORDER = [
  "about",
  "experience",
  "projects",
  "skills",
  "lens",
  "education",
  "contact",
];



async function fetchSiteContent(): Promise<SiteContent> {
  const { data, error } = await supabase.from("site_content").select("key, value");
  if (error) throw error;
  const map: SiteContent = {};
  for (const row of data ?? []) {
    map[row.key] = (row.value ?? {}) as Json;
  }
  return map;
}

export const siteContentQuery = queryOptions({
  queryKey: ["site_content"],
  queryFn: fetchSiteContent,
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async (): Promise<ProjectRow[]> => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ProjectRow[];
  },
});

export const experiencesQuery = queryOptions({
  queryKey: ["experiences"],
  queryFn: async (): Promise<ExperienceRow[]> => {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ExperienceRow[];
  },
});

export const skillGroupsQuery = queryOptions({
  queryKey: ["skill_groups"],
  queryFn: async (): Promise<SkillGroupRow[]> => {
    const { data, error } = await supabase
      .from("skill_groups")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as SkillGroupRow[];
  },
});



export const lensQuery = queryOptions({
  queryKey: ["lens_images"],
  queryFn: async (): Promise<LensRow[]> => {
    const { data, error } = await supabase
      .from("lens_images")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as LensRow[];
  },
});



export function pick<T>(content: SiteContent, key: string, fallback: T): T {
  const value = content[key];
  if (!value || typeof value !== "object") return fallback;
  return { ...(fallback as object), ...(value as object) } as T;
}
