import { AoiNode } from '../types/L5XTypes';

interface Props {
  aoi: AoiNode | null;
}

const USAGE_COLORS: Record<string, string> = {
  Input:    '#dcfce7',
  Output:   '#fee2e2',
  InOut:    '#fef9c3',
  Local:    '#f3f4f6',
};

export function AoiParameters({ aoi }: Props) {
  if (!aoi) {
    return (
      <div style={{ color: '#999', fontSize: '0.85rem', padding: '0.5rem' }}>
        Select an AOI from the list above to view its parameters.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#333' }}>
        Parameters — <span style={{ color: '#2563eb' }}>{aoi.name}</span>
      </h3>
      {aoi.description && (
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#666' }}>
          {aoi.description}
        </p>
      )}

      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
              {['Parameter Name', 'Usage', 'Data Type', 'Description'].map(h => (
                <th key={h} style={{
                  padding: '0.4rem 0.6rem',
                  textAlign: 'left',
                  borderBottom: '2px solid #cbd5e1',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  color: '#374151',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aoi.parameters.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '0.5rem', color: '#999' }}>
                  No parameters defined.
                </td>
              </tr>
            ) : (
              aoi.parameters.map((param, idx) => (
                <tr
                  key={param.name}
                  style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}
                >
                  <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'monospace', fontWeight: 500 }}>
                    {param.name}
                  </td>
                  <td style={{ padding: '0.4rem 0.6rem' }}>
                    <span style={{
                      background: USAGE_COLORS[param.usage] || '#f3f4f6',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 3,
                      fontSize: '0.78rem',
                      fontWeight: 500,
                    }}>
                      {param.usage}
                    </span>
                  </td>
                  <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'monospace', color: '#7c3aed' }}>
                    {param.dataType}
                  </td>
                  <td style={{ padding: '0.4rem 0.6rem', color: '#555' }}>
                    {param.description || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}