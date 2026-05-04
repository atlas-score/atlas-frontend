export type OntologicalScale = 'Nano' | 'Micro' | 'Intermediate' | 'Macro' | 'Meta';

export interface SubscaleBlock {
  score: number;
  label: string;
  justification: string;
  closure_status?: string;
  counted_in_composite?: boolean;
}

export interface ScoreCalculation {
  raw_ets: number;
  raw_ses: number;
  raw_eis: number;
  rule_applied: string;
  ses_counted?: boolean;
  eis_counted?: boolean;
  final_score: number;
}

export interface OverrideStatus {
  negative_override_applied: boolean;
  closure_override_applied: boolean;
}

export interface AdditionalAnalysis {
  scientific_significance: string | null;
  mechanistic_closure_analysis: string | null;
  mechanistic_development_status: string | null;
  evidentiary_accessibility: string | null;
  debunking_evidence_summary: string | null;
  scientific_scope_clarification: string | null;
  contextual_impact_analysis: string | null;
  boundary_between_theory_and_speculation: string | null;
}

export interface EvaluationMetadata {
  atlas_version?: string;
  evaluation_date?: string;
  evaluator?: string;
  is_extended_analysis?: boolean;
  tags?: string[];
}

export interface AtlasEvaluation {
  id: string;
  framework_name: string;
  specific_claim: string;
  framework_status: string;
  claim_type: string;
  framework_description: string;
  context_of_validity: string;
  domains_of_inquiry: string[];
  ontological_scales: OntologicalScale[];
  ets: SubscaleBlock;
  ses: SubscaleBlock;
  eis: SubscaleBlock;
  composite_score: number;
  score_calculation: ScoreCalculation;
  override_status: OverrideStatus;
  interpretation: string;
  additional_analysis: AdditionalAnalysis;
  metadata?: EvaluationMetadata;
}

export interface ExamplesFeed {
  schema_version: string;
  description: string;
  examples: AtlasEvaluation[];
}
