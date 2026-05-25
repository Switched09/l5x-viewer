export interface RoutineNode {
  name: string;
  type: string;
}

export interface ProgramNode {
  name: string;
  routines: RoutineNode[];
}

export interface TaskNode {
  name: string;
  type: string;
  scheduledPrograms: string[];
}

// ── NEW FOR AOI ──────────────────────────────────────────
export interface AoiParameter {
  name: string;
  usage: string;
  dataType: string;
  description: string;
}
export interface AoiNode {
  name: string;
  revision: string;
  description: string;
  parameters: AoiParameter[];
}
// ─────────────────────────────────────────────────────────
export interface ControllerNode {
  name: string;
  tasks: TaskNode[];
  programs: ProgramNode[];
  addOnInstructions: AoiNode[]; // ← NEW
}