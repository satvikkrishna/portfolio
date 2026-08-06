import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { ChevronDown, Eye, EyeOff, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button, Field, LinesInput, MediaField, MediaListField, TextArea, TextInput, cleanLines } from "./ui";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "lines" | "image" | "images" | "video";
};

type Row = Record<string, unknown> & { id: string; sort_order: number; is_visible: boolean };

// The generated Supabase types are per-table; this editor is intentionally generic.
const db = supabase as unknown as {
  from: (table: string) => any;
};

function SortableRow({
  row,
  fields,
  table,
  labelKey,
  onLocalChange,
  onRefresh,
}: {
  row: Row;
  fields: FieldDef[];
  table: string;
  labelKey: string;
  onLocalChange: (row: Row) => void;
  onRefresh: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: unknown) => onLocalChange({ ...row, [key]: value });

  const save = async () => {
    setSaving(true);
    const payload: Record<string, unknown> = { is_visible: row.is_visible };
    for (const field of fields) {
      payload[field.key] = field.type === "lines" ? cleanLines(row[field.key] as string[]) : row[field.key];
    }
    const { error } = await db.from(table).update(payload).eq("id", row.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      onRefresh();
    }
  };

  const remove = async () => {
    const { error } = await db.from(table).delete().eq("id", row.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      onRefresh();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border border-border bg-background ${isDragging ? "shadow-lift" : ""}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          className="cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          className="flex flex-1 items-center gap-2 text-left text-sm text-foreground"
          onClick={() => setOpen(!open)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          {(row[labelKey] as string) || "Untitled"}
        </button>
        <button
          onClick={() => set("is_visible", !row.is_visible)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle visibility"
        >
          {row.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>

      {open ? (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {fields.map((field) => {
            const value = row[field.key];
            if (field.type === "images") {
              return (
                <MediaListField
                  key={field.key}
                  label={field.label}
                  value={(value as string[]) ?? []}
                  onChange={(next) => set(field.key, next)}
                  folder={table}
                />
              );
            }
            if (field.type === "image" || field.type === "video") {
              return (
                <MediaField
                  key={field.key}
                  label={field.label}
                  value={(value as string) ?? ""}
                  onChange={(next) => set(field.key, next)}
                  accept={field.type === "video" ? "video/*" : "image/*"}
                  folder={table}
                />
              );
            }
            return (
              <Field key={field.key} label={field.label}>
                {field.type === "lines" ? (
                  <LinesInput
                    value={(value as string[]) ?? []}
                    onChange={(next) => set(field.key, next)}
                  />
                ) : field.type === "textarea" ? (
                  <TextArea value={(value as string) ?? ""} onChange={(next) => set(field.key, next)} />
                ) : (
                  <TextInput value={(value as string) ?? ""} onChange={(next) => set(field.key, next)} />
                )}
              </Field>
            );
          })}

          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving}>
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
            <Button variant="danger" onClick={remove}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TableEditor({
  title,
  table,
  rows,
  fields,
  labelKey,
  newRow,
  queryKey,
}: {
  title: string;
  table: string;
  rows: Row[];
  fields: FieldDef[];
  labelKey: string;
  newRow: Record<string, unknown>;
  queryKey: string;
}) {
  const queryClient = useQueryClient();
  const [local, setLocal] = useState<Row[]>(rows);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => setLocal(rows), [rows]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = local.findIndex((row) => row.id === active.id);
    const newIndex = local.findIndex((row) => row.id === over.id);
    const next = arrayMove(local, oldIndex, newIndex);
    setLocal(next);
    for (const [index, row] of next.entries()) {
      await db.from(table).update({ sort_order: index }).eq("id", row.id);
    }
    toast.success("Order saved");
    refresh();
  };

  const add = async () => {
    const { error } = await db
      .from(table)
      .insert({ ...newRow, sort_order: local.length, is_visible: true });
    if (error) toast.error(error.message);
    else {
      toast.success("Added");
      refresh();
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <Button variant="ghost" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Drag the handle to reorder. Click a row to edit, then save.
      </p>

      <div className="mt-5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={local.map((row) => row.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {local.map((row) => (
                <SortableRow
                  key={row.id}
                  row={row}
                  fields={fields}
                  table={table}
                  labelKey={labelKey}
                  onLocalChange={(next) =>
                    setLocal((current) => current.map((item) => (item.id === next.id ? next : item)))
                  }
                  onRefresh={refresh}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}
