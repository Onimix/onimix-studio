'use client';

import { useState } from 'react';
import type { CanvasEditorHandle } from './CanvasEditor';
import { TEMPLATES, CATEGORIES, type Template, type TemplateCategory } from '@/lib/templates';
import { getSavedDesigns, deleteSavedDesign, type SavedDesign } from '@/utils/storage';
import { LayoutTemplate, BookMarked, Trash2, RefreshCw } from 'lucide-react';

interface Props {
  editorRef: React.RefObject<CanvasEditorHandle>;
  onTemplateLoad: (template: Template) => void;
}

export default function Sidebar({ editorRef, onTemplateLoad }: Props) {
  const [activeTab, setActiveTab] = useState<'templates' | 'saved'>('templates');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [saves, setSaves] = useState<SavedDesign[]>(() => getSavedDesigns());

  const filtered = TEMPLATES.filter(t =>
    activeCategory === 'all' || t.category === activeCategory
  );

  const refreshSaves = () => setSaves(getSavedDesigns());

  const handleDeleteSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSavedDesign(id);
    refreshSaves();
  };

  const handleLoadSave = (save: SavedDesign) => {
    editorRef.current?.loadJSON(save.json, save.background, save.width, save.height);
  };

  const CATEGORY_ICONS: Record<string, string> = {
    all: '✦', flyer: '📄', logo: '◆', certificate: '🏅', social: '📲',
  };

  return (
    <div className="panel flex flex-col shrink-0" style={{ width: 220, height: '100%', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '8px 8px 0',
        gap: 4,
      }}>
        {[
          { id: 'templates', label: 'Templates', icon: <LayoutTemplate size={13} /> },
          { id: 'saved', label: 'Saved', icon: <BookMarked size={13} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as 'templates' | 'saved'); if (tab.id === 'saved') refreshSaves(); }}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '7px 4px',
              fontSize: 12, fontWeight: 600,
              borderRadius: '6px 6px 0 0',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.15s',
              background: activeTab === tab.id ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: activeTab === tab.id ? '#a5b4fc' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'templates' && (
        <>
          {/* Category filter */}
          <div style={{ padding: '10px 8px 4px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: activeCategory === cat.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  color: activeCategory === cat.id ? '#a5b4fc' : 'var(--text-muted)',
                }}
              >
                {CATEGORY_ICONS[cat.id]} {cat.label}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {filtered.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => onTemplateLoad(template)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'saved' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="section-label" style={{ padding: 0 }}>My Designs</span>
            <button className="btn-icon" style={{ padding: 4 }} onClick={refreshSaves}>
              <RefreshCw size={12} />
            </button>
          </div>

          {saves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <BookMarked size={28} style={{ margin: '0 auto 10px', color: 'var(--text-muted)', display: 'block' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                No saved designs yet.<br />Use Save to store your work.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {saves.map(save => (
                <div
                  key={save.id}
                  onClick={() => handleLoadSave(save)}
                  style={{
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.2s',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                >
                  {save.thumbnail && (
                    <img
                      src={save.thumbnail}
                      alt={save.name}
                      style={{ width: '100%', height: 72, objectFit: 'cover', display: 'block' }}
                    />
                  )}
                  <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{save.name}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
                        {new Date(save.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="btn-icon btn-danger"
                      style={{ padding: 4 }}
                      onClick={(e) => handleDeleteSave(save.id, e)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, onClick }: { template: Template; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  const aspectRatio = template.height / template.width;
  const previewH = Math.min(90, 90 * aspectRatio);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        border: hovered ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.07)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s',
        boxShadow: hovered ? '0 6px 20px rgba(99,102,241,0.25)' : 'none',
      }}
    >
      {/* Preview */}
      <div style={{
        height: previewH,
        background: template.thumbnail,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: '#fff', padding: '4px 10px',
              background: '#6366f1', borderRadius: 20,
              letterSpacing: '0.04em',
            }}>USE</span>
          </div>
        )}
      </div>
      {/* Label */}
      <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {template.name}
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
          {template.width}×{template.height}
        </p>
      </div>
    </div>
  );
}
