# ONIMIX Studio 🎨

A Canva-like design editor built with Next.js 14, Fabric.js, and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Canvas Editor** — Fabric.js powered drag, resize, rotate
- **10 Templates** — Flyers, Logos, Certificates, Social Posts
- **Text Tools** — Heading, Subheading, Body with inline editing
- **Shapes** — Rectangle, Circle, Line
- **Image Upload** — Drag images onto canvas
- **Background Picker** — 20 presets + custom color
- **Layers Panel** — Reorder, select, delete objects
- **Undo/Redo** — Full history stack (Ctrl+Z / Ctrl+Y)
- **Duplicate** — Ctrl+D or toolbar button
- **Snap to Center** — Auto-snaps objects to canvas center
- **Export** — PNG (2×) and JPEG
- **Save/Load** — Designs saved to localStorage

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected |
| `Ctrl+Z` / `⌘Z` | Undo |
| `Ctrl+Y` / `⌘⇧Z` | Redo |
| `Ctrl+D` / `⌘D` | Duplicate |

## Structure

```
app/
  page.tsx          ← Home / template gallery
  editor/page.tsx   ← Design editor
components/
  CanvasEditor.tsx  ← Core Fabric.js canvas
  Toolbar.tsx       ← Top action bar
  Sidebar.tsx       ← Templates + saved designs
  LayersPanel.tsx   ← Object layers
lib/
  templates.ts      ← 10 pre-built templates
  fabric-utils.ts   ← Canvas helper functions
utils/
  storage.ts        ← localStorage save/load
```

## Deploy to Vercel

```bash
npx vercel
```
