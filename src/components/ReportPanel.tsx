import { useState, useMemo } from 'react';
import axios from 'axios';
import { AoiNode, AoiParameter } from '../types/L5XTypes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Props {
  aoiList: AoiNode[];
  l5xFile: File | null;       // ← receives the original file
}

type UsageFilter = 'All' | 'Input' | 'Output';

interface ParamRow extends AoiParameter {
  selected: boolean;
}

export function ReportPanel({ aoiList, l5xFile }: Props) {
  const [selectedAoiName, setSelectedAoiName] = useState<string>('');
  const [usageFilter, setUsageFilter]         = useState<UsageFilter>('All');
  const [paramRows, setParamRows]             = useState<ParamRow[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [successMsg, setSuccessMsg]           = useState<string | null>(null);

  const handleAoiChange = (name: string) => {
    setSelectedAoiName(name);
    setUsageFilter('All');
    setError(null);
    setSuccessMsg(null);
    const aoi = aoiList.find(a => a.name === name);
    if (!aoi) { setParamRows([]); return; }
    setParamRows(
      aoi.parameters
        .filter(p => p.usage === 'Input' || p.usage === 'Output')
        .map(p => ({ ...p, selected: false }))
    );
  };

  const visibleRows = useMemo(() =>
    paramRows.filter(r => usageFilter === 'All' ? true : r.usage === usageFilter),
    [paramRows, usageFilter]
  );

  const toggleRow = (paramName: string) => {
    setParamRows(prev => prev.map(r => r.name === paramName ? { ...r, selected: !r.selected } : r));
  };

  const toggleAll = (checked: boolean) => {
    const visibleNames = new Set(visibleRows.map(r => r.name));
    setParamRows(prev => prev.map(r => visibleNames.has(r.name) ? { ...r, selected: checked } : r));
  };

  const selectedParams = paramRows.filter(r => r.selected);
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every(r => r.selected);

  const handleGenerateReport = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!l5xFile)            { setError('No file loaded. Please open a .L5X file first.'); return; }
    if (!selectedAoiName)    { setError('Select an AOI first.'); return; }
    if (selectedParams.length === 0) { setError('Select at least one parameter.'); return; }

    setLoading(true);
    try {
      // Send the file + parameters together — backend needs no memory of previous uploads
      const formData = new FormData();
      formData.append('file', l5xFile);
      formData.append('aoiName', selectedAoiName);
      formData.append('parametersJson', JSON.stringify(
        selectedParams.map(p => ({ name: p.name, usage: p.usage }))
      ));

      const response = await axios.post(
        `${API_URL}/api/l5x/report`,
        formData,
        { responseType: 'blob' }
      );

      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      const disposition = response.headers['content-disposition'] ?? '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      link.download = match?.[1] ?? `${selectedAoiName}_report.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg(`✅ Downloaded: ${link.download}`);
    } catch (err: any) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        setError(text || 'Report generation failed.');
      } else {
        setError(err.response?.data ?? 'Report generation failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>
      <h2 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: '#666', letterSpacing: 1 }}>
        Report Generator
      </h2>

      {/* ── Row 1: Combo boxes ── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Combo 1 — AOI selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={labelStyle}>Add-On Instruction</label>
          <select
            value={selectedAoiName}
            onChange={e => handleAoiChange(e.target.value)}
            style={selectStyle}
          >
            <option value="">— Select AOI —</option>
            {aoiList.map(a => (
              <option key={a.name} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Combo 2 — Usage filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={labelStyle}>Filter by Usage</label>
          <select
            value={usageFilter}
            onChange={e => setUsageFilter(e.target.value as UsageFilter)}
            style={selectStyle}
            disabled={!selectedAoiName}
          >
            <option value="All">All</option>
            <option value="Input">Input</option>
            <option value="Output">Output</option>
          </select>
        </div>
      </div>

      {/* ── Parameter grid ── */}
      {selectedAoiName && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
                  <th style={thStyle}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={e => toggleAll(e.target.checked)}
                      title="Select / deselect all visible"
                    />
                  </th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Parameter</th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Usage</th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Data Type</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '0.6rem', color: '#999', textAlign: 'center' }}>
                      No parameters match the selected filter.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row, idx) => (
                    <tr
                      key={row.name}
                      onClick={() => toggleRow(row.name)}
                      style={{
                        background: row.selected
                          ? '#eff6ff'
                          : idx % 2 === 0 ? '#fff' : '#f9fafb',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRow(row.name)}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 500 }}>
                        {row.name}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          background: row.usage === 'Input' ? '#dcfce7' : '#fee2e2',
                          padding: '0.1rem 0.4rem',
                          borderRadius: 3,
                          fontSize: '0.78rem',
                        }}>
                          {row.usage}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#7c3aed' }}>
                        {row.dataType}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Footer: status + generate button ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#555' }}>
              {selectedParams.length} of {paramRows.length} parameter(s) selected
            </span>

            <button
              onClick={handleGenerateReport}
              disabled={loading || selectedParams.length === 0}
              style={{
                marginLeft: 'auto',
                padding: '0.45rem 1.2rem',
                background: selectedParams.length > 0 ? '#1e3a5f' : '#94a3b8',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: selectedParams.length > 0 ? 'pointer' : 'default',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {loading ? 'Generating…' : '⬇ Download CSV Report'}
            </button>
          </div>

          {error   && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0.3rem 0 0' }}>{error}</p>}
          {successMsg && <p style={{ color: '#16a34a', fontSize: '0.82rem', margin: '0.3rem 0 0' }}>{successMsg}</p>}
        </div>
      )}

      {!selectedAoiName && (
        <p style={{ color: '#aaa', fontSize: '0.85rem' }}>
          Select an AOI to configure report parameters.
        </p>
      )}
    </div>
  );
}

// ── Shared styles ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#374151',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

const selectStyle: React.CSSProperties = {
  padding: '0.35rem 0.6rem',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: '0.85rem',
  minWidth: 220,
  background: '#fff',
};

const thStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  borderBottom: '2px solid #cbd5e1',
  fontWeight: 600,
  color: '#374151',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.38rem 0.6rem',
  borderBottom: '1px solid #f0f0f0',
};