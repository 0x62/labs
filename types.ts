export interface ProjectileState {
  u: number | null; // Initial Velocity (m/s)
  theta: number | null; // Angle (degrees)
  y0: number | null; // Initial Height (m)
  range: number | null; // Range (m)
  maxHeight: number | null; // Max Height (m)
  flightTime: number | null; // Time of Flight (s)
}

export interface SolvedVariables {
  u: number;
  theta: number;
  y0: number;
  range: number;
  maxHeight: number;
  flightTime: number;
  ux: number;
  uy: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  t: number;
}

export type VariableKey = 'u' | 'theta' | 'y0' | 'range' | 'maxHeight' | 'flightTime';

export interface Step {
  explanation: string;
  latex?: string;
}

export interface HintData {
  variable: VariableKey;
  steps: Step[];
  currentStepIndex: number;
}