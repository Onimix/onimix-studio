import type { Canvas as FabricCanvas } from 'fabric/fabric-impl';

// Export canvas as PNG
export function exportAsPNG(canvas: FabricCanvas, filename = 'onimix-design.png', multiplier = 2) {
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  link.click();
}

// Export canvas as JPEG
export function exportAsJPEG(canvas: FabricCanvas, filename = 'onimix-design.jpg', quality = 0.95) {
  const dataURL = canvas.toDataURL({
    format: 'jpeg',
    quality,
    multiplier: 2,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  link.click();
}

// Center selected object
export function centerObject(canvas: FabricCanvas) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  canvas.centerObject(obj);
  obj.setCoords();
  canvas.renderAll();
}

// Duplicate selected object
export function duplicateObject(canvas: FabricCanvas) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.clone((cloned: fabric.Object) => {
    cloned.set({
      left: (obj.left || 0) + 20,
      top: (obj.top || 0) + 20,
    });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
  });
}

// Delete selected objects
export function deleteSelected(canvas: FabricCanvas) {
  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects.length) return;
  activeObjects.forEach(obj => canvas.remove(obj));
  canvas.discardActiveObject();
  canvas.renderAll();
}

// Add text object
export function addText(canvas: FabricCanvas, text = 'Click to edit', options = {}) {
  const { fabric } = window as typeof window & { fabric: typeof import('fabric') };
  const textObj = new fabric.IText(text, {
    left: canvas.getWidth() / 2 - 100,
    top: canvas.getHeight() / 2 - 20,
    fontFamily: 'Arial',
    fontSize: 32,
    fill: '#ffffff',
    ...options,
  });
  canvas.add(textObj);
  canvas.setActiveObject(textObj);
  textObj.enterEditing();
  canvas.renderAll();
}

// Add heading text
export function addHeading(canvas: FabricCanvas) {
  addText(canvas, 'Heading Text', { fontSize: 56, fontWeight: 'bold' });
}

// Add subheading text
export function addSubheading(canvas: FabricCanvas) {
  addText(canvas, 'Subheading text here', { fontSize: 28 });
}

// Add body text
export function addBodyText(canvas: FabricCanvas) {
  addText(canvas, 'Body text goes here. Click to edit.', { fontSize: 18 });
}

// Add rectangle shape
export function addRect(canvas: FabricCanvas, color = '#6366f1') {
  const { fabric } = window as typeof window & { fabric: typeof import('fabric') };
  const rect = new fabric.Rect({
    left: canvas.getWidth() / 2 - 80,
    top: canvas.getHeight() / 2 - 50,
    width: 160,
    height: 100,
    fill: color,
    rx: 8,
    ry: 8,
  });
  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();
}

// Add circle shape
export function addCircle(canvas: FabricCanvas, color = '#f43f5e') {
  const { fabric } = window as typeof window & { fabric: typeof import('fabric') };
  const circle = new fabric.Circle({
    left: canvas.getWidth() / 2 - 60,
    top: canvas.getHeight() / 2 - 60,
    radius: 60,
    fill: color,
  });
  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.renderAll();
}

// Add line
export function addLine(canvas: FabricCanvas) {
  const { fabric } = window as typeof window & { fabric: typeof import('fabric') };
  const cx = canvas.getWidth() / 2;
  const cy = canvas.getHeight() / 2;
  const line = new fabric.Line([cx - 100, cy, cx + 100, cy], {
    stroke: '#ffffff',
    strokeWidth: 3,
  });
  canvas.add(line);
  canvas.setActiveObject(line);
  canvas.renderAll();
}

// Get object display name for layers panel
export function getObjectLabel(obj: fabric.Object, index: number): string {
  const type = obj.type || 'object';
  if (type === 'i-text' || type === 'text') {
    const t = (obj as fabric.IText).text || '';
    return `✏️ ${t.slice(0, 20)}${t.length > 20 ? '…' : ''}`;
  }
  if (type === 'rect') return `▭ Rectangle`;
  if (type === 'circle') return `◯ Circle`;
  if (type === 'triangle') return `△ Triangle`;
  if (type === 'line') return `— Line`;
  if (type === 'image') return `🖼 Image`;
  if (type === 'group') return `⬡ Group`;
  return `◆ Object ${index + 1}`;
}

// Save canvas to localStorage
export function saveDesign(canvas: FabricCanvas, name: string) {
  const json = canvas.toJSON(['selectable', 'evented', 'data']);
  const saves = getSavedDesigns();
  const design = {
    id: Date.now().toString(),
    name,
    json,
    width: canvas.getWidth(),
    height: canvas.getHeight(),
    background: canvas.backgroundColor,
    thumbnail: canvas.toDataURL({ format: 'jpeg', quality: 0.4, multiplier: 0.25 }),
    savedAt: new Date().toISOString(),
  };
  // Replace if same name exists
  const idx = saves.findIndex(s => s.name === name);
  if (idx >= 0) saves[idx] = design;
  else saves.unshift(design);
  localStorage.setItem('onimix_designs', JSON.stringify(saves.slice(0, 20)));
  return design;
}

// Get saved designs
export function getSavedDesigns() {
  try {
    const raw = localStorage.getItem('onimix_designs');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Delete saved design
export function deleteSavedDesign(id: string) {
  const saves = getSavedDesigns().filter((s: { id: string }) => s.id !== id);
  localStorage.setItem('onimix_designs', JSON.stringify(saves));
}

// Load design into canvas
export function loadDesign(canvas: FabricCanvas, json: object, bg: string, w: number, h: number) {
  canvas.setWidth(w);
  canvas.setHeight(h);
  canvas.setBackgroundColor(bg, () => {});
  canvas.loadFromJSON(json, () => {
    canvas.renderAll();
  });
}

// Snap-to-center guides helper
export function setupSnapGuides(canvas: FabricCanvas) {
  const SNAP_THRESHOLD = 12;
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();

  canvas.on('object:moving', (e) => {
    if (!e.target) return;
    const obj = e.target;
    const objCenterX = obj.getCenterPoint().x;
    const objCenterY = obj.getCenterPoint().y;

    // Snap to canvas center X
    if (Math.abs(objCenterX - cw / 2) < SNAP_THRESHOLD) {
      obj.set({ left: cw / 2 - (obj.getScaledWidth() * (obj.originX === 'center' ? 0 : 0.5)) });
    }
    // Snap to canvas center Y
    if (Math.abs(objCenterY - ch / 2) < SNAP_THRESHOLD) {
      obj.set({ top: ch / 2 - (obj.getScaledHeight() * (obj.originY === 'center' ? 0 : 0.5)) });
    }
  });
}
