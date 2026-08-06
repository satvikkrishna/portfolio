import { useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMediaUrl, isAbsoluteUrl } from "@/lib/media";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2, Upload, X } from "lucide-react";

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-sage";

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className={inputClass}
      value={value ?? ""}
      placeholder={placeholder ?? ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className={inputClass}
      rows={rows}
      value={value ?? ""}
      placeholder={placeholder ?? ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function LinesInput({
  value,
  onChange,
  rows = 5,
  hint = "One per line",
}: {
  value: string[];
  onChange: (value: string[]) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <textarea
        className={inputClass}
        rows={rows}
        value={(value ?? []).join("\n")}
        onChange={(event) => onChange(event.target.value.split("\n"))}
      />
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

/** Drop blank lines before persisting arrays that came from LinesInput. */
export function cleanLines(lines: string[]) {
  return (lines ?? []).map((line) => line.trim()).filter(Boolean);
}


export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    ghost: "border border-border bg-card text-foreground hover:border-sage",
    danger: "border border-destructive/40 text-destructive hover:bg-destructive/10",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

export function MediaField({
  label,
  value,
  onChange,
  accept = "image/*",
  folder = "uploads",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const preview = useMediaUrl(value);
  const isVideo = accept.includes("video");
  const isDoc = accept.includes("pdf");

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
      if (error) throw error;
      onChange(path);
      toast.success("Uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload
          </Button>
          {value ? (
            <Button variant="danger" onClick={() => onChange("")}>
              <X className="h-3.5 w-3.5" /> Remove
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
        <TextInput value={value} onChange={onChange} placeholder="…or paste a link" />
        {preview ? (
          isDoc ? (
            <a
              href={preview}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-sage-deep underline"
            >
              Preview uploaded file
            </a>
          ) : isVideo && !isAbsoluteUrl(value) ? (
            <video src={preview} className="h-32 rounded-xl border border-border" controls />
          ) : isVideo ? (
            <p className="text-xs text-muted-foreground">External video link set.</p>
          ) : (
            <img
              src={preview}
              alt=""
              className="h-32 w-auto rounded-xl border border-border object-cover"
            />
          )
        ) : null}
      </div>
    </Field>
  );
}

export function MediaListField({
  label,
  value,
  onChange,
  folder = "uploads",
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const uploadMany = async (files: File[]) => {
    setBusy(true);
    try {
      const paths: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${folder}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
        if (error) throw error;
        paths.push(path);
      }
      onChange([...value, ...paths]);
      toast.success(`Uploaded ${paths.length} image${paths.length === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target] as string, next[index] as string];
    onChange(next);
  };

  return (
    <Field label={label}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Add images
          </Button>
          {value.length > 0 ? (
            <span className="text-xs text-muted-foreground">{value.length} image(s)</span>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length) void uploadMany(files);
            event.target.value = "";
          }}
        />
        <div className="space-y-2">
          {value.map((item, index) => (
            <MediaListRow
              key={`${item}-${index}`}
              value={item}
              onChange={(next) => {
                const list = [...value];
                list[index] = next;
                onChange(list);
              }}
              onRemove={() => onChange(value.filter((_, i) => i !== index))}
              onUp={() => move(index, -1)}
              onDown={() => move(index, 1)}
            />
          ))}
        </div>
        <PasteLinkRow onAdd={(link) => onChange([...value, link])} />
      </div>
    </Field>
  );
}

function PasteLinkRow({ onAdd }: { onAdd: (link: string) => void }) {
  const [link, setLink] = useState("");
  return (
    <div className="flex items-center gap-2">
      <TextInput value={link} onChange={setLink} placeholder="…or paste an image link" />
      <Button
        variant="ghost"
        onClick={() => {
          const trimmed = link.trim();
          if (!trimmed) return;
          onAdd(trimmed);
          setLink("");
        }}
      >
        Add
      </Button>
    </div>
  );
}

function MediaListRow({
  value,
  onChange,
  onRemove,
  onUp,
  onDown,
}: {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onUp: () => void;
  onDown: () => void;
}) {
  const preview = useMediaUrl(value);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
      {preview ? (
        <img src={preview} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="h-14 w-20 shrink-0 rounded-lg bg-panel" />
      )}
      <div className="flex-1">
        <TextInput value={value} onChange={onChange} />
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button onClick={onUp} aria-label="Move up" className="text-muted-foreground hover:text-foreground">
          <ChevronUp className="h-4 w-4" />
        </button>
        <button onClick={onDown} aria-label="Move down" className="text-muted-foreground hover:text-foreground">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <Button variant="danger" onClick={onRemove}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function ColorInput({
  label,
  value,
  onChange,
  fallback,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fallback: string;
}) {
  const swatch = /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={swatch}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-background"
          aria-label={label}
        />
        <TextInput value={value} onChange={onChange} placeholder={fallback} />
      </div>
    </Field>
  );
}
