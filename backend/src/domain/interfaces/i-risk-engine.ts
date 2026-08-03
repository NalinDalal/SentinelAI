export interface RiskScoreInput {
  llmScore?: number;
  urlScore?: number;
  ocrScore?: number;
  htmlScore?: number;
  brandScore?: number;
}

export interface RiskScoreResult {
  finalScore: number;
  breakdown: Record<string, number>;
  weights: Record<string, number>;
  verdict: 'safe' | 'suspicious' | 'phishing' | 'high-risk';
  confidence: number;
}

export interface IRiskEngine {
  calculate(scores: RiskScoreInput): RiskScoreResult;
}