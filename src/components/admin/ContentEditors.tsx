import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { Button, ColorInput, Field, LinesInput, MediaField, Panel, TextArea, TextInput, cleanLines } from "./ui";
import { THEME_VARS } from "@/components/site/ThemeStyle";
import { DEFAULT_SECTION_ORDER, SECTION_LABELS, type SiteContent } from "@/lib/portfolio";

async function saveContent(key: string, value: unknown) {
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value: value as never }, { onConflict: "key" });
  if (error) throw error;
}

function useDraft<T>(initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  useEffect(() => setDraft(initial), [JSON.stringify(initial)]);
  return [draft, setDraft] as const;
}

function SaveRow({ onSave }: { onSave: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onSave();
          toast.success("Saved");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Save failed");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Save className="h-3.5 w-3.5" /> Save
    </Button>
  );
}

type ObjField = { key: string; label: string; type?: "text" | "textarea" };

function ObjectListEditor({
  items,
  fields,
  onChange,
  addLabel,
  blank,
}: {
  items: Record<string, string>[];
  fields: ObjField[];
  onChange: (items: Record<string, string>[]) => void;
  addLabel: string;
  blank: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="rounded-2xl border border-border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <Field key={field.key} label={field.label}>
                {field.type === "textarea" ? (
                  <TextArea
                    rows={3}
                    value={item[field.key] ?? ""}
                    onChange={(next) =>
                      onChange(items.map((it, i) => (i === index ? { ...it, [field.key]: next } : it)))
                    }
                  />
                ) : (
                  <TextInput
                    value={item[field.key] ?? ""}
                    onChange={(next) =>
                      onChange(items.map((it, i) => (i === index ? { ...it, [field.key]: next } : it)))
                    }
                  />
                )}
              </Field>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="danger" onClick={() => onChange(items.filter((_, i) => i !== index))}>
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </Button>
            {index > 0 ? (
              <Button variant="ghost" onClick={() => onChange(arrayMove(items, index, index - 1))}>
                Move up
              </Button>
            ) : null}
            {index < items.length - 1 ? (
              <Button variant="ghost" onClick={() => onChange(arrayMove(items, index, index + 1))}>
                Move down
              </Button>
            ) : null}
          </div>
        </div>
      ))}
      <Button variant="ghost" onClick={() => onChange([...items, { ...blank }])}>
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </Button>
    </div>
  );
}

