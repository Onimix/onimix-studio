'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { CanvasEditorHandle } from '@/components/CanvasEditor';
import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';
import LayersPanel from '@/components/LayersPanel';
import type { Template } from '@/lib/templates';
import { saveDesign } from '@/utils/storage';

const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false });

interface LayerItem {
  id: string;
  label: string;
  selected: boolean;
}

export default function EditorPage() {
  const editorRef = useRef<CanvasEditorHandle>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [designName, setDesignName] = useState('My Design');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const refreshLayers = useCallback(() => {
    if (editorRef.current) {
      setLayers(editorRef.current.getObjects());
    }
  }, []);

  const handleTemplateLoad = useCallback((template: Template) => {
    editorRef.current?.loadTemplate(template);
    setBgColor(template.background);
    showToast(`Template "${template.name}" loaded!`);
  }, []);

  const handleSave = () => setSaveModal(true);

  const confirmSave = () => {
    if (!editorRef.current) return;
    setSaving(true);
    const canvas = editorRef.current.getCanvas();
    if (!canvas) return;

    const json = editorRef.current.saveJSON();
    if (!json) return;

    const thumbnail = canvas.toDataURL({ format: 'jpeg', quality: 0.4, multiplier: 0.25 });

    saveDesign({
      name: designName,
      json,
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      background: bgColor,
      thumbnail,
    });

    setSaving(false);
    setSaveModal(false);
    showToast(`"${designName}" saved!`);
  };

  // Load template from URL param (coming from home page)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('template');
    if (templateId) {
      import('@/lib/templates').then(({ TEMPLATES }) => {
        const t = TEMPLATES.find(t => t.id === templateId);
        if (t) {
          setTimeout(() => handleTemplateLoad(t), 500);
        }
      });
    }
  }, [handleTemplateLoad]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Toolbar */}
      <Toolbar
        editorRef={editorRef}
        hasSelection={hasSelection}
        onSave={handleSave}
        bgColor={bgColor}
        onBgChange={setBgColor}
      />

      {/* Main workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar editorRef={editorRef} onTemplateLoad={handleTemplateLoad} />

        {/* Canvas area */}
        <CanvasEditor
          ref={editorRef}
          onSelectionChange={setHasSelection}
          onObjectsChange={refreshLayers}
          canvasWidth={600}
          canvasHeight={600}
        />

        {/* Layers panel */}
        <LayersPanel
          editorRef={editorRef}
          layers={layers}
          onRefresh={refreshLayers}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#1c1e33' : '#3b0a0a',
          border: `1px solid ${toast.type === 'success' ? 'rgba(99,102,241,0.4)' : 'rgba(244,63,94,0.4)'}`,
          color: toast.type === 'success' ? '#a5b4fc' : '#fca5a5',
          padding: '10px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 1000,
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          whiteSpace: 'nowrap',
        }}>
          {toast.type === 'success' ? '✓ ' : '✗ '}{toast.msg}
        </div>
      )}

      {/* Save modal */}
      {saveModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
          backdropFilter: 'blur(4px)',
        }} onClick={() => setSaveModal(false)}>
          <div
            style={{
              background: '#1c1e33',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: 28,
              width: 340,
              boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
              animation: 'scaleIn 0.2s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#f1f3f9', margin: '0 0 6px' }}>
              Save Design
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 18px' }}>
              Give your design a name to save it locally.
            </p>
            <input
              className="input"
              value={designName}
              onChange={e => setDesignName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmSave()}
              placeholder="Design name..."
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setSaveModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={confirmSave}
                disabled={saving || !designName.trim()}
              >
                {saving ? 'Saving…' : 'Save Design'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
