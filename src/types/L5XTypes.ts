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

// ── NEW ───────────────────────────────────────────────────────────────────────
export interface PlantPAxTag {
  name: string;
  dataType: string;
  scope: string;
  description: string;
}

export interface ControllerNode {
  name: string;
  isPlantPAxTaskingModelEnabled: boolean;  // ← To identify if PlantPAx Tasking Mode is Enabled
  tasks: TaskNode[];
  programs: ProgramNode[];
  addOnInstructions: AoiNode[]; // ← To list AOI Instructions
  plantPAxTags: PlantPAxTag[];    // ← PlantPAx tags used on embeded instructions for new controller firmware
}