export function HeroEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useDraft(
    (content["hero"] ?? {}) as {
      name?: string;
      eyebrow?: string;
      tagline?: string;
      kicker?: string;
      scroll_hint?: string;
      background_url?: string;
      image_fit?: string;
      focus_x?: number;
      focus_y?: number;
      zoom?: number;
      overlay?: number;
    },
  );

  const slider = (
    key: "focus_x" | "focus_y" | "zoom" | "overlay",
    label: string,
    min: number,
    max: number,
    step: number,
    fallback: number,
    suffix = "%",
  ) => (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number(draft[key] ?? fallback)}
          onChange={(event) => setDraft({ ...draft, [key]: Number(event.target.value) })}
          className="w-full accent-primary"
          aria-label={label}
        />
        <span className="w-16 shrink-0 text-right text-sm text-muted-foreground">
          {Number(draft[key] ?? fallback)}
          {suffix}
        </span>
      </div>
    </Field>
  );

  return (
    <Panel title="Hero">
      <Field label="Name">
        <TextInput value={draft.name ?? ""} onChange={(v) => setDraft({ ...draft, name: v })} />
      </Field>
      <Field label="Eyebrow (small text above name)">
        <TextInput value={draft.eyebrow ?? ""} onChange={(v) => setDraft({ ...draft, eyebrow: v })} />
      </Field>
      <Field label="Tagline">
        <TextInput value={draft.tagline ?? ""} onChange={(v) => setDraft({ ...draft, tagline: v })} />
      </Field>
      <Field label="Kicker (small text below tagline)">
        <TextInput value={draft.kicker ?? ""} onChange={(v) => setDraft({ ...draft, kicker: v })} />
      </Field>
      <Field label="Scroll hint">
        <TextInput
          value={draft.scroll_hint ?? ""}
          onChange={(v) => setDraft({ ...draft, scroll_hint: v })}
        />
      </Field>
      <MediaField
        label="Hero background image"
        value={draft.background_url ?? ""}
        onChange={(v) => setDraft({ ...draft, background_url: v })}
        folder="hero"
      />
      <Field label="Image fitting">
        <div className="flex gap-2">
          {[
            { value: "cover", label: "Fill screen (crop)" },
            { value: "contain", label: "Fit whole image" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={(draft.image_fit ?? "cover") === option.value ? "primary" : "ghost"}
              onClick={() => setDraft({ ...draft, image_fit: option.value })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        {slider("zoom", "Size / zoom", 1, 2.5, 0.05, 1, "\u00d7")}
        {slider("overlay", "Darken overlay", 0, 90, 5, 35)}
        {slider("focus_x", "Horizontal position", 0, 100, 1, 50)}
        {slider("focus_y", "Vertical position", 0, 100, 1, 50)}
      </div>
      <SaveRow
        onSave={async () => {
          await saveContent("hero", draft);
          await queryClient.invalidateQueries({ queryKey: ["site_content"] });
        }}
      />
    </Panel>
  );
}

export function AboutEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useDraft(
    (content["about"] ?? {}) as {
      heading?: string;
      portrait_url?: string;
      paragraphs?: string[];
      stats?: Record<string, string>[];
    },
  );

  return (
    <Panel title="About">
      <Field label="Heading">
        <TextInput value={draft.heading ?? ""} onChange={(v) => setDraft({ ...draft, heading: v })} />
      </Field>
      <MediaField
        label="Portrait photo"
        value={draft.portrait_url ?? ""}
        onChange={(v) => setDraft({ ...draft, portrait_url: v })}
        folder="about"
      />
      <Field label="Paragraphs">
        <LinesInput
          rows={8}
          hint="One paragraph per line"
          value={draft.paragraphs ?? []}
          onChange={(v) => setDraft({ ...draft, paragraphs: v })}
        />
      </Field>
      <Field label="Stats">
        <ObjectListEditor
          items={draft.stats ?? []}
          fields={[
            { key: "value", label: "Value" },
            { key: "suffix", label: "Suffix" },
            { key: "label", label: "Label" },
          ]}
          blank={{ value: "", suffix: "", label: "" }}
          addLabel="Add stat"
          onChange={(stats) => setDraft({ ...draft, stats })}
        />
      </Field>
      <SaveRow
        onSave={async () => {
          await saveContent("about", { ...draft, paragraphs: cleanLines(draft.paragraphs ?? []) });
          await queryClient.invalidateQueries({ queryKey: ["site_content"] });
        }}
      />
    </Panel>
  );
}

export function HeadingEditor({
  content,
  contentKey,
  title,
  withIntro = false,
}: {
  content: SiteContent;
  contentKey: string;
  title: string;
  withIntro?: boolean;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useDraft(
    (content[contentKey] ?? {}) as { heading?: string; intro?: string },
  );

  return (
    <Panel title={title}>
      <Field label="Heading">
        <TextInput value={draft.heading ?? ""} onChange={(v) => setDraft({ ...draft, heading: v })} />
      </Field>
      {withIntro ? (
        <Field label="Intro">
          <TextArea value={draft.intro ?? ""} onChange={(v) => setDraft({ ...draft, intro: v })} />
        </Field>
      ) : null}
      <SaveRow
        onSave={async () => {
          await saveContent(contentKey, draft);
          await queryClient.invalidateQueries({ queryKey: ["site_content"] });
        }}
      />
    </Panel>
  );
}

export function EducationEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useDraft(
    (content["education"] ?? {}) as { heading?: string; items?: Record<string, string>[] },
  );

  return (
    <Panel title="Education">
      <Field label="Heading">
        <TextInput value={draft.heading ?? ""} onChange={(v) => setDraft({ ...draft, heading: v })} />
      </Field>
      <ObjectListEditor
        items={draft.items ?? []}
        fields={[
          { key: "school", label: "School" },
          { key: "detail", label: "Detail" },
          { key: "period", label: "Period" },
          { key: "location", label: "Location" },
          { key: "note", label: "Note", type: "textarea" },
        ]}
        blank={{ school: "", detail: "", period: "", location: "", note: "" }}
        addLabel="Add school"
        onChange={(items) => setDraft({ ...draft, items })}
      />
      <SaveRow
        onSave={async () => {
          await saveContent("education", draft);
          await queryClient.invalidateQueries({ queryKey: ["site_content"] });
        }}
      />
    </Panel>
  );
}

export function ExtrasEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useDraft(
    (content["certifications"] ?? {}) as {
      heading?: string;
      certifications?: string[];
      interests?: string[];
      languages?: string[];
    },
  );

  return (
    <Panel title="Certifications, interests & languages">
      <Field label="Certifications">
        <LinesInput
          value={draft.certifications ?? []}
          onChange={(v) => setDraft({ ...draft, certifications: v })}
        />
      </Field>
      <Field label="Interests">
        <LinesInput value={draft.interests ?? []} onChange={(v) => setDraft({ ...draft, interests: v })} />
      </Field>
      <Field label="Languages">
        <LinesInput value={draft.languages ?? []} onChange={(v) => setDraft({ ...draft, languages: v })} />
      </Field>
      <SaveRow
        onSave={async () => {
          await saveContent("certifications", {
            ...draft,
            certifications: cleanLines(draft.certifications ?? []),
            interests: cleanLines(draft.interests ?? []),
            languages: cleanLines(draft.languages ?? []),
          });
          await queryClient.invalidateQueries({ queryKey: ["site_content"] });
        }}
      />
    </Panel>
  );
}

export function ContactEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useDraft(
    (content["contact"] ?? {}) as {
      heading?: string;
      intro?: string;
      cards?: Record<string, string>[];
    },
  );

  return (
    <Panel title="Contact">
      <Field label="Heading">
        <TextInput value={draft.heading ?? ""} onChange={(v) => setDraft({ ...draft, heading: v })} />
      </Field>
      <Field label="Intro">
        <TextArea value={draft.intro ?? ""} onChange={(v) => setDraft({ ...draft, intro: v })} />
      </Field>
      <ObjectListEditor
        items={draft.cards ?? []}
        fields={[
          { key: "label", label: "Label" },
          { key: "value", label: "Display text" },
          { key: "url", label: "Link (https://, mailto:, tel:)" },
        ]}
        blank={{ label: "", value: "", url: "" }}
        addLabel="Add link"
        onChange={(cards) => setDraft({ ...draft, cards })}
      />
      <SaveRow
        onSave={async () => {
          await saveContent("contact", draft);
          await queryClient.invalidateQueries({ queryKey: ["site_content"] });
        }}
      />
    </Panel>
  );
}

