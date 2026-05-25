import { useState, ReactNode } from 'react';

interface Props {
  label: string;
  icon?: string;
  children?: ReactNode;
  defaultOpen?: boolean;
}

export function TreeNode({ label, icon, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!children;

  return (
    <div style={{ marginLeft: '1rem' }}>
      <div
        onClick={() => hasChildren && setOpen(!open)}
        style={{
          cursor: hasChildren ? 'pointer' : 'default',
          padding: '2px 4px',
          borderRadius: 4,
          userSelect: 'none',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        {hasChildren && (
          <span style={{ fontSize: '0.7rem', color: '#888' }}>
            {open ? '▼' : '▶'}
          </span>
        )}
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </div>
      {open && children && (
        <div style={{ borderLeft: '1px dashed #ccc', marginLeft: '0.5rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}