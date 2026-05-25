import { useState, useMemo } from 'react';
import { AoiNode } from '../types/L5XTypes';

interface Props {
  aoiList: AoiNode[];
  selectedAoi: AoiNode | null;
  onSelect: (aoi: AoiNode) => void;
}

export function AoiList({ aoiList, selectedAoi, onSelect }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    aoiList.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase())
    ),
    [aoiList, search]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#333' }}>
        Add-On Instructions ({aoiList.length})
      </h3>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
        <input
          type="text"
          placeholder="Search AOI..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '0.35rem 0.5rem',
            border: '1px solid #ccc',
            borderRadius: 4,
            fontSize: '0.85rem',
          }}
        />
        <button
          onClick={() => setSearch('')}
          disabled={search === ''}
          style={{
            padding: '0.35rem 0.7rem',
            border: '1px solid #ccc',
            borderRadius: 4,
            background: search ? '#f0f0f0' : '#fafafa',
            cursor: search ? 'pointer' : 'default',
            fontSize: '0.85rem',
          }}
        >
          Clear
        </button>
      </div>

      {/* AOI list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        border: '1px solid #ddd',
        borderRadius: 4,
        background: '#fff',
      }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '0.5rem', color: '#999', fontSize: '0.85rem' }}>
            No AOI found.
          </p>
        ) : (
          filtered.map(aoi => (
            <div
              key={aoi.name}
              onClick={() => onSelect(aoi)}
              title={aoi.description || aoi.name}
              style={{
                padding: '0.45rem 0.7rem',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                background: selectedAoi?.name === aoi.name ? '#dbeafe' : 'transparent',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{aoi.name}</span>
              <span style={{ color: '#999', fontSize: '0.75rem' }}>
                v{aoi.revision}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}