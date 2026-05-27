'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { Template } from '@/lib/templates';
import { setupSnapGuides, getObjectLabel } from '@/lib/fabric-utils';

export interface CanvasEditorHandle {
  addText: (style?: 'heading' | 'subheading' | 'body') => void;
  addShape: (shape: 'rect' | 'circle' | 'line') => void;
  addImage: (file: File) => void;
  deleteSelected: () => void;
  duplicate: () => void;
  centerSelected: () => void;
  setBackground: (color: string) => void;
  exportPNG: () => void;
  exportJPEG: () => void;
  undo: () => void;
  redo: () => void;
  loadTemplate: (template: Template) => void;
  saveJSON: () => object | null;
  loadJSON: (json: object, bg: string, w: number, h: number) => void;
  getObjects: () => { id: string; label: string; selected: boolean }[];
  selectObject: (index: number) => void;
  deleteObject: (index: number) => void;
  moveObjectUp: (index: number) => void;
  moveObjectDown: (index: number) => void;
  getCanvas: () => fabric.Canvas | null;
}

interface Props {
  onSelectionChange?: (hasSelection: boolean) => void;
  onObjectsChange?: () => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

const MAX_HISTORY = 50;

const CanvasEditor = forwardRef<CanvasEditorHandle, Props>(({
  onSelectionChange,
  onObjectsChange,
  canvasWidth = 600,
  canvasHeight = 600,
}, ref) => {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isLoadingRef = useRef(false);

  // Push current state to history
  const pushHistory = useCallback(() => {
    if (isLoadingRef.current || !fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON(['selectable', 'evented']));
    // Trim forward history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }
  }, []);

  const restoreHistory = useCallback((json: string) => {
    if (!fabricRef.current) return;
    isLoadingRef.current = true;
    const canvas = fabricRef.current;
    const bg = canvas.backgroundColor as string;
    const w = canvas.getWidth();
    const h = canvas.getHeight();
    canvas.loadFromJSON(JSON.parse(json), () => {
      canvas.setBackgroundColor(bg, () => {});
      canvas.setWidth(w);
      canvas.setHeight(h);
      canvas.renderAll();
      isLoadingRef.current = false;
      onObjectsChange?.();
    });
  }, [onObjectsChange]);

  // Initialize Fabric.js
  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;

    // Dynamically import fabric to avoid SSR issues
    import('fabric').then(({ fabric }) => {
      const canvas = new fabric.Canvas(canvasElRef.current!, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#1a1a2e',
        preserveObjectStacking: true,
        selection: true,
        fireRightClick: true,
        stopContextMenu: true,
      });

      fabricRef.current = canvas;

      // Setup snap-to-center guides
      setupSnapGuides(canvas);

      // Track selection
      canvas.on('selection:created', () => onSelectionChange?.(true));
      canvas.on('selection:updated', () => onSelectionChange?.(true));
      canvas.on('selection:cleared', () => onSelectionChange?.(false));

      // Track object changes
      canvas.on('object:added', () => { pushHistory(); onObjectsChange?.(); });
      canvas.on('object:removed', () => { pushHistory(); onObjectsChange?.(); });
      canvas.on('object:modified', () => { pushHistory(); onObjectsChange?.(); });

      // Keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
          const active = canvas.getActiveObjects();
          active.forEach(o => canvas.remove(o));
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        }
        if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault();
          handleRedo();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
          e.preventDefault();
          handleDuplicate(canvas, fabric);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Initial history snapshot
      pushHistory();

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        canvas.dispose();
        fabricRef.current = null;
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    restoreHistory(historyRef.current[historyIndexRef.current]);
  };

  const handleRedo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    restoreHistory(historyRef.current[historyIndexRef.current]);
  };

