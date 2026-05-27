'use client';

import { useRef, useState } from 'react';
import type { CanvasEditorHandle } from './CanvasEditor';
import {
  Type, Image, Square, Circle, Minus, Trash2,
  Download, Undo2, Redo2, Copy, AlignCenter,
  ChevronDown, Save, FileImage, Baseline
} from 'lucide-react';

interface Props {
  editorRef: React.RefObject<CanvasEditorHandle>;
  hasSelection: boolean;
  onSave: () => void;
  bgColor: string;
  onBgChange: (color: string) => void;
}

export default function Toolbar({ editorRef, hasSelection, onSave, bgColor, onBgChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const BG_PRESETS = [
    '#0d0e1a', '#1a0533', '#0f172a', '#134e4a', '#1b2a1b',
    '#ffffff', '#fffbeb', '#fff5ee', '#f8fafc', '#fdf4ff',
    '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2',
    '#6366f1', '#9333ea', '#ec4899', '#f43f5e', '#000000',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) editorRef.current?.addImage(file);
    e.target.value = '';
  };

  return (
    <div className="toolbar flex items-center gap-1 px-3 h-14 overflow-x-auto shrink-0 select-none">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-3 shrink-0">
        <div style={{
          width: 28, height: 28,
          background: 'linear-gradient(135deg, #6366f1, #f43f5e)',
          borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#fff',
          fontFamily: 'Impact',
          letterSpacing: 1,
        }}>O</div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#f1f3f9', letterSpacing: 1 }}>
          ONIMIX
        </span>
      </div>

      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', margin: '0 6px' }} />

      {/* Undo / Redo */}
      <button className="btn-icon tooltip" data-tip="Undo (⌘Z)" onClick={() => editorRef.current?.undo()}>
        <Undo2 size={16} />
      </button>
      <button className="btn-icon tooltip" data-tip="Redo (⌘Y)" onClick={() => editorRef.current?.redo()}>
        <Redo2 size={16} />
      </button>

      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', margin: '0 6px' }} />

      {/* Text */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost"
          style={{ gap: 4, padding: '6px 10px' }}
          onClick={() => { setShowTextMenu(v => !v); setShowShapeMenu(false); setShowExportMenu(false); setShowBgPicker(false); }}
        >
          <Type size={15} />
          <span style={{ fontSize: 13 }}>Text</span>
          <ChevronDown size={12} />
        </button>
        {showTextMenu && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6,
            background: '#1c1e33', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 6, minWidth: 160, zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {[
              { label: 'Heading', icon: '𝗛', style: 'heading' as const },
              { label: 'Subheading', icon: '𝘚', style: 'subheading' as const },
              { label: 'Body Text', icon: '𝗧', style: 'body' as const },
            ].map(item => (
              <button key={item.style}
                className="layer-item w-full"
                style={{ fontSize: 13, color: 'var(--text-secondary)' }}
                onClick={() => { editorRef.current?.addText(item.style); setShowTextMenu(false); }}
              >
                <span style={{ fontSize: 16, width: 20 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image Upload */}
      <button
        className="btn btn-ghost"
        style={{ padding: '6px 10px' }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Image size={15} />
        <span style={{ fontSize: 13 }}>Image</span>
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

      {/* Shapes */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost"
          style={{ gap: 4, padding: '6px 10px' }}
          onClick={() => { setShowShapeMenu(v => !v); setShowTextMenu(false); setShowExportMenu(false); setShowBgPicker(false); }}
        >
          <Square size={15} />
          <span style={{ fontSize: 13 }}>Shape</span>
          <ChevronDown size={12} />
        </button>
        {showShapeMenu && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6,
            background: '#1c1e33', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 6, minWidth: 150, zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {[
              { label: 'Rectangle', icon: <Square size={14} />, shape: 'rect' as const },
              { label: 'Circle', icon: <Circle size={14} />, shape: 'circle' as const },
              { label: 'Line', icon: <Minus size={14} />, shape: 'line' as const },
            ].map(item => (
              <button key={item.shape}
                className="layer-item w-full"
                style={{ fontSize: 13 }}
                onClick={() => { editorRef.current?.addShape(item.shape); setShowShapeMenu(false); }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Background */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost"
          style={{ gap: 6, padding: '6px 10px' }}
          onClick={() => { setShowBgPicker(v => !v); setShowTextMenu(false); setShowShapeMenu(false); setShowExportMenu(false); }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: 4,
            background: bgColor,
            border: '2px solid rgba(255,255,255,0.2)',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 13 }}>Background</span>
          <ChevronDown size={12} />
        </button>
        {showBgPicker && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6,
            background: '#1c1e33', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 12, zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            width: 220,
          }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Presets</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 12 }}>
              {BG_PRESETS.map(c => (
                <button
                  key={c}
                  onClick={() => { editorRef.current?.setBackground(c); onBgChange(c); }}
                  style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: c,
                    border: bgColor === c ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.1s',
                  }}
                  title={c}
                />
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Custom</p>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => { editorRef.current?.setBackground(e.target.value); onBgChange(e.target.value); }}
              style={{ width: '100%', height: 36, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent' }}
            />
          </div>
        )}
      </div>

      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', margin: '0 6px' }} />

      {/* Selection tools */}
      {hasSelection && (
        <>
          <button className="btn-icon tooltip" data-tip="Duplicate (⌘D)" onClick={() => editorRef.current?.duplicate()}>
            <Copy size={15} />
          </button>
          <button className="btn-icon tooltip" data-tip="Center on canvas" onClick={() => editorRef.current?.centerSelected()}>
            <AlignCenter size={15} />
          </button>
          <button className="btn-icon tooltip btn-danger" data-tip="Delete (Del)" onClick={() => editorRef.current?.deleteSelected()}>
            <Trash2 size={15} />
          </button>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', margin: '0 6px' }} />
        </>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Save */}
      <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={onSave}>
        <Save size={15} />
        <span style={{ fontSize: 13 }}>Save</span>
      </button>

      {/* Export */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-primary"
          style={{ padding: '7px 14px' }}
          onClick={() => { setShowExportMenu(v => !v); setShowTextMenu(false); setShowShapeMenu(false); setShowBgPicker(false); }}
        >
          <Download size={15} />
          <span style={{ fontSize: 13 }}>Export</span>
          <ChevronDown size={12} />
        </button>
        {showExportMenu && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6,
            background: '#1c1e33', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 6, minWidth: 170, zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <button className="layer-item w-full" style={{ fontSize: 13 }}
              onClick={() => { editorRef.current?.exportPNG(); setShowExportMenu(false); }}>
              <FileImage size={14} />
              Export as PNG (2×)
            </button>
            <button className="layer-item w-full" style={{ fontSize: 13 }}
              onClick={() => { editorRef.current?.exportJPEG(); setShowExportMenu(false); }}>
              <FileImage size={14} />
              Export as JPEG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
