'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATES, CATEGORIES } from '@/lib/templates';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = TEMPLATES.filter(t =>
    activeCategory === 'all' || t.category === activeCategory
  );

  const openEditor = (templateId?: string) => {
    const url = templateId ? `/editor?template=${templateId}` : '/editor';
    router.push(url);
  };

  const CAT_ICONS: Record<string, string> = {
    all: '✦', flyer: '📄', logo: '◆', certificate: '🏅', social: '📲',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 40px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(13,14,26,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #6366f1, #f43f5e)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: '#fff',
            fontFamily: 'Impact',
            letterSpacing: 1,
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}>O</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#f1f3f9', letterSpacing: 2 }}>
            ONIMIX
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            color: '#6366f1', background: 'rgba(99,102,241,0.12)',
            padding: '2px 7px', borderRadius: 20, border: '1px solid rgba(99,102,241,0.25)',
          }}>STUDIO</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => openEditor()}
          style={{ gap: 8 }}
        >
          Open Editor
          <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: '80px 40px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -80, left: '10%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -40, right: '10%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(244,63,94,0.1), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 20, padding: '5px 14px', marginBottom: 24,
          fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: '0.04em',
        }}>
          <Sparkles size={12} />
          FREE DESIGN EDITOR — NO ACCOUNT NEEDED
        </div>

        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: 800,
          color: '#f1f3f9',
          lineHeight: 1.1,
          margin: '0 0 20px',
          letterSpacing: '-1px',
        }}>
          Design anything,{' '}
          <span style={{
            background: 'linear-gradient(135deg, #818cf8, #f43f5e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>instantly.</span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-secondary)',
          maxWidth: 500, margin: '0 auto 36px',
          lineHeight: 1.7,
        }}>
          Create stunning flyers, logos, certificates and social posts with drag-and-drop templates.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 15, padding: '12px 28px', gap: 8 }}
            onClick={() => openEditor()}
          >
            Start from scratch
            <ArrowRight size={16} />
          </button>
          <button
            className="btn btn-ghost"
            style={{
              fontSize: 15, padding: '12px 28px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Browse templates
          </button>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
          {[
            { icon: <Zap size={14} />, text: 'Instant drag & drop' },
            { icon: <Shield size={14} />, text: 'Saved locally' },
            { icon: <Sparkles size={14} />, text: '10+ templates' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontSize: 13, color: 'var(--text-muted)',
            }}>
              <span style={{ color: '#6366f1' }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Templates section */}
      <div id="templates" style={{ padding: '0 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: '#f1f3f9', margin: '0 0 4px' }}>
              Templates
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Click any template to open it in the editor
            </p>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13, fontWeight: 600,
                  border: '1px solid',
                  borderColor: activeCategory === cat.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: activeCategory === cat.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: activeCategory === cat.id ? '#a5b4fc' : 'var(--text-muted)',
                }}
              >
                {CAT_ICONS[cat.id]} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 20,
        }}>
          {filtered.map(template => {
            const isHov = hovered === template.id;
            const aspectRatio = template.height / template.width;
            const previewH = Math.min(160, 240 * aspectRatio);

            return (
              <div
                key={template.id}
                onClick={() => openEditor(template.id)}
                onMouseEnter={() => setHovered(template.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isHov ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.07)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHov ? 'translateY(-4px) scale(1.01)' : 'none',
                  boxShadow: isHov ? '0 16px 40px rgba(99,102,241,0.25)' : '0 2px 8px rgba(0,0,0,0.3)',
                  background: '#1c1e33',
                }}
              >
                {/* Preview */}
                <div style={{
                  height: previewH,
                  background: template.thumbnail,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {isHov && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(1px)',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: '#6366f1',
                        color: '#fff',
                        padding: '8px 18px',
                        borderRadius: 24,
                        fontSize: 13, fontWeight: 700,
                        boxShadow: '0 4px 16px rgba(99,102,241,0.5)',
                      }}>
                        Use Template
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  )}

                  {/* Category badge */}
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    padding: '3px 8px', borderRadius: 20,
                    fontSize: 10, fontWeight: 700,
                    color: 'rgba(255,255,255,0.8)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {template.category}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: '#f1f3f9' }}>
                    {template.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                    {template.width} × {template.height}px
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 40px',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--text-muted)',
      }}>
        ONIMIX Studio — Built with Next.js, Fabric.js & Tailwind CSS
      </footer>
    </div>
  );
}