  const handleDuplicate = (canvas: fabric.Canvas, fabric: typeof import('fabric').fabric) => {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.clone((cloned: fabric.Object) => {
      cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  useImperativeHandle(ref, () => ({
    addText: (style = 'body') => {
      import('fabric').then(({ fabric }) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const configs = {
          heading: { text: 'Heading', fontSize: 60, fontWeight: 'bold', fill: '#ffffff' },
          subheading: { text: 'Subheading', fontSize: 32, fontWeight: '600', fill: '#ffffff' },
          body: { text: 'Body text here', fontSize: 20, fontWeight: 'normal', fill: '#ffffff' },
        };
        const cfg = configs[style];
        const t = new fabric.IText(cfg.text, {
          left: canvas.getWidth() / 2 - 100,
          top: canvas.getHeight() / 2 - cfg.fontSize / 2,
          fontFamily: 'Arial',
          ...cfg,
        });
        canvas.add(t);
        canvas.setActiveObject(t);
        t.enterEditing();
        canvas.renderAll();
      });
    },

    addShape: (shape) => {
      import('fabric').then(({ fabric }) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const cx = canvas.getWidth() / 2;
        const cy = canvas.getHeight() / 2;
        let obj: fabric.Object;
        if (shape === 'rect') {
          obj = new fabric.Rect({ left: cx - 80, top: cy - 50, width: 160, height: 100, fill: '#6366f1', rx: 8, ry: 8 });
        } else if (shape === 'circle') {
          obj = new fabric.Circle({ left: cx - 60, top: cy - 60, radius: 60, fill: '#f43f5e' });
        } else {
          obj = new fabric.Line([cx - 100, cy, cx + 100, cy], { stroke: '#ffffff', strokeWidth: 3 });
        }
        canvas.add(obj);
        canvas.setActiveObject(obj);
        canvas.renderAll();
      });
    },

    addImage: (file: File) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        import('fabric').then(({ fabric }) => {
          fabric.Image.fromURL(e.target?.result as string, (img) => {
            const maxW = canvas.getWidth() * 0.7;
            const maxH = canvas.getHeight() * 0.7;
            const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1);
            img.set({
              left: canvas.getWidth() / 2 - (img.width || 0) * scale / 2,
              top: canvas.getHeight() / 2 - (img.height || 0) * scale / 2,
              scaleX: scale,
              scaleY: scale,
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          });
        });
      };
      reader.readAsDataURL(file);
    },

    deleteSelected: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.getActiveObjects().forEach(o => canvas.remove(o));
      canvas.discardActiveObject();
      canvas.renderAll();
    },

    duplicate: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      import('fabric').then(({ fabric }) => handleDuplicate(canvas, fabric));
    },

    centerSelected: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj) return;
      canvas.centerObject(obj);
      obj.setCoords();
      canvas.renderAll();
    },

    setBackground: (color: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.setBackgroundColor(color, () => canvas.renderAll());
      pushHistory();
    },

    exportPNG: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const url = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
      const a = document.createElement('a');
      a.download = 'onimix-design.png';
      a.href = url;
      a.click();
    },

    exportJPEG: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const url = canvas.toDataURL({ format: 'jpeg', quality: 0.95, multiplier: 2 });
      const a = document.createElement('a');
      a.download = 'onimix-design.jpg';
      a.href = url;
      a.click();
    },

    undo: handleUndo,
    redo: handleRedo,

    loadTemplate: (template: Template) => {
      import('fabric').then(({ fabric }) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        isLoadingRef.current = true;
        canvas.clear();
        canvas.setWidth(template.width);
        canvas.setHeight(template.height);
        canvas.setBackgroundColor(template.background, () => {});

        const validTypes = ['rect', 'circle', 'triangle', 'line', 'text', 'i-text', 'image', 'group', 'path'];
        const objs = template.objects.filter((o: object) =>
          validTypes.includes((o as { type: string }).type)
        );

        let loaded = 0;
        if (objs.length === 0) {
          canvas.renderAll();
          isLoadingRef.current = false;
          onObjectsChange?.();
          return;
        }

        objs.forEach((objData: object) => {
          const data = objData as Record<string, unknown>;
          const type = data.type as string;

          const addObj = (obj: fabric.Object) => {
            canvas.add(obj);
            loaded++;
            if (loaded === objs.length) {
              canvas.renderAll();
              isLoadingRef.current = false;
              pushHistory();
              onObjectsChange?.();
            }
          };

          if (type === 'rect') {
            addObj(new fabric.Rect(data as fabric.IRectOptions));
          } else if (type === 'circle') {
            addObj(new fabric.Circle(data as fabric.ICircleOptions));
          } else if (type === 'triangle') {
            addObj(new fabric.Triangle(data as fabric.ITriangleOptions));
          } else if (type === 'line') {
            const { x1, y1, x2, y2, ...rest } = data as { x1: number; y1: number; x2: number; y2: number; [key: string]: unknown };
            addObj(new fabric.Line([x1, y1, x2, y2], rest as fabric.ILineOptions));
          } else if (type === 'text' || type === 'i-text') {
            const { text, ...rest } = data as { text: string; [key: string]: unknown };
            addObj(new fabric.IText(text || '', rest as fabric.ITextOptions));
          } else if (type === 'image') {
            const { src, ...rest } = data as { src: string; [key: string]: unknown };
            if (src) {
              fabric.Image.fromURL(src, (img) => {
                img.set(rest as fabric.IImageOptions);
                addObj(img);
              });
            } else {
              loaded++;
            }
          } else {
            loaded++;
            if (loaded === objs.length) {
              canvas.renderAll();
              isLoadingRef.current = false;
              onObjectsChange?.();
            }
          }
        });
      });
    },

    saveJSON: () => {
      const canvas = fabricRef.current;
      if (!canvas) return null;
      return canvas.toJSON(['selectable', 'evented']);
    },

    loadJSON: (json, bg, w, h) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      isLoadingRef.current = true;
      canvas.setWidth(w);
      canvas.setHeight(h);
      canvas.loadFromJSON(json, () => {
        canvas.setBackgroundColor(bg, () => {});
        canvas.renderAll();
        isLoadingRef.current = false;
        onObjectsChange?.();
      });
    },

    getObjects: () => {
      const canvas = fabricRef.current;
      if (!canvas) return [];
      const activeObjs = canvas.getActiveObjects();
      return canvas.getObjects().map((obj, i) => ({
        id: i.toString(),
        label: getObjectLabel(obj, i),
        selected: activeObjs.includes(obj),
      })).reverse(); // top layers first
    },

    selectObject: (index: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const objs = canvas.getObjects();
      const reversed = [...objs].reverse();
      const obj = reversed[index];
      if (obj) {
        canvas.setActiveObject(obj);
        canvas.renderAll();
      }
    },

    deleteObject: (index: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const objs = canvas.getObjects();
      const reversed = [...objs].reverse();
      const obj = reversed[index];
      if (obj) {
        canvas.remove(obj);
        canvas.renderAll();
      }
    },

    moveObjectUp: (index: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const objs = canvas.getObjects();
      const reversed = [...objs].reverse();
      const obj = reversed[index];
      if (obj) {
        canvas.bringForward(obj);
        canvas.renderAll();
        onObjectsChange?.();
      }
    },

    moveObjectDown: (index: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const objs = canvas.getObjects();
      const reversed = [...objs].reverse();
      const obj = reversed[index];
      if (obj) {
        canvas.sendBackwards(obj);
        canvas.renderAll();
        onObjectsChange?.();
      }
    },

    getCanvas: () => fabricRef.current,
  }));

  return (
    <div className="canvas-container-wrapper">
      <div className="canvas-shadow" style={{ lineHeight: 0, display: 'inline-block' }}>
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
});

CanvasEditor.displayName = 'CanvasEditor';
export default CanvasEditor;