export function FooterMetaEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const [footer, setFooter] = useDraft((content["footer"] ?? {}) as { left?: string; right?: string });
  const [meta, setMeta] = useDraft(
    (content["meta"] ?? {}) as { title?: string; description?: string },
  );

  return (
    <Panel title="Footer & page info">
      <Field label="Footer left">
        <TextInput value={footer.left ?? ""} onChange={(v) => setFooter({ ...footer, left: v })} />
      </Field>
      <Field label="Footer right">
        <TextInput value={footer.right ?? ""} onChange={(v) => setFooter({ ...footer, right: v })} />
      </Field>
      <Field label="Page title">
        <TextInput value={meta.title ?? ""} onChange={(v) => setMeta({ ...meta, title: v })} />
      </Field>
      <Field label="Page description">
        <TextArea value={meta.description ?? ""} onChange={(v) => setMeta({ ...meta, description: v })} />
      </Field>
      <SaveRow
        onSave={async () => {
          await saveContent("footer", footer);
          await saveContent("meta", meta);
          await queryClient.invalidateQueries({ queryKey: ["site_content"] });
        }}
      />
    </Panel>
  );
}

function SortableSection({
  id,
  hidden,
  title,
  onTitleChange,
  onToggle,
}: {
  id: string;
  hidden: boolean;
  title: string;
  onTitleChange: (value: string) => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3"
    >
      <button className="cursor-grab text-muted-foreground" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <TextInput
          value={title}
          onChange={onTitleChange}
          placeholder={SECTION_LABELS[id] ?? id}
        />
        <p className={`mt-1 text-[11px] uppercase tracking-[0.18em] ${hidden ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
          {id}
        </p>
      </div>
      <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
        {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function SectionsEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const stored = (content["sections"] ?? {}) as { order?: string[]; hidden?: string[] };
  const [order, setOrder] = useDraft(stored.order?.length ? stored.order : DEFAULT_SECTION_ORDER);
  const [hidden, setHidden] = useDraft(stored.hidden ?? []);
  const [titles, setTitles] = useDraft((content["section_titles"] ?? {}) as Record<string, string>);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder(
      arrayMove(
        order,
        order.indexOf(active.id as string),
        order.indexOf(over.id as string),
      ),
    );
  };

  return (
    <Panel title="Section order, titles & visibility">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {order.map((id) => (
              <SortableSection
                key={id}
                id={id}
                hidden={hidden.includes(id)}
                title={titles[id] ?? SECTION_LABELS[id] ?? id}
                onTitleChange={(value) => setTitles({ ...titles, [id]: value })}
                onToggle={() =>
                  setHidden(hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id])
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <SaveRow
        onSave={async () => {
          await saveContent("sections", { order, hidden });
          await saveContent("section_titles", titles);
          await queryClient.invalidateQueries({ queryKey: ["site_content"] });
        }}
      />
    </Panel>
  );
}


const THEME_FALLBACKS: Record<string, string> = {
  background: "#f5f0e8",
  foreground: "#3a4038",
  heading: "#2f3a2d",
  muted_foreground: "#6f7a6c",
  card: "#fbf8f2",
  panel: "#dce5d4",
  border: "#d8dcd0",
  accent: "#e2e9dc",
  sage: "#a8c0a0",
  sage_deep: "#7d9b76",
};

export function HeroTextEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const initial = (content["hero_text"] ?? {}) as Record<string, string>;
  const [draft, setDraft] = useDraft(initial);

  const opacityField = (key: string, label: string) => (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={Number(draft[key] ?? 1)}
          onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
          className="w-full accent-primary"
          aria-label={label}
        />
        <span className="w-12 shrink-0 text-right text-sm text-muted-foreground">
          {Math.round(Number(draft[key] ?? 1) * 100)}%
        </span>
      </div>
    </Field>
  );

  return (
    <Panel title="Hero centered text — color & opacity">
      <p className="text-sm text-muted-foreground">
        Sets the name, eyebrow and subtitle centered on the welcome screen. Light values apply by
        default; dark values apply when the site runs in a dark theme.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ColorInput
          label="Light theme — text color"
          value={draft["color"] ?? ""}
          fallback="#ffffff"
          onChange={(next) => setDraft({ ...draft, color: next })}
        />
        {opacityField("opacity", "Light theme — opacity")}
        <ColorInput
          label="Dark theme — text color"
          value={draft["dark_color"] ?? ""}
          fallback="#ffffff"
          onChange={(next) => setDraft({ ...draft, dark_color: next })}
        />
        {opacityField("dark_opacity", "Dark theme — opacity")}
      </div>
      <div className="flex gap-2">
        <SaveRow
          onSave={async () => {
            await saveContent("hero_text", draft);
            await queryClient.invalidateQueries({ queryKey: ["site_content"] });
          }}
        />
        <Button variant="ghost" onClick={() => setDraft({})}>
          Reset to default
        </Button>
      </div>
    </Panel>
  );
}

export function ThemeEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const initial = (content["theme"] ?? {}) as Record<string, string>;
  const [draft, setDraft] = useDraft(initial);

  return (
    <Panel title="Colors — text, titles & backgrounds">
      <p className="text-sm text-muted-foreground">
        Pick any color. Leave a field empty to keep the original design value.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {THEME_VARS.map((entry) => (
          <ColorInput
            key={entry.key}
            label={entry.label}
            value={draft[entry.key] ?? ""}
            fallback={THEME_FALLBACKS[entry.key] ?? "#000000"}
            onChange={(next) => setDraft({ ...draft, [entry.key]: next })}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <SaveRow
          onSave={async () => {
            await saveContent("theme", draft);
            await queryClient.invalidateQueries({ queryKey: ["site_content"] });
          }}
        />
        <Button variant="ghost" onClick={() => setDraft({})}>
          Reset to default
        </Button>
      </div>
    </Panel>
  );
}

export function ResumeEditor({ content }: { content: SiteContent }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useDraft(
    (content["resume"] ?? {}) as { label?: string; url?: string; filename?: string },
  );

  return (
    <Panel title="Résumé download">
      <p className="text-sm text-muted-foreground">
        Upload a PDF (or paste a link). A download button appears on the welcome screen and in the
        contact section. Leave empty to hide it.
      </p>
      <Field label="Button label">
        <TextInput
          value={draft.label ?? ""}
          onChange={(v) => setDraft({ ...draft, label: v })}
          placeholder="Download résumé"
        />
      </Field>
      <MediaField
        label="Résumé file"
        value={draft.url ?? ""}
        onChange={(v) => setDraft({ ...draft, url: v })}
        accept="application/pdf"
        folder="resume"
      />
      <Field label="Download filename">
        <TextInput
          value={draft.filename ?? ""}
          onChange={(v) => setDraft({ ...draft, filename: v })}
          placeholder="satvik-krishna-resume.pdf"
        />
      </Field>
      <SaveRow
        onSave={async () => {
          await saveContent("resume", draft);
          await queryClient.invalidateQueries({ queryKey: ["site_content"] });
        }}
      />
    </Panel>
  );
}
