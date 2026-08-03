import { Injectable } from '@nestjs/common';
import { IRiskEngine, RiskScoreInput, RiskScoreResult } from '../../domain/interfaces/i-risk-engine';

@Injectable()
export class RiskEngineService implements IRiskEngine {
  private readonly weights = {
    llm: 0.35,
    url: 0.2,
    ocr: 0.15,
    html: 0.2,
    brand: 0.1,
  };

  calculate(scores: RiskScoreInput): RiskScoreResult {
    const breakdown: Record<string, number> = {};
    let weightedSum = 0;
    let totalWeight = 0;

    if (scores.llmScore !== undefined) {
      breakdown.llm = scores.llmScore;
      weightedSum += scores.llmScore * this.weights.llm;
      totalWeight += this.weights.llm;
    }

    if (scores.urlScore !== undefined) {
      breakdown.url = scores.urlScore;
      weightedSum += scores.urlScore * this.weights.url;
      totalWeight += this.weights.url;
    }

    if (scores.ocrScore !== undefined) {
      breakdown.ocr = scores.ocrScore;
      weightedSum += scores.ocrScore * this.weights.ocr;
      totalWeight += this.weights.ocr;
    }

    if (scores.htmlScore !== undefined) {
      breakdown.html = scores.htmlScore;
      weightedSum += scores.htmlScore * this.weights.html;
      totalWeight += this.weights.html;
    }

    if (scores.brandScore !== undefined) {
      breakdown.brand = scores.brandScore;
      weightedSum += scores.brandScore * this.weights.brand;
      totalWeight += this.weights.brand;
    }

    const finalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight * 100) : 0;
    const clampedScore = Math.min(100, Math.max(0, finalScore));

    let verdict: RiskScoreResult['verdict'];
    if (clampedScore >= 70) verdict = 'high-risk';
    else if (clampedScore >= 50) verdict = 'phishing';
    else if (clampedScore >= 25) verdict = 'suspicious';
    else verdict = 'safe';

    const confidence = this.calculateConfidence(breakdown, totalWeight);

    return {
      finalScore: clampedScore,
      breakdown,
      weights: this.weights,
      verdict,
      confidence,
    };
  }

  private calculateConfidence(breakdown: Record<string, number>, totalWeight: number): number {
    if (totalWeight === 0) return 0;
    const values = Object.values(breakdown);
    if (values.length === 0) return 0;
    const variance = this.calculateVariance(values);
    const maxVariance = 2500;
    return Math.max(0.1, Math.min(1, 1 - variance / maxVariance));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }
}