import { useQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/portfolio";

export type ThemeContent = {
  background: string;
  foreground: string;
  heading: string;
  muted_foreground: string;
  card: string;
  panel: string;
  border: string;
  accent: string;
  sage: string;
  sage_deep: string;
};

export const THEME_VARS: { key: keyof ThemeContent; label: string; vars: string[] }[] = [
  { key: "background", label: "Page background", vars: ["--background"] },
  { key: "foreground", label: "Body text", vars: ["--foreground", "--card-foreground"] },
  { key: "heading", label: "Titles & headings", vars: ["--heading"] },
  { key: "muted_foreground", label: "Secondary text", vars: ["--muted-foreground"] },
  { key: "card", label: "Cards", vars: ["--card", "--popover"] },
  { key: "panel", label: "Panels", vars: ["--panel", "--muted", "--secondary"] },
  { key: "border", label: "Borders", vars: ["--border", "--input"] },
  { key: "accent", label: "Accent / chips", vars: ["--accent"] },
  { key: "sage", label: "Highlight", vars: ["--sage"] },
  { key: "sage_deep", label: "Links & buttons", vars: ["--sage-deep", "--primary", "--ring"] },
];

export function themeCss(theme: Partial<ThemeContent>) {
  const lines: string[] = [];
  for (const entry of THEME_VARS) {
    const value = (theme[entry.key] ?? "").trim();
    if (!value) continue;
    for (const cssVar of entry.vars) lines.push(`${cssVar}: ${value};`);
  }
  if (lines.length === 0) return "";
  return `:root{${lines.join("")}}h1,h2,h3,.font-display{color:var(--heading,var(--foreground));}`;
}

export type HeroTextTheme = {
  color: string;
  opacity: string;
  dark_color: string;
  dark_opacity: string;
};

export function heroTextCss(hero: Partial<HeroTextTheme>) {
  const light: string[] = [];
  const dark: string[] = [];
  const color = (hero.color ?? "").trim();
  const opacity = (hero.opacity ?? "").trim();
  const darkColor = (hero.dark_color ?? "").trim();
  const darkOpacity = (hero.dark_opacity ?? "").trim();
  if (color) light.push(`--hero-name: ${color};`);
  if (opacity) light.push(`--hero-text-opacity: ${opacity};`);
  if (darkColor) dark.push(`--hero-name: ${darkColor};`);
  if (darkOpacity) dark.push(`--hero-text-opacity: ${darkOpacity};`);
  let css = "";
  if (light.length) css += `:root{${light.join("")}}`;
  if (dark.length) css += `.dark,[data-theme="dark"]{${dark.join("")}}`;
  return css;
}

export function ThemeStyle() {
  const content = useQuery(siteContentQuery);
  const theme = (content.data?.["theme"] ?? {}) as Partial<ThemeContent>;
  const hero = (content.data?.["hero_text"] ?? {}) as Partial<HeroTextTheme>;
  const css = themeCss(theme) + heroTextCss(hero);
  if (!css) return null;
  return <style>{css}</style>;
}
