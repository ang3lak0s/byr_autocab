export type JointStrengthRating = 'Moderate' | 'High' | 'Airtight & Rigid' | 'Maximum Tone & Rigidity' | string;
export type AssemblySpeedRating = 'Ultra Fast' | 'Fast' | 'Standard' | 'Precision Alignment' | string;
export type ToolingComplexityRating = 'Basic Tools (Hand/Drill)' | 'Intermediate (Table Saw/Router)' | 'Advanced Woodshop' | string;

export interface ConstructionMethod {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  jointType: string;
  toolingRequired: string[];
  advantages: string[];
  considerations: string[];
  jointStrength: JointStrengthRating;
  assemblySpeed: AssemblySpeedRating;
  toolingComplexity: ToolingComplexityRating;
  fastenerType: string;
  typicalApplication: string;
  isPopular?: boolean;
}
