'use client';

import { Layers, Trash2, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import type { CanvasEditorHandle } from './CanvasEditor';

interface LayerItem {
  id: string;
  label: string;
  selected: boolean;
}

interface Props {
  editorRef: React.RefObject<CanvasEditorHandle>;
  layers: LayerItem[];
  onRefresh: () => void;
}

export default function LayersPanel({ editorRef, layers, onRefresh }: Props) {
  const handleSelect = (index: number) => {
    editorRef.current?.selectObject(index);
    onRefresh();
  };

  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    editorRef.current?.deleteObject(index);
    onRefresh();
  };

  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    editorRef.current?.moveObjectUp(index);
    onRefresh();
  };

  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    editorRef.current?.moveObjectDown(index);
    onRefresh();
  };

  return (
    <div className="panel-right flex flex-col shrink-0" style={{ width: 200, height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
        <Layers size={14} style={{ color: '#6366f1' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Layers
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 10, fontWeight: 700,
          color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.06)',
          padding: '2px 6px', borderRadius: 10,
        }}>
          {layers.length}
        </span>
      </div>

      {/* Layer list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px' }}>
        {layers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 12px' }}>
            <Eye size={24} style={{ margin: '0 auto 10px', color: 'var(--text-muted)', display: 'block' }} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Canvas is empty.<br />Add elements to see layers.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {layers.map((layer, index) => (
              <div
                key={`${layer.id}-${index}`}
                onClick={() => handleSelect(index)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: layer.selected ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: layer.selected ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  fontSize: 11,
                  color: layer.selected ? '#a5b4fc' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (!layer.selected) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={e => {
                  if (!layer.selected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* Label */}
                <span style={{
                  flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontWeight: layer.selected ? 600 : 400,
                }}>
                  {layer.label}
                </span>

                {/* Actions (show on selected or hover) */}
                <div style={{ display: 'flex', gap: 1, opacity: layer.selected ? 1 : 0 }}
                  className="layer-actions">
                  <button
                    title="Move up"
                    onClick={(e) => handleMoveUp(index, e)}
                    style={{
                      padding: 2, borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <ChevronUp size={11} />
                  </button>
                  <button
                    title="Move down"
                    onClick={(e) => handleMoveDown(index, e)}
                    style={{
                      padding: 2, borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <ChevronDown size={11} />
                  </button>
                  <button
                    title="Delete"
                    onClick={(e) => handleDelete(index, e)}
                    style={{
                      padding: 2, borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#f43f5e')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          Click layer to select.<br />
          ↑↓ to reorder stack.
        </p>
      </div>
    </div>
  );
}
