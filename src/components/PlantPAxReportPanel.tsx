import { useState } from 'react';
import { ControllerNode } from '../types/L5XTypes';

interface Props {
  controller: ControllerNode;
  l5xFile: File | null;
}

const DATATYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  P_ANALOG_INPUT:         { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' },
  P_DISCRETE_INPUT:       { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1' },
  P_ANALOG_OUTPUT:        { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  P_DISCRETE_OUTPUT:      { bg: '#fefce8', border: '#fde047', text: '#854d0e' },
  P_INTERLOCK:            { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c' },
  P_MOTOR_DISCRETE:       { bg: '#f5f3ff', border: '#c4b5fd', text: '#6d28d9' },
  P_VARIABLE_SPEED_DRIVE: { bg: '#fff7ed', border: '#fdba74', text: '#c2410c' },
  P_VALVE_DISCRETE:       { bg: '#f0fdfa', border: '#5eead4', text: '#0f766e' },
};

export function PlantPAxReportPanel({ controller, l5xFile }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const blocks    = controller.plantPAxBlocks ?? [];
  const hasBlocks = blocks.length > 0;

  // ── Distribution summary ──────────────────────────────────────────────────
  const distribution = blocks.reduce<Record<string, Set<string>>>((acc, b) => {
    if (!acc[b.plantPAxDataType]) acc[b.plantPAxDataType] = new Set();
    acc[b.plantPAxDataType].add(b.operand);
    return acc;
  }, {});

  // ── Download Excel report ─────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!l5xFile) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', l5xFile);

      const res = await fetch('/api/l5x/plantpax-report', { method: 'POST', body: form });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `PlantPAx_Report_${controller.name}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!hasBlocks) {
    return (
      <div style={{ color: '#999', fontSize: '0.85rem', padding: '0.5rem' }}>
        No PlantPAx FBD Block nodes found in any FBD Routine.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1e3a5f' }}>
            PlantPAx FBD Block Report
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#888' }}>
            {blocks.length} block(s) found across{' '}
            {new Set(blocks.map(b => b.program)).size} program(s) —{' '}
            {new Set(blocks.map(b => b.operand)).size} unique tag(s)
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading || !l5xFile}
          style={{
            padding: '0.45rem 1rem',
            background: loading ? '#94a3b8' : '#1e3a5f',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            cursor: loading || !l5xFile ? 'not-allowed' : 'pointer',
            fontSize: '0.83rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          {loading ? '⏳ Generating…' : '⬇️ Download Excel'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.5rem 0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 5, color: '#b91c1c', fontSize: '0.82rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── DataType distribution chips ── */}
      <div style={{ flexShrink: 0 }}>
        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          DataType Distribution
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {Object.entries(distribution).sort().map(([type, tags]) => {
            const c = DATATYPE_COLORS[type] ?? { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
            return (
              <div key={type} style={{
                padding: '0.25rem 0.7rem',
                borderRadius: 20,
                border: `1px solid ${c.border}`,
                background: c.bg,
                color: c.text,
                fontSize: '0.78rem',
                fontWeight: 600,
              }}>
                {type}
                <span style={{ marginLeft: '0.4rem', opacity: 0.7, fontWeight: 400 }}>
                  {blocks.filter(b => b.plantPAxDataType === type).length} block(s) · {tags.size} tag(s)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Block table ── */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
              {['Program', 'Routine', 'Block Type', 'PlantPAx DataType', 'Operand (Tag)'].map(h => (
                <th key={h} style={{
                  padding: '0.4rem 0.6rem',
                  textAlign: 'left',
                  borderBottom: '2px solid #cbd5e1',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blocks
              .slice()
              .sort((a, b) => a.program.localeCompare(b.program) || a.routine.localeCompare(b.routine))
              .map((block, idx) => {
                const c = DATATYPE_COLORS[block.plantPAxDataType] ?? { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
                return (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: '0.35rem 0.6rem', color: '#374151' }}>{block.program}</td>
                    <td style={{ padding: '0.35rem 0.6rem', color: '#555' }}>{block.routine}</td>
                    <td style={{ padding: '0.35rem 0.6rem', fontFamily: 'monospace', fontWeight: 600, color: '#1e3a5f' }}>
                      {block.blockType}
                    </td>
                    <td style={{ padding: '0.35rem 0.6rem' }}>
                      <span style={{
                        background: c.bg,
                        color: c.text,
                        border: `1px solid ${c.border}`,
                        padding: '0.1rem 0.4rem',
                        borderRadius: 4,
                        fontSize: '0.76rem',
                        fontWeight: 600,
                      }}>
                        {block.plantPAxDataType}
                      </span>
                    </td>
                    <td style={{ padding: '0.35rem 0.6rem', fontFamily: 'monospace', color: '#374151' }}>
                      {block.operand}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa', flexShrink: 0 }}>
        Excel report includes 3 sheets: Block Usage · DataType Distribution · Tag Parameter Detail
      </p>
    </div>
  );
}