import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import {
  experiencesQuery,
  
  lensQuery,
  projectsQuery,
  siteContentQuery,
  skillGroupsQuery,
} from "@/lib/portfolio";

import { Button, Field, TextInput } from "@/components/admin/ui";
import { TableEditor } from "@/components/admin/TableEditor";
import {
  AboutEditor,
  ContactEditor,
  EducationEditor,
  ExtrasEditor,
  FooterMetaEditor,
  HeadingEditor,
  HeroEditor,
  SectionsEditor,
  ThemeEditor,
  HeroTextEditor,
  ResumeEditor,
} from "@/components/admin/ContentEditors";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Studio — Edit portfolio | Satvik Krishna" },
      { name: "description", content: "Private studio for editing the Satvik Krishna portfolio." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Studio — Edit portfolio" },
      { property: "og:description", content: "Private editing studio." },
    ],
  }),
  component: AdminPage,
});

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    const { error } = await action;
    setBusy(false);
    if (error) toast.error(error.message);
    else if (mode === "signup") toast.success("Account created — you can sign in now.");
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-lift">
        <h1 className="font-display text-3xl text-foreground">Studio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to edit the portfolio. The first account to sign in becomes the owner.
        </p>
        <div className="mt-6 space-y-4">
          <Field label="Email">
            <TextInput value={email} onChange={setEmail} placeholder="you@example.com" />
          </Field>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-sage"
            />
          </label>
          <Button onClick={submit} disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <Button variant="ghost" onClick={google}>
            Continue with Google
          </Button>
          <button
            className="text-xs text-muted-foreground underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
        <Link to="/" className="mt-6 inline-block text-xs text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    void supabase.rpc("claim_admin").then(({ data, error }) => {
      if (error) toast.error(error.message);
      setIsAdmin(!!data);
    });
  }, [session]);

  const content = useQuery({ ...siteContentQuery, enabled: !!session });
  const projects = useQuery({ ...projectsQuery, enabled: !!session });
  const experiences = useQuery({ ...experiencesQuery, enabled: !!session });
  const skills = useQuery({ ...skillGroupsQuery, enabled: !!session });
  
  const lens = useQuery({ ...lensQuery, enabled: !!session });


  if (!ready) return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  if (!session) return <SignIn />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-3xl text-foreground">Not the owner</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account can't edit the portfolio.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="ghost" onClick={() => void supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const site = content.data ?? {};

  return (
    <main className="min-h-screen pb-24">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-5">
          <div>
            <p className="eyebrow">Studio</p>
            <h1 className="font-display text-2xl text-foreground">Edit your portfolio</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-sage"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> View site
            </Link>
            <Button variant="ghost" onClick={() => void supabase.auth.signOut()}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="section-shell mt-10 space-y-8">
        <ThemeEditor content={site} />
        <HeroTextEditor content={site} />
        <SectionsEditor content={site} />
        <HeroEditor content={site} />
        <ResumeEditor content={site} />
        <AboutEditor content={site} />

        <HeadingEditor content={site} contentKey="experience_section" title="Experience heading" />
        <TableEditor
          title="Experience entries"
          table="experiences"
          queryKey="experiences"
          rows={(experiences.data ?? []) as never}
          labelKey="company"
          newRow={{ company: "New role", role: "", period: "", location: "", note: "", bullets: [] }}
          fields={[
            { key: "company", label: "Company", type: "text" },
            { key: "role", label: "Role", type: "text" },
            { key: "period", label: "Period", type: "text" },
            { key: "location", label: "Location", type: "text" },
            { key: "note", label: "Note", type: "textarea" },
            { key: "bullets", label: "Bullets", type: "lines" },
          ]}
        />

        <HeadingEditor
          content={site}
          contentKey="projects_section"
          title="Projects heading"
          withIntro
        />
        <TableEditor
          title="Projects"
          table="projects"
          queryKey="projects"
          rows={(projects.data ?? []) as never}
          labelKey="title"
          newRow={{
            title: "New project",
            subtitle: "",
            role: "",
            period: "",
            summary: "",
            bullets: [],
            tech: [],
            github_url: "",
            live_url: "",
            video_url: "",
            cover_url: "",
            images: [],
          }}
          fields={[
            { key: "title", label: "Title", type: "text" },
            { key: "subtitle", label: "Subtitle", type: "text" },
            { key: "role", label: "Role", type: "text" },
            { key: "period", label: "Period", type: "text" },
            { key: "summary", label: "Summary", type: "textarea" },
            { key: "bullets", label: "Bullets", type: "lines" },
            { key: "tech", label: "Tech tags", type: "lines" },
            { key: "cover_url", label: "Cover image", type: "image" },
            { key: "images", label: "Detail images (shown when the card expands)", type: "images" },
            { key: "video_url", label: "Demo video (upload or YouTube/Vimeo link)", type: "video" },
            { key: "github_url", label: "GitHub link", type: "text" },
            { key: "live_url", label: "Live link", type: "text" },
          ]}
        />

        <HeadingEditor content={site} contentKey="skills_section" title="Skills heading" />
        <TableEditor
          title="Skill groups"
          table="skill_groups"
          queryKey="skill_groups"
          rows={(skills.data ?? []) as never}
          labelKey="name"
          newRow={{ name: "New group", items: [] }}
          fields={[
            { key: "name", label: "Group name", type: "text" },
            { key: "items", label: "Skills", type: "lines" },
          ]}
        />




        <HeadingEditor content={site} contentKey="lens" title="Lens section heading" withIntro />
        <TableEditor
          title="Lens photos (auto-scrolling)"
          table="lens_images"
          queryKey="lens_images"
          rows={(lens.data ?? []) as never}
          labelKey="caption"
          newRow={{ url: "", caption: "New frame", alt: "" }}
          fields={[
            { key: "url", label: "Photo", type: "image" },
            { key: "caption", label: "Caption", type: "text" },
            { key: "alt", label: "Alt text", type: "text" },
          ]}
        />


        <EducationEditor content={site} />
        <ExtrasEditor content={site} />
        <ContactEditor content={site} />
        <FooterMetaEditor content={site} />
      </div>
    </main>
  );
}
