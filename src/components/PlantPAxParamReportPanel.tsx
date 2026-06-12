import { useState, useMemo } from 'react';
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

type Direction = 'All' | 'Input' | 'Output';

export function PlantPAxParamReportPanel({ controller, l5xFile }: Props) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [direction,    setDirection]    = useState<Direction>('All');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // Unique DataTypes present in the file's FBD blocks
  const availableTypes = useMemo(() => {
    const seen = new Set<string>();
    return (controller.plantPAxBlocks ?? [])
      .map(b => b.plantPAxDataType)
      .filter(t => { if (seen.has(t)) return false; seen.add(t); return true; })
      .sort();
  }, [controller.plantPAxBlocks]);

  const colors = selectedType
    ? (DATATYPE_COLORS[selectedType] ?? { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' })
    : { bg: '#fff', border: '#d1d5db', text: '#374151' };

  const blockCount = useMemo(() =>
    (controller.plantPAxBlocks ?? []).filter(b => b.plantPAxDataType === selectedType).length,
    [controller.plantPAxBlocks, selectedType]
  );

  const handleDownload = async () => {
    if (!l5xFile || !selectedType) return;
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('file',      l5xFile);
      form.append('dataType',  selectedType);
      form.append('direction', direction);

      const res = await fetch('/api/l5x/plantpax-param-report', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Server error ${res.status}`);
      }

      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      a.download     = `PlantPAx_${selectedType}_${direction}_report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (availableTypes.length === 0) {
    return (
      <div style={{ color: '#999', fontSize: '0.85rem', padding: '0.5rem' }}>
        No PlantPAx FBD Block nodes found — upload a file with PlantPAx Tasking Model enabled.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 560 }}>

      <div>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#1e3a5f' }}>
          PlantPAx Parameter Report
        </h3>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>
          Select a DataType and parameter direction to generate a wiring cross-reference CSV.
        </p>
      </div>

      {/* ── Dropdown 1: DataType ── */}
      <div>
        <label style={labelStyle}>
          1. Select PlantPAx DataType
        </label>
        <select
          value={selectedType}
          onChange={e => { setSelectedType(e.target.value); setDirection('All'); setError(null); }}
          style={selectStyle}
        >
          <option value="">— choose a DataType —</option>
          {availableTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Tag/block count badge */}
        {selectedType && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '0.4rem',
            padding: '0.2rem 0.6rem',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 20,
            fontSize: '0.78rem',
            color: colors.text,
            fontWeight: 600,
          }}>
            {selectedType} — {blockCount} block(s) found
          </div>
        )}
      </div>

      {/* ── Dropdown 2: Direction — only active after DataType selected ── */}
      <div>
        <label style={{ ...labelStyle, color: selectedType ? '#374151' : '#aaa' }}>
          2. Select Parameter Direction
        </label>
        <select
          value={direction}
          onChange={e => { setDirection(e.target.value as Direction); setError(null); }}
          disabled={!selectedType}
          style={{ ...selectStyle, opacity: selectedType ? 1 : 0.5, cursor: selectedType ? 'pointer' : 'not-allowed' }}
        >
          <option value="All">All (Input + Output)</option>
          <option value="Input">Input only  (Inp_, Cfg_, PSet_, PCmd_, XCmd_)</option>
          <option value="Output">Output only (Out_, Sts_, XRdy_, Val_)</option>
        </select>
      </div>

      {/* ── Error message ── */}
      {error && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 5,
          color: '#b91c1c',
          fontSize: '0.82rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Download button ── */}
      <button
        onClick={handleDownload}
        disabled={!selectedType || !l5xFile || loading}
        style={{
          padding: '0.55rem 1.25rem',
          background: (!selectedType || !l5xFile || loading) ? '#94a3b8' : '#1e3a5f',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: (!selectedType || !l5xFile || loading) ? 'not-allowed' : 'pointer',
          fontWeight: 700,
          fontSize: '0.88rem',
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {loading ? '⏳ Generating…' : '⬇️ Download CSV'}
      </button>

      {/* ── Help text ── */}
      {selectedType && (
        <div style={{
          padding: '0.6rem 0.75rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          fontSize: '0.78rem',
          color: '#64748b',
          lineHeight: 1.6,
        }}>
          <strong>CSV columns:</strong> Program · Routine · Sheet · Block_Type ·
          PlantPAx_DataType · Operand · Param_Name · Param_DataType · Direction · xRef_Operand
          <br />
          <strong>Wire tracing:</strong> Input params follow wires <em>into</em> the block ·
          Output params follow wires <em>out of</em> the block
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.35rem',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#374151',
  textTransform: 'uppercase',
  letterSpacing: 0.4,
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.45rem 0.65rem',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  fontSize: '0.85rem',
  color: '#1e293b',
  background: '#fff',
  cursor: 'pointer',
};