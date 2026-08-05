import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
  Unlink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { uploadImage } from "@/lib/blog-admin";

const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-size": { default: "full" },
      "data-align": { default: "center" },
    };
  },
});

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      SizedImage.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) return <div className="h-64 rounded-sm border border-border bg-card" />;

  return (
    <div className="rounded-sm border border-border bg-card">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-sm border-b border-border bg-card/95 p-2 backdrop-blur">
        <Select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : editor.isActive("heading", { level: 4 })
                    ? "h4"
                    : "p"
          }
          onChange={(v) => {
            if (v === "p") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(v.slice(1)) as 1 | 2 | 3 | 4 })
                .run();
          }}
        />
        <Divider />
        <Btn on={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn on={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn
          on={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Btn>
        <Btn on={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} label="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </Btn>
        <Divider />
        {(["left", "center", "right", "justify"] as const).map((a) => (
          <Btn
            key={a}
            on={editor.isActive({ textAlign: a })}
            onClick={() => editor.chain().focus().setTextAlign(a).run()}
            label={`Align ${a}`}
          >
            {a === "left" ? (
              <AlignLeft className="h-4 w-4" />
            ) : a === "center" ? (
              <AlignCenter className="h-4 w-4" />
            ) : a === "right" ? (
              <AlignRight className="h-4 w-4" />
            ) : (
              <AlignJustify className="h-4 w-4" />
            )}
          </Btn>
        ))}
        <Divider />
        <Btn on={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list">
          <List className="h-4 w-4" />
        </Btn>
        <Btn
          on={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn on={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote">
          <Quote className="h-4 w-4" />
        </Btn>
        <Divider />
        <Btn on={editor.isActive("link")} onClick={() => setLinkOpen(true)} label="Add or edit link">
          <LinkIcon className="h-4 w-4" />
        </Btn>
        <Btn on={false} onClick={() => editor.chain().focus().unsetLink().run()} label="Remove link">
          <Unlink className="h-4 w-4" />
        </Btn>
        <Btn on={false} onClick={() => setImageOpen(true)} label="Insert image">
          <ImageIcon className="h-4 w-4" />
        </Btn>
      </div>

      <div className="article-body max-h-[70vh] overflow-y-auto px-6 py-6">
        <EditorContent editor={editor} />
      </div>

      {linkOpen && <LinkDialog editor={editor} onClose={() => setLinkOpen(false)} />}
      {imageOpen && <ImageDialog editor={editor} onClose={() => setImageOpen(false)} />}
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}

function Btn({
  children,
  on,
  onClick,
  label,
}: {
  children: React.ReactNode;
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-sm p-2 transition-colors ${
        on ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Select({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Text style"
      className="rounded-sm border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-accent"
    >
      <option value="p">Paragraph</option>
      <option value="h1">Heading 1</option>
      <option value="h2">Heading 2</option>
      <option value="h3">Heading 3</option>
      <option value="h4">Heading 4</option>
    </select>
  );
}

function Shell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-elevate">
        <h3 className="font-display text-xl">{title}</h3>
        <div className="mt-4 space-y-3">{children}</div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}

const field =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";

function LinkDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [href, setHref] = useState<string>(editor.getAttributes("link")["href"] ?? "");
  const [newTab, setNewTab] = useState(editor.getAttributes("link")["target"] === "_blank");

  return (
    <Shell title="Link" onClose={onClose}>
      <input className={field} value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://…" />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} />
        Open in a new tab
      </label>
      <button
        type="button"
        onClick={() => {
          if (!href.trim()) editor.chain().focus().unsetLink().run();
          else
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: href.trim(), target: newTab ? "_blank" : null })
              .run();
          onClose();
        }}
        className="w-full rounded-full bg-foreground px-5 py-2 text-sm text-background transition-colors hover:bg-accent"
      >
        Apply
      </button>
    </Shell>
  );
}

function ImageDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [size, setSize] = useState("full");
  const [align, setAlign] = useState("center");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Shell title="Insert image" onClose={onClose}>
      <input className={field} value={src} onChange={(e) => setSrc(e.target.value)} placeholder="Image URL" />
      <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
        or upload a file
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError(null);
            try {
              setSrc(await uploadImage(file));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setBusy(false);
            }
          }}
          className="mt-2 block w-full text-sm normal-case tracking-normal text-foreground"
        />
      </label>
      {busy && <p className="text-xs text-muted-foreground">Uploading…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        className={field}
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="ALT text (describe the image for SEO & screen readers)"
      />
      <div className="grid grid-cols-2 gap-3">
        <select className={field} value={size} onChange={(e) => setSize(e.target.value)} aria-label="Image size">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="full">Full width</option>
        </select>
        <select className={field} value={align} onChange={(e) => setAlign(e.target.value)} aria-label="Image alignment">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <button
        type="button"
        disabled={!src.trim()}
        onClick={() => {
          editor
            .chain()
            .focus()
            .setImage({ src: src.trim(), alt, "data-size": size, "data-align": align } as never)
            .run();
          onClose();
        }}
        className="w-full rounded-full bg-foreground px-5 py-2 text-sm text-background transition-colors hover:bg-accent disabled:opacity-40"
      >
        Insert
      </button>
    </Shell>
  );
}
