import { ControllerNode } from '../types/L5XTypes';
import { TreeNode } from './TreeNode';

interface Props {
  data: ControllerNode;
}

export function TreeView({ data }: Props) {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
      <TreeNode label={`Controller: ${data.name}`} icon="🖥️" defaultOpen>

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