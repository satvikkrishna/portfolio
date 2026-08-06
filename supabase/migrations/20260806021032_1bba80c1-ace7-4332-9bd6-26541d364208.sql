-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

-- First signed-in account can claim ownership; afterwards it is closed.
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_exists boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role) INTO admin_exists;

  IF admin_exists THEN
    RETURN public.has_role(auth.uid(), 'admin'::public.app_role);
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Site content key/value store
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content is publicly readable" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Experiences
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  period text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  bullets text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experiences are publicly readable" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Admins manage experiences" ON public.experiences FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER experiences_updated_at BEFORE UPDATE ON public.experiences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  period text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  bullets text[] NOT NULL DEFAULT '{}',
  tech text[] NOT NULL DEFAULT '{}',
  github_url text NOT NULL DEFAULT '',
  live_url text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are publicly readable" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Skill groups
CREATE TABLE public.skill_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  items text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.skill_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_groups TO authenticated;
GRANT ALL ON public.skill_groups TO service_role;
ALTER TABLE public.skill_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skill groups are publicly readable" ON public.skill_groups FOR SELECT USING (true);
CREATE POLICY "Admins manage skill groups" ON public.skill_groups FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER skill_groups_updated_at BEFORE UPDATE ON public.skill_groups
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Gallery
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  alt text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery images are publicly readable" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Admins manage gallery images" ON public.gallery_images FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER gallery_images_updated_at BEFORE UPDATE ON public.gallery_images
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage object policies for the media bucket
CREATE POLICY "Media is publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admins upload media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admins update media" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admins delete media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND public.is_admin());

-- Seed content
INSERT INTO public.site_content (key, value) VALUES
('hero', $json${
  "name": "Satvik Krishna",
  "eyebrow": "BENGALURU, INDIA",
  "tagline": "Computer Science Engineering · RV College of Engineering",
  "kicker": "AI SYSTEMS · PRODUCT · DESIGN",
  "background_url": "",
  "scroll_hint": "Scroll"
}$json$::jsonb),
('about', $json${
  "heading": "About",
  "portrait_url": "",
  "paragraphs": [
    "I am Satvik Krishna — a Computer Science Engineering student at RV College of Engineering, Bengaluru, building AI systems that people can actually trust.",
    "I like problems where evidence matters. Across my projects I have built multi-agent research systems with citation-grounded output, orchestration pipelines with adversarial critics, and real-time computer vision that runs on a CPU. The common thread is measurable honesty: evaluation frameworks, hallucination rates, ground-truth coverage.",
    "I also come from the design side — I spent a summer at KuKClean shipping packaging, storefront visuals and Figma mockups end to end. That mix means I care as much about how something feels as whether it works.",
    "Outside of code: strength training and running, cars, and cinematography."
  ],
  "stats": [
    { "label": "CGPA", "value": "8.98", "suffix": "/10" },
    { "label": "Agents shipped", "value": "9", "suffix": "+" },
    { "label": "Ground-truth claims evaluated", "value": "135", "suffix": "" }
  ]
}$json$::jsonb),
('education', $json${
  "heading": "Education",
  "items": [
    {
      "school": "RV College of Engineering (RVCE)",
      "detail": "B.E. Computer Science · CGPA 8.98 / 10",
      "period": "2024 – 2028",
      "location": "Bengaluru, KA",
      "note": "Coursework: Data Structures, DAA, Operating Systems, Computer Networks, Discrete Mathematics, Data Science for Engineers, Programming in C."
    },
    {
      "school": "National Public School, Indiranagar",
      "detail": "CBSE · Grade 1–12 · PCMC",
      "period": "2009 – 2023",
      "location": "Bengaluru, KA",
      "note": "Physics, Chemistry, Mathematics, Computer Science."
    }
  ]
}$json$::jsonb),
('certifications', $json${
  "heading": "Certifications & Interests",
  "certifications": [
    "Machine Learning Specialization — Stanford Online + DeepLearning.AI",
    "Data Science for Engineers — IIT Madras (2026)"
  ],
  "interests": ["Strength training & running", "Automotive enthusiast", "Cinematography"],
  "languages": ["English (Fluent)", "Hindi (Fluent)"]
}$json$::jsonb),
('gallery', $json${
  "heading": "Frames",
  "intro": "A few things I have pointed a camera at."
}$json$::jsonb),
('contact', $json${
  "heading": "Let's Connect",
  "intro": "If you are into AI systems, product, design, cars or cinematography — or just want to argue about model evaluation — reach out.",
  "cards": [
    { "label": "EMAIL", "value": "satvikkrishna06@gmail.com", "url": "mailto:satvikkrishna06@gmail.com" },
    { "label": "LINKEDIN", "value": "linkedin.com/in/satvik-krishna", "url": "https://www.linkedin.com/in/satvik-krishna" },
    { "label": "GITHUB", "value": "github.com/satvikk2024-dotcom", "url": "https://github.com/satvikk2024-dotcom" },
    { "label": "PHONE", "value": "+91 96065 09179", "url": "tel:+919606509179" }
  ]
}$json$::jsonb),
('footer', $json${
  "left": "© 2026 Satvik Krishna",
  "right": "Bengaluru, India"
}$json$::jsonb),
('sections', $json${
  "order": ["about", "experience", "projects", "skills", "gallery", "education", "contact"],
  "hidden": []
}$json$::jsonb),
('meta', $json${
  "title": "Satvik Krishna — AI Systems, Product & Design Portfolio",
  "description": "Portfolio of Satvik Krishna, Computer Science Engineering student at RV College of Engineering, Bengaluru — multi-agent AI systems, machine learning and product design work."
}$json$::jsonb),
('experience_section', $json${ "heading": "Experience" }$json$::jsonb),
('projects_section', $json${ "heading": "Projects", "intro": "Systems I designed, shipped and measured." }$json$::jsonb),
('skills_section', $json${ "heading": "Skills" }$json$::jsonb);

