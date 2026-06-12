import { useMemo, useState } from 'react';
import { PlantPAxTag } from '../types/L5XTypes';

interface Props {
  tags: PlantPAxTag[];
}

const DATATYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  P_ANALOG_INPUT:        { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' },
  P_ANALOG_OUTPUT:       { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  P_DISCRETE_OUTPUT:     { bg: '#fefce8', border: '#fde047', text: '#854d0e' },
  P_INTERLOCK:           { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c' },
  P_MOTOR_DISCRETE:      { bg: '#f5f3ff', border: '#c4b5fd', text: '#6d28d9' },
  P_VARIABLE_SPEED_DRIVE:{ bg: '#fff7ed', border: '#fdba74', text: '#c2410c' },
  P_VALVE_DISCRETE:      { bg: '#f0fdfa', border: '#5eead4', text: '#0f766e' },
};

export function PlantPAxDataTypes({ tags }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Build list of DataTypes actually present in the file
  const presentTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    tags.forEach(t => {
      counts[t.dataType] = (counts[t.dataType] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tags]);

  // Tags filtered by selected DataType
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>

      {/* ── DataType filter chips ── */}
      <div>
        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.78rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Filter by DataType
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>

          {/* All chip */}
          <button
            onClick={() => setSelectedType(null)}
            style={{
              padding: '0.25rem 0.7rem',
              borderRadius: 20,
              border: `1px solid ${selectedType === null ? '#1e3a5f' : '#cbd5e1'}`,
              background: selectedType === null ? '#1e3a5f' : '#fff',
              color: selectedType === null ? '#fff' : '#555',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: selectedType === null ? 700 : 400,
            }}
          >
            All ({tags.length})
          </button>

          {/* One chip per DataType found */}
          {presentTypes.map(([type, count]) => {
            const colors = DATATYPE_COLORS[type] ?? { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
            const active  = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(active ? null : type)}
                style={{
                  padding: '0.25rem 0.7rem',
                  borderRadius: 20,
                  border: `1px solid ${active ? colors.text : colors.border}`,
                  background: active ? colors.text : colors.bg,
                  color: active ? '#fff' : colors.text,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: active ? 700 : 500,
                }}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tag table ── */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
              {['Tag Name', 'DataType', 'Scope', 'Description'].map(h => (
                <th key={h} style={{
                  padding: '0.4rem 0.6rem',
                  textAlign: 'left',
                  borderBottom: '2px solid #cbd5e1',
                  fontWeight: 600,
                  color: '#374151',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTags.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '0.6rem', color: '#999', textAlign: 'center' }}>
                  No tags found for this DataType.
                </td>
              </tr>
            ) : (
              filteredTags.map((tag, idx) => {
                const colors = DATATYPE_COLORS[tag.dataType] ?? { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
                return (
                  <tr key={`${tag.scope}-${tag.name}`}
                    style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'monospace', fontWeight: 500 }}>
                      {tag.name}
                    </td>
                    <td style={{ padding: '0.4rem 0.6rem' }}>
                      <span style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        padding: '0.1rem 0.45rem',
                        borderRadius: 4,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}>
                        {tag.dataType}
                      </span>
                    </td>
                    <td style={{ padding: '0.4rem 0.6rem', color: '#555', fontSize: '0.82rem' }}>
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

      <p style={{ margin: 0, fontSize: '0.78rem', color: '#999' }}>
        Showing {filteredTags.length} of {tags.length} tag(s)
      </p>
    </div>
  );
}