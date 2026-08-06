CREATE TABLE public.lens_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  alt text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.lens_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lens_images TO authenticated;
GRANT ALL ON public.lens_images TO service_role;

ALTER TABLE public.lens_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lens images are publicly readable" ON public.lens_images FOR SELECT USING (true);
CREATE POLICY "Admins manage lens images" ON public.lens_images FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER lens_images_updated_at BEFORE UPDATE ON public.lens_images FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO public.site_content (key, value) VALUES
  ('lens', '{"heading":"Lens","intro":"Automobiles and street moments, shot between builds."}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_content (key, value) VALUES
  ('section_titles', '{"about":"About","experience":"Experience","projects":"Projects","skills":"Skills","gallery":"Frames","lens":"Lens","education":"Education","contact":"Contact"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