INSERT INTO public.experiences (company, role, period, location, note, bullets, sort_order) VALUES
('KuKClean', 'Product & Design Intern', 'Jun 2024 – Jul 2024', 'Bengaluru, KA', 'Plant-based D2C e-commerce brand', ARRAY[
  'Produced end-to-end creative assets across packaging, social-media campaigns and storefront visuals — 30+ design files in Photoshop, Lightroom and Figma across an 8-week engagement.',
  'Set up 20+ product listings end to end: product copy, on-page descriptions and catalogue photography.',
  'Built Figma wireframes and high-fidelity mockups for new product pages, converting founding-team briefs into design-ready specs.'
], 1);

INSERT INTO public.projects (title, subtitle, role, period, summary, bullets, tech, sort_order) VALUES
('Meridian', 'Multi-Agent Due Diligence System', 'Designer & Engineer', '2026', 'A 4-agent orchestration system producing cited due-diligence memos on NSE/BSE companies in about 75 seconds.', ARRAY[
  'Designed and shipped a 4-agent system (financial, market, leadership, sentiment) extracting from yfinance, Wikipedia, Reddit JSON and Google News RSS in parallel via asyncio.',
  'Built a citation-grounded schema where every memo claim links to evidence rows by database constraint — unsourced claims eliminated by construction; a content-addressed SHA-256 disk cache makes evals reproducible.',
  'Evaluated across 9 NSE companies and 135 verified ground-truth claims: 15% average hallucination rate (financial agent: 0%), 79% ground-truth coverage, 11 unique citations per run vs. 0 for a single-prompt baseline.'
], ARRAY['Python','FastAPI','Next.js','asyncio','Ollama (qwen2.5:7b)','Server-Sent Events','Pydantic','SQLite'], 1),
('Anchor', 'Personal AI Application Pipeline', 'Builder', '2026', 'A 5-workflow n8n orchestration that turns a job-posting URL into a researched, factually-grounded application packet.', ARRAY[
  'Playwright-driven JD scraping and parsing, multi-source company research, match scoring, tailored-material generation and cron-based follow-up scheduling with Wait/Resume human-in-loop gates.',
  'Master-resume schema where every tailored line links to a structured master entry by foreign-key constraint, with an adversarial Grounding Critic enforcing factual grounding before any material ships.',
  'Full observability layer logs every agent run to Postgres — input hash, structured output, latency, critic verdict — a queryable audit trail across the pipeline.'
], ARRAY['n8n','Postgres','Playwright','Notion API','Google Drive API','Slack Web API','OAuth2','LLM evaluation'], 2),
('CrowdSense', 'Real-Time Crowd Intelligence Platform', 'Engineer', '2026', 'A 3-model parallel inference pipeline for real-time crowd density, forecasting and risk scoring.', ARRAY[
  'Engineered a 3-model pipeline (YOLOv8n + CSRNet 16.3M params + Dual-LSTM 64K params) with adaptive model switching, achieving 16+ FPS on CPU — full pipeline in 60ms at 720p across 8 configurable zones.',
  'Trained dual-horizon LSTM forecasters (5s near-term + 45s strategic) with Evidential Deep Learning for uncertainty quantification.',
  'Risk engine scores 4 alert tiers across spatial zones, backed by SQLite storing 15 metrics per zone per frame.'
], ARRAY['PyTorch','OpenCV','YOLOv8n','CSRNet (VGG16)','Evidential LSTM','ShanghaiTech','Streamlit','SQLite'], 3);

INSERT INTO public.skill_groups (name, items, sort_order) VALUES
('Programming Languages', ARRAY['Python','C','SQL','HTML','CSS'], 1),
('Python Libraries', ARRAY['scikit-learn','pandas','NumPy','Matplotlib','Scrapy','FastAPI','Pydantic','asyncio','Playwright'], 2),
('AI / ML', ARRAY['Multi-agent orchestration','LLM systems','LLM evaluation','Prompt engineering','RAG','Structured output','Agent orchestration','Ollama','OpenAI API','Anthropic API'], 3),
('Tools & Design', ARRAY['n8n','Make.com','Next.js','React','Tailwind CSS','Postgres','SQLite','Docker','Git','GitHub Copilot','Claude Code','Google Cloud','Looker Studio','Tally Forms','Figma','Lovable','Photoshop','Lightroom','Blender','DaVinci Resolve','Supabase'], 4);