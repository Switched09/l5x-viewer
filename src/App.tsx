import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { TreeView } from './components/TreeView';
import { AoiList } from './components/AoiList';
import { AoiParameters } from './components/AoiParameters';
import { ReportPanel } from './components/ReportPanel';
import { PlantPAxDataTypes } from './components/PlantPAxDataTypes';
import { ControllerNode, AoiNode } from './types/L5XTypes';
import { PlantPAxReportPanel } from './components/PlantPAxReportPanel';


// type RightTab = 'aoi' | 'report' | 'plantpax';
type RightTab = 'aoi' | 'plantpax' | 'report' | 'plantpax-report';


function App() {

  
  const [data, setData]               = useState<ControllerNode | null>(null);
  const [l5xFile, setL5xFile]         = useState<File | null>(null);
  const [selectedAoi, setSelectedAoi] = useState<AoiNode | null>(null);
  const [activeTab, setActiveTab]     = useState<RightTab>('aoi');

  const handleParsed = (parsed: ControllerNode, file: File) => {
    setData(parsed);
    setL5xFile(file);
    setSelectedAoi(null);
    setActiveTab('aoi');
  };

  // Build tab list dynamically — PlantPAx tab only shown when enabled
  const tabs = [
  { key: 'aoi'            as RightTab, label: '🔍 AOI Browser',             show: true },
  { key: 'report'         as RightTab, label: '📊 AOI Report',              show: true },
  { key: 'plantpax'       as RightTab, label: '🌿 PlantPAx Active DataTypes', show: !!data?.isPlantPAxTaskingModelEnabled },
  { key: 'plantpax-report' as RightTab, label: '📋 PlantPAx Report',        show: !!data?.isPlantPAxTaskingModelEnabled },
].filter(t => t.show);

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
          L5X Program Viewer
        </h1>
        <FileUploader onParsed={handleParsed} />
        {l5xFile && (
          <span style={{ fontSize: '0.78rem', opacity: 0.75 }}>
            📄 {l5xFile.name}
          </span>
        )}
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
            width: 300,
            minWidth: 180,
            borderRight: '1px solid #ddd',
            overflowY: 'auto',
            padding: '1rem',
            background: '#fafafa',
            flexShrink: 0,
          }}>
            <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: '#666', letterSpacing: 1 }}>
              Program Structure
            </h2>
            <TreeView data={data} />
          </div>

          {/* RIGHT PANE — Tabbed */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', background: '#f9fafb', flexShrink: 0 }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? '2px solid #1e3a5f' : '2px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab.key ? 700 : 400,
                    color: activeTab === tab.key ? '#1e3a5f' : '#666',
                    fontSize: '0.88rem',
                    marginBottom: -2,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem' }}>

              {activeTab === 'aoi' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                  <div style={{ flex: '0 0 42%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <AoiList aoiList={data.addOnInstructions} selectedAoi={selectedAoi} onSelect={setSelectedAoi} />
                  </div>
                  <div style={{ height: 1, background: '#e5e7eb', flexShrink: 0 }} />
                  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <AoiParameters aoi={selectedAoi} />
                  </div>
                </div>
              )}

              {activeTab === 'plantpax' && (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <PlantPAxDataTypes tags={data.plantPAxTags} />
                </div>
              )}
              {activeTab === 'plantpax-report' && (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <PlantPAxReportPanel controller={data} l5xFile={l5xFile} />
                </div>
              )}
              {activeTab === 'report' && (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <ReportPanel aoiList={data.addOnInstructions} l5xFile={l5xFile} />
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;