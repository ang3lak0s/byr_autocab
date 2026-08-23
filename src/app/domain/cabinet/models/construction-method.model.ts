export type JointStrengthRating = 'Moderate' | 'High' | 'Airtight & Rigid' | 'Maximum Tone & Rigidity';
export type AssemblySpeedRating = 'Ultra Fast' | 'Fast' | 'Standard' | 'Precision Alignment';
export type ToolingComplexityRating = 'Basic Tools (Hand/Drill)' | 'Intermediate (Table Saw/Router)' | 'Advanced Woodshop';

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
