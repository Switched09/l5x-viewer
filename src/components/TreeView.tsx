import { ControllerNode } from '../types/L5XTypes';
import { TreeNode } from './TreeNode';

interface Props {
  data: ControllerNode;
}

function PlantPAxLed({ enabled }: { enabled: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      margin: '0.4rem 0 0.75rem 0.5rem',
      padding: '0.3rem 0.6rem',
      background: enabled ? '#f0fdf4' : '#f9fafb',
      border: `1px solid ${enabled ? '#86efac' : '#e5e7eb'}`,
      borderRadius: 6,
      width: 'fit-content',
    }}>
      {/* LED circle */}
      <span style={{
        display: 'inline-block',
        width: 11,
        height: 11,
        borderRadius: '50%',
        background: enabled ? '#22c55e' : '#d1d5db',
        boxShadow: enabled ? '0 0 6px 2px #4ade80' : 'none',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: '0.78rem',
        fontWeight: 600,
        color: enabled ? '#15803d' : '#9ca3af',
        letterSpacing: 0.2,
      }}>
        PlantPAx Tasking Model
      </span>
    </div>
  );
}

export function TreeView({ data }: Props) {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
      <TreeNode label={`Controller: ${data.name}`} icon="🖥️" defaultOpen>

        {/* PlantPAx LED indicator */}
        <PlantPAxLed enabled={data.isPlantPAxTaskingModelEnabled} />

        <TreeNode label="Tasks" icon="📋" defaultOpen>
          {data.tasks.map(task => (
            <TreeNode
              key={task.name}
              label={`${task.name} (${task.type})`}
              icon="⚙️"
              defaultOpen
            >
              {task.scheduledPrograms.map(prog => (
                <TreeNode key={prog} label={prog} icon="📌" />
              ))}
            </TreeNode>
          ))}
        </TreeNode>

        <TreeNode label="Programs" icon="📁" defaultOpen>
          {data.programs.map(program => (
            <TreeNode key={program.name} label={program.name} icon="📄" defaultOpen>
              <TreeNode label="Routines" icon="🔧" defaultOpen>
                {program.routines.map(routine => (
                  <TreeNode
                    key={routine.name}
                    label={`${routine.name} (${routine.type})`}
                    icon="📝"
                  />
                ))}
              </TreeNode>
            </TreeNode>
          ))}
        </TreeNode>

      </TreeNode>
    </div>
  );
}