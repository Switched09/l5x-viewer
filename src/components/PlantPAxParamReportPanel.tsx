import axios from 'axios';
import { useState, useMemo } from 'react';
import { ControllerNode, PlantPAxParameter } from '../types/L5XTypes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

type Direction = 'All' | 'Input' | 'Output';

export function PlantPAxParamReportPanel({ controller, l5xFile }: Props) {
  const [selectedType,   setSelectedType]   = useState<string>('');
  const [direction,      setDirection]      = useState<Direction>('All');
  const [checkedParams,  setCheckedParams]  = useState<Set<string>>(new Set());
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  // ── Unique DataTypes present in FBD blocks ────────────────────────────────
  const availableTypes = useMemo(() => {
    const seen = new Set<string>();
    return (controller.plantPAxBlocks ?? [])
      .map(b => b.plantPAxDataType)
      .filter(t => { if (seen.has(t)) return false; seen.add(t); return true; })
      .sort();
  }, [controller.plantPAxBlocks]);

  // ── Parameters for the selected DataType ─────────────────────────────────
  // Use the first tag that matches — PlantPAx params are standardised per type
  const allParams = useMemo<PlantPAxParameter[]>(() => {
    if (!selectedType) return [];
    const matchedTag = (controller.plantPAxTags ?? [])
      .find(t => t.dataType === selectedType);
    return matchedTag?.parameters ?? [];
  }, [controller.plantPAxTags, selectedType]);

  // ── Apply direction filter to the grid ───────────────────────────────────
  const visibleParams = useMemo(() => {
    return allParams.filter(p => {
      if (p.direction === 'Internal') return false;
      if (direction === 'Input')  return p.direction === 'Input';
      if (direction === 'Output') return p.direction === 'Output';
      return true;   // All
    });
  }, [allParams, direction]);

  // ── When DataType changes: reset everything ───────────────────────────────
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setDirection('All');
    setCheckedParams(new Set());
    setError(null);
  };

  // ── When Direction changes: reset checkbox selection ─────────────────────
  const handleDirectionChange = (dir: Direction) => {
    setDirection(dir);
    setCheckedParams(new Set());
    setError(null);
  };

  // ── Checkbox helpers ──────────────────────────────────────────────────────
  const toggle = (name: string) => {
    setCheckedParams(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const selectAll = () =>
    setCheckedParams(new Set(visibleParams.map(p => p.name)));

  const deselectAll = () =>
    setCheckedParams(new Set());

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!l5xFile || !selectedType || checkedParams.size === 0) return;
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('file',               l5xFile);
      form.append('dataType',           selectedType);
      form.append('direction',          direction);
      form.append('selectedParamsJson', JSON.stringify(Array.from(checkedParams)));


/*
      const res = await fetch('/api/l5x/plantpax-param-report', {
        method: 'POST',
        body: form,
      });

*/  

      const res = await fetch(API_URL + '/api/l5x/plantpax-param-report', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `PlantPAx_${selectedType}_${direction}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const colors = selectedType
    ? (DATATYPE_COLORS[selectedType] ?? { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' })
    : { bg: '#fff', border: '#d1d5db', text: '#374151' };

  const blockCount = (controller.plantPAxBlocks ?? [])
    .filter(b => b.plantPAxDataType === selectedType).length;

  if (availableTypes.length === 0) {
    return (
      <div style={{ color: '#999', fontSize: '0.85rem', padding: '0.5rem' }}>
        No PlantPAx FBD Block nodes found. Upload a file with PlantPAx Tasking Model enabled.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.9rem' }}>

      {/* ── Title ── */}
      <div style={{ flexShrink: 0 }}>
        <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', color: '#1e3a5f' }}>
          PlantPAx Parameter Report
        </h3>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>
          Select a DataType, filter by direction, then choose which parameters to include.
        </p>
      </div>

      {/* ── Row: two dropdowns side by side ── */}
      <div style={{ display: 'flex', gap: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>

        {/* Dropdown 1 — DataType */}
        <div style={{ flex: '1 1 220px' }}>
          <label style={labelStyle}>1. PlantPAx DataType</label>
          <select
            value={selectedType}
            onChange={e => handleTypeChange(e.target.value)}
            style={selectStyle()}
          >
            <option value="">— select DataType —</option>
            {availableTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {selectedType && (
            <span style={{
              display: 'inline-block', marginTop: '0.35rem',
              padding: '0.15rem 0.55rem', borderRadius: 20,
              background: colors.bg, border: `1px solid ${colors.border}`,
              color: colors.text, fontSize: '0.75rem', fontWeight: 600,
            }}>
              {blockCount} block(s) in file
            </span>
          )}
        </div>

        {/* Dropdown 2 — Direction filter */}
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ ...labelStyle, color: selectedType ? '#374151' : '#bbb' }}>
            2. Filter by Usage
          </label>
          <select
            value={direction}
            onChange={e => handleDirectionChange(e.target.value as Direction)}
            disabled={!selectedType}
            style={selectStyle(!selectedType)}
          >
            <option value="All">All</option>
            <option value="Input">Input</option>
            <option value="Output">Output</option>
          </select>
        </div>
      </div>

      {/* ── Parameter selection grid ── */}
      {selectedType && visibleParams.length > 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Grid header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '0.35rem', flexShrink: 0,
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              3. Select Parameters ({checkedParams.size} of {visibleParams.length} selected)
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={selectAll}   style={miniBtn('#1e3a5f')}>Select All</button>
              <button onClick={deselectAll} style={miniBtn('#6b7280')}>Deselect All</button>
            </div>
          </div>

          {/* Scrollable table */}
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 5 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
                  <th style={th()}>✓</th>
                  <th style={th()}>Parameter Name</th>
                  <th style={th()}>DataType</th>
                  <th style={th()}>Direction</th>
                </tr>
              </thead>
              <tbody>
                {visibleParams.map((param, idx) => {
                  const checked = checkedParams.has(param.name);
                  const dirColor = param.direction === 'Input' ? '#1d4ed8' : '#15803d';
                  const dirBg   = param.direction === 'Input' ? '#eff6ff' : '#f0fdf4';
                  return (
                    <tr
                      key={param.name}
                      onClick={() => toggle(param.name)}
                      style={{
                        background: checked ? '#f0fdf4' : idx % 2 === 0 ? '#fff' : '#f9fafb',
                        cursor: 'pointer',
                        outline: checked ? '1px solid #86efac' : 'none',
                        outlineOffset: -1,
                      }}
                    >
                      <td style={{ padding: '0.35rem 0.6rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(param.name)}
                          onClick={e => e.stopPropagation()}
                          style={{ cursor: 'pointer', width: 15, height: 15 }}
                        />
                      </td>
                      <td style={{ padding: '0.35rem 0.6rem', fontFamily: 'monospace', fontWeight: checked ? 700 : 400 }}>
                        {param.name}
                      </td>
                      <td style={{ padding: '0.35rem 0.6rem', color: '#555' }}>
                        {param.dataType}
                      </td>
                      <td style={{ padding: '0.35rem 0.6rem' }}>
                        <span style={{
                          background: dirBg,
                          color: dirColor,
                          padding: '0.1rem 0.45rem',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          {param.direction}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No params message */}
      {selectedType && visibleParams.length === 0 && (
        <div style={{ color: '#999', fontSize: '0.83rem' }}>
          No parameters found for the selected DataType and direction.
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          padding: '0.5rem 0.75rem', background: '#fef2f2',
          border: '1px solid #fca5a5', borderRadius: 5,
          color: '#b91c1c', fontSize: '0.82rem', flexShrink: 0,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Download button ── */}
      <div style={{ flexShrink: 0 }}>
        <button
          onClick={handleDownload}
          disabled={!selectedType || !l5xFile || checkedParams.size === 0 || loading}
          style={{
            padding: '0.55rem 1.25rem',
            background: (!selectedType || !l5xFile || checkedParams.size === 0 || loading)
              ? '#94a3b8' : '#1e3a5f',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: (!selectedType || !l5xFile || checkedParams.size === 0 || loading)
              ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.88rem',
          }}
        >
          {loading
            ? '⏳ Generating…'
            : checkedParams.size === 0
              ? '⬇️ Download CSV (select parameters first)'
              : `⬇️ Download CSV — ${checkedParams.size} parameter(s)`}
        </button>
      </div>

    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.3rem',
  fontSize: '0.78rem', fontWeight: 700,
  color: '#374151', textTransform: 'uppercase', letterSpacing: 0.4,
};

const selectStyle = (disabled = false): React.CSSProperties => ({
  width: '100%', padding: '0.45rem 0.65rem',
  borderRadius: 6, border: '1px solid #cbd5e1',
  fontSize: '0.85rem', color: disabled ? '#aaa' : '#1e293b',
  background: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
});

const th = (): React.CSSProperties => ({
  padding: '0.35rem 0.6rem', textAlign: 'left',
  borderBottom: '2px solid #cbd5e1',
  fontWeight: 600, color: '#374151', fontSize: '0.77rem',
  whiteSpace: 'nowrap',
});

const miniBtn = (color: string): React.CSSProperties => ({
  padding: '0.2rem 0.6rem', borderRadius: 4,
  border: `1px solid ${color}`, background: '#fff',
  color, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
});