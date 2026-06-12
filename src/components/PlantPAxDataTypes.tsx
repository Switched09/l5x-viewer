import { useMemo, useState } from 'react';
import { PlantPAxTag, PlantPAxParameter } from '../types/L5XTypes';

interface Props {
  tags: PlantPAxTag[];
}

const DATATYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  P_ANALOG_INPUT:         { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' },
  P_ANALOG_OUTPUT:        { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  P_DISCRETE_OUTPUT:      { bg: '#fefce8', border: '#fde047', text: '#854d0e' },
  P_INTERLOCK:            { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c' },
  P_MOTOR_DISCRETE:       { bg: '#f5f3ff', border: '#c4b5fd', text: '#6d28d9' },
  P_VARIABLE_SPEED_DRIVE: { bg: '#fff7ed', border: '#fdba74', text: '#c2410c' },
  P_VALVE_DISCRETE:       { bg: '#f0fdfa', border: '#5eead4', text: '#0f766e' },
};

// ── Small parameter table (Input or Output list) ───────────────────────────
function ParamTable({ title, color, params }: {
  title: string;
  color: string;
  params: PlantPAxParameter[];
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <p style={{
        margin: '0 0 0.3rem 0',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color,
      }}>
        {title} ({params.length})
      </p>
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>DataType</th>
            </tr>
          </thead>
          <tbody>
            {params.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: '0.4rem', color: '#bbb', textAlign: 'center' }}>—</td></tr>
            ) : (
              params.map((p, i) => (
                <tr key={p.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={{ padding: '0.3rem 0.5rem', fontFamily: 'monospace', fontSize: '0.79rem' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '0.3rem 0.5rem', color: '#555' }}>{p.dataType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.3rem 0.5rem',
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
  fontWeight: 600,
  color: '#64748b',
  fontSize: '0.75rem',
};

// ── Main component ──────────────────────────────────────────────────────────
export function PlantPAxDataTypes({ tags }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTag,  setSelectedTag]  = useState<PlantPAxTag | null>(null);

  const presentTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    tags.forEach(t => { counts[t.dataType] = (counts[t.dataType] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tags]);

  const filteredTags = useMemo(() =>
    selectedType ? tags.filter(t => t.dataType === selectedType) : tags,
    [tags, selectedType]
  );

  if (tags.length === 0) {
    return (
      <div style={{ color: '#999', fontSize: '0.85rem', padding: '0.5rem' }}>
        No PlantPAx DataType tags found in this program.
      </div>
    );
  }

  const inputParams    = selectedTag?.parameters.filter(p => p.direction === 'Input')    ?? [];
  const outputParams   = selectedTag?.parameters.filter(p => p.direction === 'Output')   ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.6rem' }}>

      {/* ── DataType filter chips ── */}
      <div style={{ flexShrink: 0 }}>
        <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Filter by DataType
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          <button onClick={() => { setSelectedType(null); setSelectedTag(null); }} style={chipStyle(selectedType === null, '#1e3a5f', '#1e3a5f')}>
            All ({tags.length})
          </button>
          {presentTypes.map(([type, count]) => {
            const c = DATATYPE_COLORS[type] ?? { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
            const active = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => { setSelectedType(active ? null : type); setSelectedTag(null); }}
                style={chipStyle(active, c.text, c.border, c.bg)}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tag list + parameter panel ── */}
      <div style={{ flex: 1, display: 'flex', gap: '0.75rem', overflow: 'hidden' }}>

        {/* Tag table */}
        <div style={{ flex: selectedTag ? '0 0 45%' : '1', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'flex 0.2s' }}>
          <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Tags — click a row to inspect parameters
          </p>
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
                  {['Tag Name', 'DataType', 'Scope', 'Description'].map(h => (
                    <th key={h} style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderBottom: '2px solid #cbd5e1', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTags.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '0.6rem', color: '#999', textAlign: 'center' }}>No tags.</td></tr>
                ) : (
                  filteredTags.map((tag) => {
                    const c = DATATYPE_COLORS[tag.dataType] ?? { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
                    const isSelected = selectedTag?.name === tag.name && selectedTag?.scope === tag.scope;
                    return (
                      <tr
                        key={`${tag.scope}-${tag.name}`}
                        onClick={() => setSelectedTag(isSelected ? null : tag)}
                        style={{
                          background: isSelected ? '#eff6ff' : 'inherit',
                          cursor: 'pointer',
                          outline: isSelected ? '2px solid #93c5fd' : 'none',
                          outlineOffset: -1,
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'inherit'; }}
                      >
                        <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'monospace', fontWeight: 500 }}>
                          {tag.name}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem' }}>
                          <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.76rem', fontWeight: 600 }}>
                            {tag.dataType}
                          </span>
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', color: '#555', fontSize: '0.8rem' }}>
                          {tag.scope}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', color: '#666' }}>
                          {tag.description || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#aaa' }}>
            {filteredTags.length} of {tags.length} tag(s)
          </p>
        </div>

        {/* ── Parameter detail panel — only when a tag is selected ── */}
        {selectedTag && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '1px solid #e5e7eb', paddingLeft: '0.75rem' }}>

            {/* Panel header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexShrink: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1e3a5f' }}>
                📋 {selectedTag.name}
                <span style={{ fontWeight: 400, color: '#888', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                  ({selectedTag.dataType})
                </span>
              </p>
              <button
                onClick={() => setSelectedTag(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem', lineHeight: 1 }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Two-column: Inputs | Outputs */}
            <div style={{ flex: 1, display: 'flex', gap: '0.6rem', overflow: 'hidden' }}>
              <ParamTable title="🟦 Input Parameters"  color="#1d4ed8" params={inputParams}  />
              <ParamTable title="🟩 Output Parameters" color="#15803d" params={outputParams} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function chipStyle(active: boolean, textColor: string, border: string, bg = '#fff'): React.CSSProperties {
  return {
    padding: '0.22rem 0.65rem',
    borderRadius: 20,
    border: `1px solid ${active ? textColor : border}`,
    background: active ? textColor : bg,
    color: active ? '#fff' : textColor,
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: active ? 700 : 500,
  };
}