import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { TreeView } from './components/TreeView';
import { AoiList } from './components/AoiList';
import { AoiParameters } from './components/AoiParameters';
import { ControllerNode, AoiNode } from './types/L5XTypes';

function App() {
  const [data, setData] = useState<ControllerNode | null>(null);
  const [selectedAoi, setSelectedAoi] = useState<AoiNode | null>(null);

  const handleParsed = (parsed: ControllerNode) => {
    setData(parsed);
    setSelectedAoi(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>

      {/* ── Top bar ── */}
      <div style={{
        padding: '0.75rem 1.5rem',
        background: '#1e3a5f',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexShrink: 0,
      }}>
        <h1 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: 1 }}>
          L5X Program Web Viewer
        </h1>
        <FileUploader onParsed={handleParsed} />
      </div>

      {/* ── Main content ── */}
      {!data ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          Upload a .L5X file to get started.
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* LEFT PANE — Tree View */}
          <div style={{
            width: '300px',
            minWidth: '200px',
            borderRight: '1px solid #ddd',
            overflowY: 'auto',
            padding: '1rem',
            background: '#fafafa',
          }}>
            <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', textTransform: 'uppercase', color: '#666', letterSpacing: 1 }}>
              Program Structure
            </h2>
            <TreeView data={data} />
          </div>

          {/* RIGHT PANE — AOI panels stacked vertically */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '1rem',
            gap: '1rem',
          }}>

            {/* TOP-RIGHT — AOI searchable list */}
            <div style={{ flex: '0 0 40%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <AoiList
                aoiList={data.addOnInstructions}
                selectedAoi={selectedAoi}
                onSelect={setSelectedAoi}
              />
            </div>

            {/* DIVIDER */}
            <div style={{ height: 1, background: '#e5e7eb', flexShrink: 0 }} />

            {/* BOTTOM-RIGHT — AOI parameter table */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <AoiParameters aoi={selectedAoi} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;